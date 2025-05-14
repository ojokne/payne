"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { GeoData } from "@/types/types";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [geoData, setGeoData] = useState<GeoData>({
    flag: null,
    countryCode: "",
    isLoading: true,
  });

  useEffect(() => {
    checkScreenSize();

    const storedFlag = sessionStorage.getItem("countryFlag");
    const storedCountryCode = sessionStorage.getItem("countryCode");

    if (storedFlag && storedCountryCode) {
      setGeoData({
        flag: JSON.parse(storedFlag),
        countryCode: storedCountryCode,
        isLoading: false,
      });
      return;
    }

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const checkScreenSize = () => {
    setIsMobile(window.innerWidth < 768);
  };

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
