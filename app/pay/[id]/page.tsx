"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useBalance, useWriteContract, useConfig } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { erc20Abi, parseUnits } from "viem";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import {  Invoice, IpApiResponse } from "@/types/types";
import { waitForTransactionReceipt } from "wagmi/actions";
import countryToFlagEmoji from "@/constants/countryFlags";

export default function PaymentPage() {
  const params = useParams();
  const { writeContract } = useWriteContract();
  const config = useConfig(); // Required for waitForTransactionReceipt
  const invoiceId = params.id as string;

  // State for invoice and payment
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null); // To store transaction hash

  const [flag, setFlag] = useState("");
  const [code, setCode] = useState("");

  const [usdcToUsd, setUsdcToUsd] = useState(1);

  const [usdToLocal, setUsdToLocal] = useState(1);

  // Wallet connection
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

  // Function to send USDC payment
  function sendUSDC() {
    if (!invoice || !address) return;

    setIsPaymentProcessing(true);
    setError(null);

    writeContract(
      {
        address: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [
          invoice.merchantAddress,
          parseUnits(invoice.amount.toString(), 6), // USDC uses 6 decimals
        ],
      },
      {
        onSuccess(hash) {
          console.log("Transaction submitted:", hash);
          setTxHash(hash); // Store the transaction hash
          setIsPaymentProcessing(false);
          setIsConfirming(true); // Show confirming state

          // Wait for transaction confirmation
          waitForTransactionReceipt(config, {
            hash,
          })
            .then((receipt) => {
              console.log("Transaction confirmed:", receipt);

              if (receipt.status === "success") {
                // Update invoice status in Firestore using query to match by invoiceNumber
                if (invoice) {
                  try {
                    // First, get the invoice document by invoiceNumber
                    const invoicesRef = collection(db, "invoices");
                    const q = query(
                      invoicesRef,
                      where("invoiceNumber", "==", invoice.invoiceNumber)
                    );
                    getDocs(q).then((querySnapshot) => {
                      if (!querySnapshot.empty) {
                        // Get the first matching document
                        const invoiceDoc = querySnapshot.docs[0];
                        const invoiceRef = doc(db, "invoices", invoiceDoc.id);

                        // Update the document
                        updateDoc(invoiceRef, {
                          status: "paid",
                          paidAt: new Date().toISOString(),
                          transactionHash: hash,
                        });
                        console.log("Invoice status updated to paid");
                      } else {
                        console.error("Could not find invoice to update");
                      }
                    });
                  } catch (err) {
                    console.error("Error updating invoice status:", err);
                  }
                }

                setPaymentSuccess(true);
              } else {
                setError(
                  "Transaction failed on the blockchain. Please try again."
                );
              }
            })
            .catch((error) => {
              console.error("Error waiting for transaction receipt:", error);
              setError(
                "Failed to confirm transaction. Please check your wallet for status."
              );
            })
            .finally(() => {
              setIsConfirming(false);
            });
        },
        onError(error: Error) {
          console.error("Payment failed:", error);
          const errorMsg = error.message || "";

          // Check for specific error types
          if (errorMsg.includes("User rejected the request")) {
            setError("You have denied the payment request.");
          } else if (errorMsg.includes("insufficient funds")) {
            setError(
              "Insufficient funds in your wallet to complete this payment."
            );
          } else if (errorMsg.includes("gas")) {
            setError("Not enough ETH to cover gas fees for this transaction.");
          } else if (errorMsg.includes("nonce")) {
            setError(
              "Transaction error: Please reset your wallet or try again."
            );
          } else if (
            errorMsg.includes("network") ||
            errorMsg.includes("disconnected")
          ) {
            setError(
              "Network connection issue. Please check your internet connection."
            );
          } else if (
            errorMsg.includes("allowance") ||
            errorMsg.includes("approve")
          ) {
            setError(
              "You need to approve USDC spending before making this payment."
            );
          } else if (
            errorMsg.includes("wrong chain") ||
            errorMsg.includes("network") ||
            errorMsg.includes("chain ID")
          ) {
            setError(
              "You're connected to the wrong network. Please switch to the correct network."
            );
          } else {
            setError("Payment failed. Please try again later.");
          }

          setIsPaymentProcessing(false);
        },
      }
    );
  }
  // Fetch invoice details from Firestore
  useEffect(() => {
    async function fetchInvoiceDetails() {
      setLoading(true);
      setError(null);

      try {
        // Create a query against the invoices collection
        const invoicesRef = collection(db, "invoices");
        const q = query(invoicesRef, where("invoiceNumber", "==", invoiceId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // No matching documents
          setError("Invoice not found. Please check the URL and try again.");
          setLoading(false);
          return;
        }

        // Use the first matching document (should be only one if invoiceNumber is unique)
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();

        const invoiceData: Invoice = {
          id: docSnap.id,
          invoiceNumber: data.invoiceNumber,
          customerName: data.customerName,
          amount: parseFloat(data.amount) || 0,
          dueDate: new Date(data.dueDate),
          status: data.status || "pending",
          paymentLink: `${window.location.origin}/pay/${data.invoiceNumber}`,
          merchantId: data.merchantId,
          merchantName: data.merchantName,
          merchantAddress: data.merchantAddress,
        };

        setInvoice(invoiceData);
      } catch (err) {
        console.error("Failed to fetch invoice:", err);
        setError("Failed to load invoice details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchInvoiceDetails();
  }, [invoiceId]);

  // fetch  data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/geo-location");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const apiData: IpApiResponse = await response.json();

        if (apiData.status !== "success") {
          throw new Error("API returned unsuccessful response");
        }

        const flagEmoji = countryToFlagEmoji[apiData.countryCode] || "🌐";

        setCode(apiData.currency);

        setFlag(flagEmoji);


        const [exchangeRateResponse, usdcRateResponse] = await Promise.all([
          fetch("/api/exchange-rates"),

          // USDC to USD conversion rate
          fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd"
          ),
        ]);

        if (!exchangeRateResponse.ok) {
          throw new Error(
            `Exchange rate API error! Status: ${exchangeRateResponse.status}`
          );
        }

        if (!usdcRateResponse.ok) {
          throw new Error(
            `USDC rate API error! Status: ${usdcRateResponse.status}`
          );
        }

        const exchangeRateData = await exchangeRateResponse.json();
        const usdcRateData = await usdcRateResponse.json();

        if (exchangeRateData.result !== "success") {
          throw new Error("Exchange rate API returned unsuccessful response");
        }

        if (!usdcRateData["usd-coin"] || !usdcRateData["usd-coin"].usd) {
          throw new Error("Invalid USDC rate response format");
        }

        const usdcToUsdRate = usdcRateData["usd-coin"].usd;
        const usdToLocalRate =
          exchangeRateData.conversion_rates[apiData.currency];

        setUsdcToUsd(usdcToUsdRate);
        setUsdToLocal(usdToLocalRate);
      } catch (error) {
        console.error("Error fetching geolocation data:", error);
      }
    }

    // Only run in the browser
    if (typeof window !== "undefined") {
      fetchData();
    }
  }, []);


  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-4 text-gray-600">Loading invoice details...</p>
      </div>
    );
  }

  // Show error state
  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        {/* Header with logo */}
        <div className="pb-6 flex items-center justify-center">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-5xl py-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Payne
            </span>
          </Link>
        </div>

        {/* Error card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 max-w-md w-full">
          {/* Error icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-6">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  error?.includes("insufficient funds")
                    ? "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    : error?.includes("wrong network")
                    ? "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                }
              />
            </svg>
          </div>

          {/* Error heading - customize based on error type */}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {error?.includes("insufficient funds")
              ? "Insufficient Balance"
              : error?.includes("denied")
              ? "Payment Cancelled"
              : error?.includes("wrong network")
              ? "Network Error"
              : error?.includes("gas")
              ? "Gas Fee Error"
              : error?.includes("allowance")
              ? "Approval Required"
              : "Payment Error"}
          </h2>

          {/* Error description */}
          <p className="text-center text-gray-600 mb-6">
            {error || "Invoice not found. Please check the URL and try again."}
          </p>

          <div className="space-y-3">
            {/* Conditional buttons based on error type */}

            {/* User rejected payment */}
            {error?.includes("denied the payment") && (
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 flex justify-center items-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>
            )}

            {/* Insufficient funds */}
            {error?.includes("insufficient funds") && (
              <div className="space-y-3">
                <a
                  href="https://app.uniswap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 flex justify-center items-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Get USDC on Uniswap
                </a>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-2.5 px-4 flex justify-center items-center rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </button>
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p>
                    Your wallet needs more USDC to complete this payment. Get
                    USDC from an exchange or Uniswap, then return to try again.
                  </p>
                </div>
              </div>
            )}

            {/* Wrong network */}
            {error?.includes("wrong network") && (
              <>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-2.5 px-4 flex justify-center items-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Switch Network & Try Again
                </button>
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p>
                    This payment requires Ethereum mainnet. Please open your
                    wallet and switch networks before trying again.
                  </p>
                </div>
              </>
            )}

            {/* Gas or allowance errors */}
            {(error?.includes("gas") || error?.includes("allowance")) && (
              <>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-2.5 px-4 flex justify-center items-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </button>
                {error?.includes("gas") && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <p>
                      You need ETH to pay for transaction gas fees. Add ETH to
                      your wallet before trying again.
                    </p>
                  </div>
                )}
                {error?.includes("allowance") && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <p>
                      You need to approve USDC spending first. When you try
                      again, confirm both the approval and payment transactions.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Generic error case - if no specific error matched */}
            {!error?.includes("denied the payment") &&
              !error?.includes("insufficient funds") &&
              !error?.includes("wrong network") &&
              !error?.includes("gas") &&
              !error?.includes("allowance") && (
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-2.5 px-4 flex justify-center items-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Go Back and Try Again
                </button>
              )}
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center p-4 print:bg-white print:p-0 print:items-start print:justify-start">
        <div className="pb-4 flex items-center justify-center print:justify-start print:pl-4">
          <Link href="/" className="flex items-center">
            <span className="text-5xl py-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 print:text-black print:bg-none print:text-3xl">
              Payne
            </span>
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-md w-full shadow-xl relative overflow-hidden print:shadow-none print:border-none print:rounded-none print:p-4 print:max-w-full">
          {/* Decorative elements (hidden on print) */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-green-100 rounded-full opacity-50 no-print"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full opacity-50 no-print"></div>

          {/* Checkmark that works in print too */}
          <div className="relative mb-8 flex justify-center print:static print:mb-4">
            <div className="absolute animate-ping h-16 w-16 rounded-full bg-green-100 opacity-50 no-print"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-lg print:bg-green-600 print:shadow-none">
              <Check className="h-8 w-8 text-white print:text-white" />
            </div>
          </div>

          {/* Receipt content */}
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4 print:text-left">
              Payment Complete!
            </h2>

            <div className="my-6 py-4 border-t border-b border-dashed border-gray-200 print:border-gray-400">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="text-xl font-bold text-gray-900">
                  ${invoice.amount}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500">Paid To:</span>
                <span className="font-medium text-gray-900">
                  {invoice.merchantName}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500">Invoice Number:</span>
                <span className="font-medium text-gray-900">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date().toDateString()}
                </span>
              </div>
            </div>

            {/* Transaction details */}
            {txHash && (
              <div className="mb-6 bg-indigo-50 rounded-lg p-3 text-xs print:bg-transparent print:p-0 print:text-sm print:mb-2">
                <div className="flex items-center mb-1">
                  <svg
                    className="h-4 w-4 text-indigo-500 mr-1 print:hidden"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium text-indigo-700 print:text-black">
                    Blockchain Verified
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 print:text-black">
                    Transaction ID:{" "}
                  </span>
                  <span className="font-mono text-indigo-600 break-all print:text-black">
                    {txHash}
                  </span>
                </div>
              </div>
            )}

            {/* Print button (hidden when printing) */}
            <div className="flex flex-col space-y-3 no-print">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 text-center font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Save Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main payment UI
  return (
    <div className="min-h-screen bg-gray-50 py-12 mx-4">
      <div className="pb-3 flex items-center justify-center">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-5xl py-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Payne
          </span>
        </Link>
      </div>
      {/*  confirmation status indicator */}
      {isConfirming && (
        <div className="max-w-md mx-auto mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
          <div className="flex items-center text-blue-700">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="font-medium">Transaction submitted!</span>
          </div>
          <p className="mt-1 text-sm text-blue-600">
            Waiting for blockchain confirmation. This may take a few moments.
          </p>
        </div>
      )}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <h1 className="text-xl font-semibold text-white">Invoice Payment</h1>
          <p className="text-indigo-100 mt-1">Complete your payment securely</p>
        </div>

        {/* Invoice Details */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">
              Invoice ID
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">Merchant</span>
            <span className="text-sm text-gray-900">
              {invoice.merchantName}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">Date</span>
            <span className="text-sm text-gray-900">
              {new Date(invoice.dueDate).toDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">
              Amount Due
            </span>
            <div className="flex flex-col items-end">
              <div>
                <span className="pr-1">USDC</span>
                <span className="text-lg font-bold text-gray-900">
                  {invoice.amount.toFixed(3)}
                </span>
              </div>

              <div>
                <span className="pr-1">{flag}</span>

                <span className="pr-1">{code}</span>
                <span className="text-lg font-bold text-gray-900">
                  {/* {convertFromUsdc(invoice.amount, localCurrency.code)?.toFixed(
                    3
                  )} */}

                  {(usdcToUsd * invoice.amount * usdToLocal)?.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Connect Wallet to Pay
          </h2>

          {!isConnected ? (
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Connected Account
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                <div>
                  <ConnectButton />
                </div>
              </div>

              {/* Balance */}
              {balance && (
                <div className="text-sm text-gray-500 mb-4">
                  Balance: {parseFloat(balance.formatted).toFixed(4)}{" "}
                  {balance.symbol}
                </div>
              )}

              {/* Modified Payment Button */}
              <button
                onClick={sendUSDC}
                disabled={isPaymentProcessing || isConfirming}
                className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
                  isPaymentProcessing || isConfirming
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                }`}
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Transaction...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirming on Blockchain...
                  </>
                ) : (
                  `Pay $${invoice?.amount.toFixed(3)}`
                )}
              </button>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="px-6 py-4 text-xs text-gray-500">
          <p>
            Payments are processed securely. Your wallet will confirm the
            transaction before any funds are transferred.
          </p>
        </div>
      </div>
    </div>
  );
}
