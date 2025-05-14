"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BarChart2, CreditCard, LogOut } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import countryToFlagEmoji from "@/constants/countryFlags";
import { Flag, IpApiResponse } from "@/types/types";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Invoices", href: "/invoices", icon: CreditCard },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); 
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

  useEffect(() => {
    async function fetchGeoData() {
      try {
        const storedFlag = sessionStorage.getItem("countryFlag");
        const storedCountryCode = sessionStorage.getItem("countryCode");

        if(storedFlag && storedCountryCode) return 

        const response = await fetch("/api/geo-location");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const apiData: IpApiResponse = await response.json();

        if (apiData.status !== "success") {
          throw new Error("API returned unsuccessful response");
        }

        const flagEmoji = countryToFlagEmoji[apiData.countryCode] || "🌐";
        const flagData: Flag = {
          img: `https://flagcdn.com/${apiData.countryCode.toLowerCase()}.svg`,
          emoji: flagEmoji,
        };

        // Store data in session storage
        sessionStorage.setItem("countryFlag", JSON.stringify(flagData));
        sessionStorage.setItem("countryCode", apiData.countryCode);
        sessionStorage.setItem("country", apiData.country);

        sessionStorage.setItem("countryCurrencyCode", apiData.currency);

        console.log("Geo data fetched:", apiData);
      } catch (error) {
        console.error("Error fetching geolocation data:", error);
      }
    }

    // Only run in the browser
    if (typeof window !== "undefined") {
      fetchGeoData();
    }
  }, []);

  useEffect(() => {
    async function fetchExchangeRates() {
      try {
        const storedRates = sessionStorage.getItem("exchangeRates");
        const storedUsdcRate = sessionStorage.getItem("usdcRate");
        const storedTimestamp = sessionStorage.getItem(
          "exchangeRatesTimestamp"
        );

        // Define cache duration (1 hour)
        const CACHE_DURATION = 60 * 60 * 1000;
        const now = Date.now();

        // Use cached rates if available and not expired
        if (storedRates && storedUsdcRate && storedTimestamp) {
          const timestamp = parseInt(storedTimestamp);
          if (now - timestamp < CACHE_DURATION) {
            console.log("Using cached exchange rates and USDC rate");
            return;
          }
        }

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

        const exchangeRateData = await exchangeRateResponse.json();

        if (exchangeRateData.result !== "success") {
          throw new Error("Exchange rate API returned unsuccessful response");
        }

        if (!usdcRateResponse.ok) {
          throw new Error(
            `USDC rate API error! Status: ${usdcRateResponse.status}`
          );
        }

        const usdcRateData = await usdcRateResponse.json();

        if (!usdcRateData["usd-coin"] || !usdcRateData["usd-coin"].usd) {
          throw new Error("Invalid USDC rate response format");
        }

        sessionStorage.setItem(
          "exchangeRates",
          JSON.stringify(exchangeRateData.conversion_rates)
        );

        sessionStorage.setItem(
          "usdcRate",
          usdcRateData["usd-coin"].usd.toString()
        );

        sessionStorage.setItem("exchangeRatesTimestamp", now.toString());

        console.log("Exchange rates and USDC rate fetched and stored");
      } catch (error) {
        console.error("Error fetching rates:", error);
      }
    }

    // Only run in the browser
    if (typeof window !== "undefined") {
      fetchExchangeRates();
    }
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
