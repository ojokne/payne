import { Database, Cpu, Layout, Bell } from "lucide-react";

export default function Architecture() {
  return (
    <section className="relative py-24 overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 " />

      <div className="container relative mx-auto px-4 z-10">
        {/* Section badge */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-block px-5 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6 shadow-sm">
            Technical Details
          </div>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-4 text-white">
            Architecture Overview
            {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Overview
            </span> */}
          </h2>

          <p className="text-xl max-w-3xl mx-auto text-white">
            Built with modern technologies for speed, security, and scalability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Smart Wallet */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-5 shadow-md">
              <Database className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-gray-900">
              Smart Wallet
            </h3>
            <p className="text-gray-700">
              Powered by Coinbase Smart Wallets for secure key management.
            </p>
          </div>

          {/* Backend */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-5 shadow-md">
              <Cpu className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-gray-900">
              Backend
            </h3>
            <p className="text-gray-700">
              Firebase / Supabase for storing off-chain data and user
              management.
            </p>
          </div>

          {/* Frontend */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-5 shadow-md">
              <Layout className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-gray-900">
              Frontend
            </h3>
            <p className="text-gray-700">
              Next.js + Wagmi + RainbowKit for a smooth user experience.
            </p>
          </div>

          {/* Notifications */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-5 shadow-md">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-gray-900">
              Notifications
            </h3>
            <p className="text-gray-700">
              SMS gateway integration for real-time payment alerts.
            </p>
          </div>
        </div>

        {/* GitHub link */}
        <div className="mt-16 text-center">
          <a
            href="https://github.com/yourusername/payne"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-gray-800 border border-gray-200 bg-white hover:text-purple-600 px-6 py-3 rounded-xl text-lg font-medium transition shadow-sm hover:shadow-md"
          >
            View Source Code on GitHub
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017C2 16.5 4.865 20.299 8.839 21.68c.644.118.88-.279.88-.592 0-.292-.01-1.066-.015-2.092-3.338.724-4.042-1.61-4.042-1.61C4.99 16.07 4.245 15.76 4.245 15.76c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.107-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.225.715.885.59C19.135 20.294 22 16.5 22 12.017 22 6.484 17.525 2 12 2z"
              ></path>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
