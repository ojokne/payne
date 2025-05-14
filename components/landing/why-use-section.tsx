import {
  CreditCard,
  Globe,
  Clock,
  Wallet,
  LineChart,
  Lock,
  Send,
  BadgeCheck,
} from "lucide-react";

export default function WhyUse() {
  return (
    <section className="relative py-24 overflow-hidden bg-gray-50">

      <div className="container relative mx-auto px-4 z-10">
        {/* Section heading with same typography as hero */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl lg:text-5xl font-bold leading-tight text-gray-900 mb-4">
            Why Use{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Payne
            </span>
            ?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Designed specifically for merchants in emerging markets who want to
            accept global payments easily.
          </p>
        </div>

        {/* Feature grid with Lucide icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Globe className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2 text-gray-900">
              Accept Global Payments
            </h3>
            <p className="text-gray-700">
              Receive payments from customers worldwide using USDC stablecoin on
              the fast and affordable Base network.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Wallet className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2 text-gray-900">
              No Bank Account Needed
            </h3>
            <p className="text-gray-700">
              Start receiving payments in minutes—no need for a bank account or
              paperwork. Just your phone and internet access.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <CreditCard className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2 text-gray-900">
              Smart Wallet Technology
            </h3>
            <p className="text-gray-700">
              No complex setup—just connect your wallet, and you’re ready to
              accept payments.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2 text-gray-900">
              Self-Custody & No Intermediaries
            </h3>
            <p className="text-gray-700">
              Your funds go directly to your wallet—no middlemen or
              intermediaries.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2 text-gray-900">
              Instant Settlements
            </h3>
            <p className="text-gray-700">
              Receive funds instantly with real-time payment confirmations.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <LineChart className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2 text-gray-900">
              Business Analytics
            </h3>
            <p className="text-gray-700">
              Track sales, view payment history, and gain insights into your
              business performance.
            </p>
          </div>
        </div>

        {/* Bottom badges in the same style as hero section */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-x-10 gap-y-6">
          <div className="flex items-center text-gray-700">
            <BadgeCheck className="w-6 h-6 mr-2 text-purple-600" />
            <span className="text-sm font-medium">
              Tailored for Emerging Markets
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <Send className="w-6 h-6 mr-2 text-purple-600" />
            <span className="text-sm font-medium">
              Fast & Affordable Transactions
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <Wallet className="w-6 h-6 mr-2 text-purple-600" />
            <span className="text-sm font-medium">No Complex Setup</span>
          </div>
        </div>
      </div>
    </section>
  );
}
