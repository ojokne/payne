"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BarChart2,
  CreditCard,
  LogOut,
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/config/firebase";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Navigation items
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Invoices", href: "/invoices", icon: CreditCard },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
  ];

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });
  }, []);

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


          {/* Logout button for desktop */}
          <button
            onClick={handleLogout}
            className="mx-4 mb-8 px-4 py-3 flex items-center text-sm font-medium text-gray-700 hover:text-red-600 rounded-xl transition-colors hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* display logo on mobile */}
      <div className="md:hidden px-4 pt-6 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Payne
          </span>
        </Link>
        {/* Logout button for mobile */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      {/* Main content */}
      <div className="flex flex-col min-w-0 flex-1 md:pl-72">
        <main className="flex-1 p-4 pb-20 md:pb-4">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-10 shadow-lg">
        <div className="grid grid-cols-3 h-16">
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
