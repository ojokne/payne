"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

// Define TypeScript interfaces for IP API response
interface Flag {
  img: string;
  emoji: string;
  emoji_unicode: string;
}

interface IpWhoIsResponse {
  ip: string;
  success: boolean;
  country: string;
  country_code: string;
  flag: Flag;
  [key: string]: any; // For other properties we don't explicitly use
}

// Define interface for Exchange Rate API response
interface ExchangeRateResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

// Define interface for our stored geolocation data
interface GeoData {
  flag: Flag | null;
  countryCode: string;
  isLoading: boolean;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [geoData, setGeoData] = useState<GeoData>({
    flag: null,
    countryCode: "",
    isLoading: true,
  });

  // Effect to handle screen size detection
  useEffect(() => {
    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Function to determine if mobile or desktop
  const checkScreenSize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  // Effect for geolocation data
  useEffect(() => {
    async function fetchGeoData() {
      try {
        // Check session storage first
        const storedFlag = sessionStorage.getItem("countryFlag");
        const storedCountryCode = sessionStorage.getItem("countryCode");

        if (storedFlag && storedCountryCode) {
          // Use stored data if available
          setGeoData({
            flag: JSON.parse(storedFlag),
            countryCode: storedCountryCode,
            isLoading: false,
          });
          return;
        }

        // Otherwise, fetch fresh data
        const response = await fetch("https://ipwhois.io/");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: IpWhoIsResponse = await response.json();

        if (!data.success) {
          throw new Error("API returned unsuccessful response");
        }

        // Store data in session storage
        sessionStorage.setItem("countryFlag", JSON.stringify(data.flag));
        sessionStorage.setItem("countryCode", data.country_code);
        sessionStorage.setItem("country", data.country); // Also store country name

        // Update state
        setGeoData({
          flag: data.flag,
          countryCode: data.country_code,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching geolocation data:", error);
        setGeoData((prev) => ({ ...prev, isLoading: false }));
      }
    }

    // Only run in the browser
    if (typeof window !== "undefined") {
      fetchGeoData();
    }
  }, []);

  // New effect for exchange rate data - runs after geo data is loaded
  useEffect(() => {
    async function fetchExchangeRates() {
      try {
        // Check if exchange rates are already in session storage
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

        // Fetch both exchange rates and USDC rate in parallel
        const [exchangeRateResponse, usdcRateResponse] = await Promise.all([
          // Regular exchange rates
          fetch("/api/exchange-rates"),

          // USDC to USD conversion rate
          fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd"
          ),
        ]);

        // Handle exchange rate response
        if (!exchangeRateResponse.ok) {
          throw new Error(
            `Exchange rate API error! Status: ${exchangeRateResponse.status}`
          );
        }

        const exchangeRateData = await exchangeRateResponse.json();

        if (exchangeRateData.result !== "success") {
          throw new Error("Exchange rate API returned unsuccessful response");
        }

        // Handle USDC rate response
        if (!usdcRateResponse.ok) {
          throw new Error(
            `USDC rate API error! Status: ${usdcRateResponse.status}`
          );
        }

        const usdcRateData = await usdcRateResponse.json();

        if (!usdcRateData["usd-coin"] || !usdcRateData["usd-coin"].usd) {
          throw new Error("Invalid USDC rate response format");
        }

        // Store exchange rates in session storage
        sessionStorage.setItem(
          "exchangeRates",
          JSON.stringify(exchangeRateData.conversion_rates)
        );

        // Store USDC rate in session storage
        sessionStorage.setItem(
          "usdcRate",
          usdcRateData["usd-coin"].usd.toString()
        );

        // Common timestamp for both rates
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
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white border-b border-gray-100 shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-heading text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Payne
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link
            href="#how-it-works"
            className="text-gray-700 hover:text-purple-600 transition font-medium"
          >
            How It Works
          </Link>

          <Link
            href="#faq"
            className="text-gray-700 hover:text-purple-600 transition font-medium"
          >
            FAQ
          </Link>

          {/* Country Flag Display */}
          {!geoData.isLoading && geoData.flag && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <span
                className="text-lg"
                aria-label={`Flag of ${geoData.countryCode}`}
              >
                {geoData.flag.emoji}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {geoData.countryCode}
              </span>
            </div>
          )}

          <Link
            href="/login"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl transition shadow-md hover:shadow-lg"
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile menu button */}
        {isMobile && (
          <div className="flex items-center space-x-3">
            {/* Country Flag for Mobile */}
            {!geoData.isLoading && geoData.flag && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                <span
                  className="text-base"
                  aria-label={`Flag of ${geoData.countryCode}`}
                >
                  {geoData.flag.emoji}
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {geoData.countryCode}
                </span>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div className="bg-white border-b border-gray-100 shadow-md">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Link
              href="#how-it-works"
              className="text-gray-700 hover:text-purple-600 transition py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>

            <Link
              href="#faq"
              className="text-gray-700 hover:text-purple-600 transition py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl transition text-center shadow-md hover:shadow-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
