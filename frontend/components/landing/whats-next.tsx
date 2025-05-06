import { Banknote, Coins, Globe, BarChart4, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WhatsNext() {
  return (
    <section className="relative py-24 overflow-hidden">

      <div className="absolute inset-0 bg-white ">
        <svg className="absolute inset-0 h-full w-full opacity-30 dark:opacity-20">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      <div className="container relative mx-auto px-4 z-10">
        {/* Section badge */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-block px-5 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6 shadow-sm">
            Roadmap
          </div>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-4">
            What's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Next
            </span>
            ?
          </h2>

          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Our upcoming features to make payments even more powerful
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Local Currency Off-Ramps */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-5 shadow-md">
              <Banknote className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-gray-900">
              Local Currency Off-Ramps
            </h3>
            <p className="text-gray-700">
              Cash out USDC directly to mobile money or bank accounts in your
              local currency—no third-party exchanges required.
            </p>
          </div>

          {/* Local Stablecoins */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-5 shadow-md">
              <Coins className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-gray-900">
              Local Stablecoins
            </h3>
            <p className="text-gray-700">
              Support for stablecoins backed by local fiat currencies to improve
              accessibility and reduce volatility risks.
            </p>
          </div>

          {/* Multi-Currency Support */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-5 shadow-md">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-gray-900">
              Multi-Currency Support
            </h3>
            <p className="text-gray-700">
              Accept not just USDC, but other stablecoins like EURC and PYUSD to
              serve more international customers.
            </p>
          </div>

          {/* Merchant Analytics */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-5 shadow-md">
              <BarChart4 className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-gray-900">
              Merchant Analytics
            </h3>
            <p className="text-gray-700">
              Gain deep insights into your revenue, transaction history, and
              customer behavior with visual analytics.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <Link
            href="/register"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
