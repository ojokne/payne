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
  const router = useRouter();

  useEffect(() => {
    async function fetchGeoData() {
      try {
        const storedFlag = sessionStorage.getItem("countryFlag");
        const storedCountryCode = sessionStorage.getItem("countryCode");

        if (storedFlag && storedCountryCode) return;

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

  return <div>{children}</div>;
}
