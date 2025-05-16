"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  User,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { useAccount } from "wagmi";
import countryCurrencyMapping from "@/constants/country_currency_mapping.json";
import { convertToUsdc } from "@/utils";
import Image from "next/image";
import { CurrencyData } from "@/types/types";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function CreateInvoicePage() {
  const router = useRouter();
  const { address } = useAccount();

  const [formData, setFormData] = useState({
    customerName: "",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0], // Default to today
  });
  const [generatedInvoiceNumber, setGeneratedInvoiceNumber] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Currency state
  const [localCurrency, setLocalCurrency] = useState<CurrencyData>({
    code: "USD",
    flag: null,
  });
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");

  // USDC equivalent state
  const [usdcEquivalent, setUsdcEquivalent] = useState<number | null>(null);

  // Function to generate a unique invoice number
  const generateInvoiceNumber = async () => {
    try {
      // Check the most recent invoice to create an incremented number
      const invoicesRef = collection(db, "invoices");
      const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      let nextNumber = 1;

      if (!querySnapshot.empty) {
        // Get the last invoice number and increment
        const lastInvoice = querySnapshot.docs[0].data();
        const lastInvoiceNumber = lastInvoice.invoiceNumber || "";

        // Extract the numeric part if it follows the pattern INV-XXXX
        const match = lastInvoiceNumber.match(/INV-(\d+)/);
        if (match && match[1]) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }

      // Format the number with leading zeros (e.g., INV-0001)
      const formattedNumber = `INV-${nextNumber.toString().padStart(4, "0")}`;
      setGeneratedInvoiceNumber(formattedNumber);
    } catch (error) {
      console.error("Error generating invoice number:", error);
      // Fallback to timestamp-based number if there's an error
      const timestamp = Date.now();
      setGeneratedInvoiceNumber(`INV-${timestamp.toString().slice(-8)}`);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (
      isNaN(parseFloat(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = "Amount must be a valid positive number";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Create a new invoice object with the generated invoice number
      const newInvoice = {
        invoiceNumber: generatedInvoiceNumber,
        customerName: formData.customerName,
        amount: usdcEquivalent,
        dueDate: new Date(formData.dueDate).toISOString(),
        createdAt: new Date().toISOString(),
        status: "pending",
        merchantId: auth.currentUser?.uid,
        merchantName: auth.currentUser?.displayName,
        merchantAddress: address,
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, "invoices"), newInvoice);

      console.log("Invoice created with ID: ", docRef.id);

      // Success message
      setSubmitStatus({
        type: "success",
        message: `Invoice ${generatedInvoiceNumber} created successfully!`,
      });

      // Reset form after successful submission
      setFormData({
        customerName: "",
        amount: "",
        dueDate: new Date().toISOString().split("T")[0],
      });

      // Generate a new invoice number for the next entry
      generateInvoiceNumber();

      // Redirect to invoices list after a delay
      setTimeout(() => {
        router.push("/invoices");
      }, 2000);
    } catch (error) {
      console.error("Error creating invoice:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to create invoice. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate invoice number when component mounts
  useEffect(() => {
    generateInvoiceNumber();
  }, []);

  // Calculate USDC equivalent whenever amount or currency changes
  useEffect(() => {
    if (formData.amount && !isNaN(parseFloat(formData.amount))) {
      const amount = parseFloat(formData.amount);
      const usdcValue = convertToUsdc(amount, selectedCurrency);
      setUsdcEquivalent(usdcValue);
    } else {
      setUsdcEquivalent(null);
    }
  }, [formData.amount, selectedCurrency]);

  // Add wallet connection check at the top
  if (!address) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center pb-4">
          <ArrowLeft className="text-indigo-600" />
          <button
            onClick={() => router.push("/invoices")}
            className="text-sm text-indigo-600 hover:cursor-pointer mx-3"
          >
            Back to Invoices
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Wallet Connection Required
          </h3>
          <div className="mb-6">
            <p className="text-gray-600">
              To create an invoice, you need to connect your digital wallet
              first. This ensures your invoices can be paid directly to your
              wallet address.
            </p>
          </div>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center  pb-4">
        <ArrowLeft className="text-indigo-600" />
        <button
          onClick={() => router.push("/invoices")}
          className="text-sm text-indigo-600 hover:cursor-pointer mx-3"
        >
          Back to Invoices
        </button>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>

        {/* Enhanced currency selector */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm p-0.5 ">
          {localCurrency.code !== "USD" && (
            <button
              onClick={() => setSelectedCurrency("USD")}
              className={`flex flex-1 items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                selectedCurrency === "USD"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              aria-current={selectedCurrency === "USD"}
            >
              <span className="mr-2">$</span>
              <span>USD</span>
            </button>
          )}

          <button
            onClick={() => setSelectedCurrency(localCurrency.code)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ml-0.5 transition-colors hover:cursor-pointer ${
              selectedCurrency !== "USD"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            aria-current={selectedCurrency !== "USD"}
            disabled={localCurrency.code === "USD"}
          >
            {localCurrency.flag && (
              <span className="mr-2">{localCurrency.flag.emoji}</span>
            )}
            <span>{localCurrency.code}</span>
          </button>
        </div>
      </div>

      {/* Status messages */}
      {submitStatus.type && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            submitStatus.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {submitStatus.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <p>{submitStatus.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Auto-generated Invoice Number (read-only) */}
            <div>
              <label
                htmlFor="invoiceNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Invoice Number (Auto-generated)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="invoiceNumber"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 cursor-not-allowed focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  value={generatedInvoiceNumber}
                  readOnly
                />
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Customer Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  className={`bg-white border ${
                    errors.customerName ? "border-red-300" : "border-gray-300"
                  } text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`}
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Customer or Company Name"
                />
              </div>
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customerName}
                </p>
              )}
            </div>

            {/* Amount with Currency Toggle */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount ({selectedCurrency})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {selectedCurrency === "USD" ? (
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  ) : (
                    <div className="flex items-center space-x-1">
                      {localCurrency.flag && (
                        <span className="text-base text-gray-400">
                          {localCurrency.flag.emoji}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  className={`bg-white border ${
                    errors.amount ? "border-red-300" : "border-gray-300"
                  } text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`}
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}

              {/* USDC Equivalent Display - Improved UI */}
              {!errors.amount &&
                formData.amount &&
                !isNaN(parseFloat(formData.amount)) && (
                  <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center">
                      {/* USDC logo */}
                      <Image
                        src="https://www.cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040"
                        width={50}
                        height={50}
                        alt="USDC Logo"
                      />

                      {/* USDC Amount Info */}
                      <div className="flex-grow ms-3">
                        <p className="text-xs font-medium text-gray-500">
                          You'll receive approximately
                        </p>
                        {usdcEquivalent !== null ? (
                          <p className="text-sm font-semibold text-gray-800">
                            {usdcEquivalent.toFixed(6)}{" "}
                            <span className="text-indigo-600">USDC</span>
                          </p>
                        ) : (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin rounded-full mr-2"></div>
                            <span className="text-gray-500 text-sm">
                              Calculating...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Due Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  className={`bg-white border ${
                    errors.dueDate ? "border-red-300" : "border-gray-300"
                  } text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`}
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Create Invoice"
              )}
            </button>
          </div>
        </form>
        <div className="mb-2 mx-3 w-48 p-2 bg-white  text-xs text-gray-600 ">
          USDC is a stablecoin pegged to the US dollar. This is the crypto
          amount you'll receive when the invoice is paid.
        </div>
      </div>
    </div>
  );
}
