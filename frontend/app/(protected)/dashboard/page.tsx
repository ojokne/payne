"use client";

import { useState } from "react";
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
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Dashboard() {
  const [showAmounts, setShowAmounts] = useState(false);
  const [copied, setCopied] = useState(false);
  const displayName = auth.currentUser?.displayName;

  // Mock data - would come from API in real implementation
  const recentInvoices = [
    { id: 1, amount: 250, date: "Today, 2:30 PM", status: "paid" },
    { id: 2, amount: 45, date: "Today, 11:20 AM", status: "paid" },
    { id: 3, amount: 120, date: "Yesterday", status: "paid" },
  ];

  const pendingSettlements = [
    { id: 101, amount: 75, date: "Today, 4:15 PM", confirmations: "2/3" },
    { id: 102, amount: 200, date: "Today, 10:30 AM", confirmations: "1/3" },
  ];

  const topCustomers = [
    { id: 201, name: "John D.", initials: "JD", amount: 450, transactions: 3 },
    { id: 202, name: "Sarah M.", initials: "SM", amount: 320, transactions: 2 },
    {
      id: 203,
      name: "Robert K.",
      initials: "RK",
      amount: 275,
      transactions: 2,
    },
  ];

  // get address of connected wallet
  const { address } = useAccount();

  const { disconnect } = useDisconnect();

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
          Welcome {auth.currentUser?.displayName}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your business
        </p>

        <div className="mt-4 p-4 bg-white rounded-xl shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Connected Wallet
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
                <p className="text-3xl font-bold mb-1">1,250 USDC</p>
                {/* <p className="text-sm opacity-80">≈ 1,250 USD</p> */}
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold mb-1">•••• USDC</p>
                <p className="text-sm opacity-80">•••• USD</p>
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
        {/* <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
          <div>
            <p className="opacity-75">Last 7 days</p>
            <p className="font-medium">
              {showAmounts ? "650 USDC" : "•••• USDC"}
            </p>
          </div>
          <div>
            <p className="opacity-75">Last 30 days</p>
            <p className="font-medium">
              {showAmounts ? "2,430 USDC" : "•••• USDC"}
            </p>
          </div>
        </div> */}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 overflow-x-auto pb-2">
        <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <QrCode className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm text-gray-700 text-center">
            Generate an Invoice
          </span>
        </button>

        <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <ArrowUpRight className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm text-gray-700 text-center">Send Refund</span>
        </button>

        <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm text-gray-700 text-center">Invoices</span>
        </button>

        <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <BarChart2 className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm text-gray-700 text-center">Analytics</span>
        </button>
      </div>

      {/* Two column layout for desktop, stacked for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Settlements - Now in left column */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">
            Pending Settlements
          </h3>
          {pendingSettlements.length > 0 ? (
            <div className="space-y-3">
              {pendingSettlements.map((settlement) => (
                <div
                  key={settlement.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {settlement.amount}{" "}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-xs text-gray-500">{settlement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500 opacity-80" />
              <p>No pending settlements</p>
            </div>
          )}
        </div>

        {/* Recent Invoices - Remains in right column */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Recent Invoices</h3>
            <Link
              href="/invoices"
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentInvoices.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {transaction.amount}{" "}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  Paid
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Updates */}
      <div className="mt-6 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
        <div className="flex">
          <div className="flex-shrink-0">
            <Bell className="h-5 w-5 text-blue-700" />
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-blue-900">System Updates</h4>
            <p className="text-sm text-blue-800 mt-1">
              Base Network is running smoothly. All systems operational.
            </p>
            <div className="mt-3 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <p className="text-xs text-blue-800">Last updated 5 mins ago</p>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Tip:</span> Boost loyalty by offering
            special discounts to repeat customers!
          </p>
        </div>
      </div>
    </div>
  );
}
