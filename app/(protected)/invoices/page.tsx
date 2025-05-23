"use client";

import { useState, useEffect } from "react";
import {
  QrCode,
  Search,
  CalendarIcon,
  ChevronDown,
  Loader2,
  PlusCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import Link from "next/link";
import { CurrencyData, Invoice } from "@/types/types";
import QRCodeModal from "@/components/common/qr-code-modal";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";
import countryCurrencyMapping from "@/constants/country_currency_mapping.json";
import Image from "next/image";
import { convertFromUsdc } from "@/utils";

export default function InvoicesPage() {
  const router = useRouter();

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // State for QR code modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // State for invoice data
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [localCurrency, setLocalCurrency] = useState<CurrencyData>({
    code: "USD",
    flag: null,
  });

  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Filter invoices based on search, date and status
  const filteredInvoices = invoices.filter((invoice) => {
    // Search filter
    const matchesSearch =
      invoice.invoiceNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter
    const matchesDate = dateFilter
      ? format(invoice.dueDate, "yyyy-MM-dd") === dateFilter
      : true;

    // Create today's date with time set to midnight
    const today = new Date();
    const todayWithoutTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Status filter with special handling for "overdue"
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "overdue") {
      // For overdue, find pending invoices with due dates in the past
      matchesStatus =
        invoice.status === "pending" && invoice.dueDate < todayWithoutTime;
    } else {
      // Normal status matching for paid and pending
      matchesStatus = invoice.status === statusFilter;
    }

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Handle QR code click
  const handleQrCodeClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  // Handle copy to clipboard
  const handleCopyLink = () => {
    if (selectedInvoice) {
      navigator.clipboard.writeText(selectedInvoice.paymentLink);
      // add a toast notification here
      alert("Payment link copied to clipboard");
    }
  };

  // Handle share
  const handleShare = async () => {
    if (selectedInvoice && navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${selectedInvoice.invoiceNumber}`,
          text: `Payment link for invoice ${selectedInvoice.invoiceNumber}`,
          url: selectedInvoice.paymentLink,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback if Web Share API is not available
      handleCopyLink();
    }
  };

  // Fetch invoices from Firestore
  useEffect(() => {
    setIsLoading(true);

    // Get the current authenticated user first
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User not logged in, redirect to login page
        router.push("/login");
        return;
      }

      // Now we have the user ID, create a query filtered by merchantId
      const invoicesRef = collection(db, "invoices");
      const q = query(invoicesRef, where("merchantId", "==", user.uid));

      // Set up the real-time listener on the filtered query
      const invoiceUnsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const invoicesData: Invoice[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();

            const rawDueDate = new Date(data.dueDate);

            // Create a date with only year, month, day components
            const dueDate = new Date(
              rawDueDate.getFullYear(),
              rawDueDate.getMonth(),
              rawDueDate.getDate()
            );

            invoicesData.push({
              id: doc.id,
              invoiceNumber: data.invoiceNumber,
              customerName: data.customerName,
              amount: parseFloat(data.amount),
              dueDate: dueDate,
              status: data.status,
              paymentLink: `${window.location.origin}/pay/${data.invoiceNumber}`,
              merchantId: data.merchantId,
              merchantName: data.merchantName,
              merchantAddress: data.merchantAddress,
              paidAt: data?.paidAt,
            });
          });

          setInvoices(invoicesData);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error listening to invoices:", error);
          setError("Failed to load invoices. Please try again later.");
          setIsLoading(false);
        }
      );

      // Return cleanup function that unsubscribes from both listeners
      return () => {
        invoiceUnsubscribe();
        authUnsubscribe();
      };
    });

    // The dependency array can remain empty if router doesn't need to be a dependency
  }, [router]);

  // load the currency data from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedCountry = sessionStorage.getItem("country");
        const storedFlag = sessionStorage.getItem("countryFlag");

        let currencyCode = "USD"; // Default

        // First try to get currency from country name
        if (storedCountry) {
          const mappedCurrency = (
            countryCurrencyMapping as Record<string, string>
          )[storedCountry];
          if (mappedCurrency) {
            currencyCode = mappedCurrency;
          }
        }

        if (storedFlag) {
          setLocalCurrency({
            code: currencyCode,
            flag: JSON.parse(storedFlag),
          });

          setSelectedCurrency(currencyCode);

          // Store the currency code in session storage for later use
          sessionStorage.setItem("countryCurrencyCode", currencyCode);
        }
      } catch (error) {
        console.error("Error loading currency data:", error);
      }
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-900 mb-3 sm:mb-0">
          Invoices
        </h1>

        <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center">
          {/* currency selector */}
          <div className="flex flex-row w-full sm:w-auto bg-white border border-gray-200 rounded shadow p-0.5">
            <button
              onClick={() => setSelectedCurrency("USDC")}
              className={`flex flex-1 items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                selectedCurrency === "USDC"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              aria-current={selectedCurrency === "USDC"}
            >
              <Image
                src="https://www.cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040"
                width={20}
                height={20}
                alt="USDC Logo"
              />
              <span className="ml-2">USDC</span>
            </button>

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
              className={`flex flex-1 items-center justify-center px-3 py-2 text-sm font-medium rounded-md ml-0.5 transition-colors hover:cursor-pointer ${
                selectedCurrency === localCurrency.code
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              aria-current={selectedCurrency === localCurrency.code}
              disabled={selectedCurrency === localCurrency.code}
            >
              {localCurrency.flag && (
                <span className="mr-2">{localCurrency.flag.emoji}</span>
              )}
              <span>{localCurrency.code}</span>
            </button>
          </div>

          {/* Create invoice button */}
          <div className="w-full sm:w-auto sm:ms-2">
            <Link
              href="/invoices/create"
              className="flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* Filters section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* No invoices state */}
      {invoices.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-50 flex items-center justify-center rounded-full mb-4">
            <FileText className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No invoices yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start creating invoices to keep track of your payments and get paid
            faster.
          </p>
          <Link
            href="/invoices/create"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your First Invoice
          </Link>
        </div>
      ) : (
        /* Invoices table - remains mostly the same, just update references */
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Invoice ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount ({selectedCurrency})</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="bg-white border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">{invoice.customerName}</td>
                    <td className="px-6 py-4">
                      {selectedCurrency === "USDC" ? (
                        <>{invoice.amount.toFixed(3)}</>
                      ) : (
                        <>
                          {convertFromUsdc(
                            invoice.amount,
                            selectedCurrency
                          )?.toFixed(3)}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        // Create today's date with time set to midnight for comparison
                        const today = new Date();
                        const todayWithoutTime = new Date(
                          today.getFullYear(),
                          today.getMonth(),
                          today.getDate()
                        );

                        // Determine if a pending invoice should be displayed as overdue
                        const isOverdue =
                          invoice.status === "pending" &&
                          invoice.dueDate < todayWithoutTime;
                        const displayStatus = isOverdue
                          ? "overdue"
                          : invoice.status;

                        return (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              displayStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : displayStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {displayStatus.charAt(0).toUpperCase() +
                              displayStatus.slice(1)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleQrCodeClick(invoice)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Show QR Code"
                      >
                        <QrCode className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No invoices found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal */}
      {isModalOpen && selectedInvoice && (
        <QRCodeModal
          onClose={() => setIsModalOpen(false)}
          invoice={selectedInvoice}
          onCopyLink={() => handleCopyLink()}
          onShare={() => handleShare()}
        />
      )}
    </div>
  );
}
