"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

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

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white border-b border-gray-100 shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-heading text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Payne
          </span>
        </div>

        {/* Desktop Nav - only rendered when not mobile */}
        {/* {!isMobile && ( */}
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
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl transition shadow-md hover:shadow-lg"
          >
            Dashboard
          </Link>
        </div>
        {/* // )} */}

        {/* Mobile menu button - only rendered on mobile */}
        {isMobile && (
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
        )}
      </nav>

      {/* Mobile menu - only rendered when mobile and menu is open */}
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
