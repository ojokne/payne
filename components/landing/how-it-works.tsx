// import { Circle1, Circle2, Circle3, Circle4, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden bg-gray-50">
      {/* Background with gradient similar to hero */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(66,153,225,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,rgba(139,92,246,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(245,158,11,0.1),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container relative mx-auto px-4 z-10">
        {/* Section badge */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-block px-5 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6 shadow-sm">
            Simple Process
          </div>
          
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-4">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Works</span>
          </h2>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Get started with Payne in just four simple steps
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting lines for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 w-full h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto shadow-md">
              1
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-center text-gray-900">
              Sign Up
            </h3>
            <p className="text-gray-700 text-center">
              Register with basic business details (email, phone, business name)
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto shadow-md">
              2
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-center text-gray-900">
              Get Smart Wallet
            </h3>
            <p className="text-gray-700 text-center">
              Receive your smart wallet
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto shadow-md">
              3
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-center text-gray-900">
              Customer Pays
            </h3>
            <p className="text-gray-700 text-center">
              Create an invoice ,Customer scans your QR code and pays with any compatible wallet
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto shadow-md">
              4
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-center text-gray-900">
              Get Confirmation
            </h3>
            <p className="text-gray-700 text-center">
              Receive confirmation and SMS alert for the payment
            </p>
          </div>
        </div>
        
        {/* Bottom trust indicator */}
        <div className="mt-16 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
          >
            Start Accepting Payments
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}