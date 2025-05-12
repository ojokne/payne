"use client";

import { useEffect, useState } from "react";
import {
  QrCode,
  RefreshCcw,
  ArrowUpRight,
  RefreshCw,
  Bell,
  Clock,
  CheckCircle,
  User,
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff,
  BarChart2,
  CreditCard,
  Copy,
  Check,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/config/firebase";
import { useAccount, useDisconnect, usePublicClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { USDC_ADDRESS } from "@/constants/constants";
import { erc20Abi } from "viem";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { Invoice } from "@/types/types";
import { format } from "date-fns";

export default function Dashboard() {
  const [showAmounts, setShowAmounts] = useState(false);
  const [copied, setCopied] = useState(false);

  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const router = useRouter();

  // get address of connected wallet
  const { address } = useAccount();

  const { disconnect } = useDisconnect();

  const publicClient = usePublicClient();

  const [usdcBalance, setUsdcBalance] = useState(0);

  const [wallettype, setWalletType] = useState("");

  const [name, setName] = useState<string | null>("");

  // Function to truncate address
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Function to handle copy
  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const initWallet = async () => {
    if (!address) return;
    const code = await publicClient?.getCode({
      address,
    });

    const balance = await publicClient?.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });

    const formattedBalance = balance
      ? parseFloat(balance.toString()) / 10 ** 6
      : 0;

    setUsdcBalance(formattedBalance);

    if (code && code !== "0x") {
      setWalletType("smart");
    } else {
      setWalletType("eoa");
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName);
      }
    });
    if (address && publicClient) {
      initWallet();
    }
  }, [address, publicClient]);

  useEffect(() => {
    setInvoicesLoading(true);

    // Query for paid invoices (most recent first)
    const paidInvoicesRef = collection(db, "invoices");
    const paidQuery = query(
      paidInvoicesRef,
      where("status", "==", "paid"),
      orderBy("paidAt", "desc"),
      limit(3)
    );

    // Query for pending invoices
    const pendingInvoicesRef = collection(db, "invoices");
    const pendingQuery = query(
      pendingInvoicesRef,
      where("status", "==", "pending"),
      orderBy("dueDate", "asc"), // Earliest due first
      limit(5)
    );

    // Set up real-time listeners
    const paidUnsubscribe = onSnapshot(paidQuery, (snapshot) => {
      const invoices: Invoice[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();

        invoices.push({
          id: doc.id,
          invoiceNumber: data.invoiceNumber,
          customerName: data.customerName,
          amount: parseFloat(data.amount),
          dueDate: new Date(data.dueDate),
          status: data.status,
          paymentLink: `${window.location.origin}/pay/${data.invoiceNumber}`,
          merchantId: data.merchantId,
          merchantName: data.merchantName,
          merchantAddress: data.merchantAddress,
          paidAt: new Date(data?.paidAt),
        });
      });

      setRecentInvoices(invoices);
    });

    const pendingUnsubscribe = onSnapshot(pendingQuery, (snapshot) => {
      const invoices: Invoice[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();

        // Convert timestamp to Date if needed
        const dueDate =
          data.dueDate instanceof Date
            ? data.dueDate
            : data.dueDate?.toDate
            ? data.dueDate.toDate()
            : new Date(data.dueDate);

        invoices.push({
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

      setPendingInvoices(invoices);
      setInvoicesLoading(false);
    });

    // Cleanup
    return () => {
      paidUnsubscribe();
      pendingUnsubscribe();
    };
  }, [address]); // Re-run when wallet address changes

  if (!address) {
    return (
      <div className="mt-3 sm:mt-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Wallet Connection Required
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            To proceed with this action, you need to connect your digital
            wallet. This allows you to securely interact with blockchain
            features and manage your assets.
          </p>
        </div>
        <div className="py-6">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome & Stats Overview */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome {name}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your business
        </p>

        <div className="mt-4 p-4 bg-white rounded-xl shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Connected Wallet{" "}
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  {wallettype} wallet
                </span>
              </p>
              <div className="flex items-center">
                <div className="bg-purple-100 text-purple-800 font-mono py-1 px-3 rounded-lg text-sm">
                  {truncateAddress(address)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                title="Copy full address"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors"
                title="Disconnect wallet"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Total USDC Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-5 mb-6 text-white shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-purple-100 text-sm mb-1">Total USDC</p>
            {showAmounts ? (
              <div>
                <p className="text-3xl font-bold mb-1">{usdcBalance} USDC</p>
                {/* <p className="text-sm opacity-80">≈ 1,250 USD</p> */}
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold mb-1">•••• USDC</p>
                {/* <p className="text-sm opacity-80">•••• USD</p> */}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors px-2 py-1 rounded-lg text-xs"
            aria-label={showAmounts ? "Hide amounts" : "Show amounts"}
          >
            {showAmounts ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Show</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 overflow-x-auto pb-2">
        <button
          className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow hover:cursor-pointer"
          onClick={() => router.push("/invoices/create")}
        >
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <QrCode className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm text-gray-700 text-center">
            Generate an Invoice
          </span>
        </button>

        <button
          onClick={() => router.push("/invoices")}
          className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow hover:cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm text-gray-700 text-center">Invoices</span>
        </button>

        <button
          onClick={() => router.push("/analytics")}
          className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow hover:cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <BarChart2 className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm text-gray-700 text-center">Analytics</span>
        </button>
      </div>

      {/* Two column layout for desktop, stacked for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Settlements */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Pending Payments</h3>
            {!invoicesLoading && pendingInvoices.length > 0 && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                $
                {pendingInvoices
                  .reduce((sum, inv) => sum + inv.amount, 0)
                  .toFixed(2)}{" "}
                due
              </span>
            )}
          </div>

          {invoicesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
            </div>
          ) : pendingInvoices.length > 0 ? (
            <div className="space-y-3">
              {pendingInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      ${invoice.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {invoice.customerName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    {(() => {
                      // Create today's date with time set to midnight for comparison
                      const today = new Date();
                      const todayWithoutTime = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate()
                      );

                      // Create a dueDate with only date components (no time)
                      const dueDateWithoutTime = new Date(
                        invoice.dueDate.getFullYear(),
                        invoice.dueDate.getMonth(),
                        invoice.dueDate.getDate()
                      );

                      // Compare dates without time components
                      const isOverdue = dueDateWithoutTime < todayWithoutTime;

                      return (
                        <>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isOverdue
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {isOverdue ? "Overdue" : "Pending"}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {format(invoice.dueDate, "MMM dd")}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
              <Link
                href="/invoices"
                className="block text-center text-sm text-purple-600 hover:text-purple-800 mt-2 pt-2 border-t border-gray-100"
              >
                View All
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500 opacity-80" />
              <p>No pending payments</p>
              <Link
                href="/invoices/create"
                className="text-sm text-purple-600 hover:text-purple-800 mt-2 inline-block"
              >
                Create new invoice
              </Link>
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Recent Payments</h3>
            {!invoicesLoading && recentInvoices.length > 0 && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                $
                {recentInvoices
                  .reduce((sum, inv) => sum + inv.amount, 0)
                  .toFixed(2)}{" "}
                received
              </span>
            )}
          </div>

          {invoicesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
            </div>
          ) : recentInvoices.length > 0 ? (
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      ${invoice.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {invoice.customerName} •{" "}
                      {invoice.paidAt
                        ? format(new Date(invoice.paidAt), "MMM dd")
                        : ""}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    Paid
                  </span>
                </div>
              ))}
              <Link
                href="/invoices"
                className="block text-center text-sm text-purple-600 hover:text-purple-800 mt-2 pt-2 border-t border-gray-100"
              >
                View All
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No payment history yet</p>
              <Link
                href="/invoices/create"
                className="text-sm text-purple-600 hover:text-purple-800 mt-2 inline-block"
              >
                Create your first invoice
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
