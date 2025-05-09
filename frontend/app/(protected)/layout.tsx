"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, CreditCard, Settings, Wallet } from "lucide-react";
import Image from "next/image";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Navigation items
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Invoices", href: "/invoices", icon: CreditCard },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="px-6 pb-6 flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Payne
              </span>
            </Link>
          </div>

          {/* Nav items */}
          <nav className="mt-2 flex-1 flex flex-col px-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive
                          ? "text-purple-600"
                          : "text-gray-500 group-hover:text-gray-700"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Wallet info for desktop */}
          <div className="p-4 mx-4 mb-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <div className="flex items-center mb-3">
              <Wallet className="h-5 w-5 mr-2" />
              <p className="text-sm font-medium">Smart Wallet</p>
            </div>
            <p className="text-xs opacity-90 font-mono mb-2 truncate">
              0xabc3...5678
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Balance:</span>
              <span className="text-sm font-bold">1,250 USDC</span>
            </div>
          </div>
        </div>
      </div>

      {/* display logo on mobile */}
      <div className="md:hidden px-4 pt-6">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Payne
          </span>
        </Link>
      </div>
      {/* Main content */}
      <div className="flex flex-col min-w-0 flex-1 md:pl-72">
        <main className="flex-1 p-4 pb-20 md:pb-4">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-10 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center ${
                  isActive ? "text-purple-600" : "text-gray-600"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    isActive ? "text-purple-600" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs mt-1 ${isActive ? "font-medium" : ""}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
