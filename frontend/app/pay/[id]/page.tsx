"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useBalance, useWriteContract, useConfig } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { USDC_ADDRESS } from "@/constants/constants";
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
import { Invoice } from "@/types/types";
import { waitForTransactionReceipt } from "wagmi/actions";

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

  // Wallet connection
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

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

  // Function to send USDC payment
  function sendUSDC() {
    if (!invoice || !address) return;

    setIsPaymentProcessing(true);
    setError(null);

    writeContract(
      {
        address: USDC_ADDRESS,
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="pb-3 flex items-center justify-center">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-5xl py-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Payne
            </span>
          </Link>
        </div>
        <div className="bg-red-50 text-red-800 p-4 rounded-lg max-w-md w-full">
          <p className="font-medium">Error</p>
          <p className="mt-1">{error || "Invoice not found"}</p>

          {/* Add the refresh button when error is about user rejection */}
          {error?.includes("denied the payment") && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          )}

          {/* Add these buttons for specific error types */}
          {error?.includes("insufficient funds") && (
            <div className="mt-4 flex flex-col space-y-2">
              <a
                href="https://app.uniswap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Get USDC
              </a>
              <button
                onClick={() => window.location.reload()}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          )}

          {error?.includes("wrong network") && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Switch Network & Try Again
            </button>
          )}

          {(error?.includes("gas") || error?.includes("allowance")) && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show success state
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="pb-3 flex items-center justify-center">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-5xl py-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Payne
            </span>
          </Link>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Payment Successful
          </h2>
          <p className="mt-2 text-gray-600">
            Thank you for your payment of ${invoice.amount.toFixed(2)} to
            <span className="font-bold px-1">{invoice.merchantName}</span>
            for invoice {invoice.invoiceNumber}.
          </p>
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
            <span className="text-lg font-bold text-gray-900">
              ${invoice.amount}
            </span>
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
                  `Pay $${invoice?.amount}`
                )}
              </button>

              {/* Add confirmation status indicator */}
              {isConfirming && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex items-center text-blue-700">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="font-medium">Transaction submitted!</span>
                  </div>
                  <p className="mt-1 text-sm text-blue-600">
                    Waiting for blockchain confirmation. This may take a few
                    moments.
                  </p>
                  {txHash && (
                    <div className="mt-2 text-xs">
                      <span className="text-gray-500">Transaction ID: </span>
                      <span className="font-mono text-blue-700 break-all">
                        {txHash}
                      </span>
                    </div>
                  )}
                </div>
              )}
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
