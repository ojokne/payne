import {
  ArrowRight,
  CircleDollarSign,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(66,153,225,0.2),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(236,72,153,0.2),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_60%,rgba(245,158,11,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_20%,rgba(16,185,129,0.15),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container relative mx-auto px-4 flex flex-col items-center text-center z-10">
        {/* Badge with improved contrast */}
        <div className="inline-block px-5 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6 shadow-sm">
          Powered by Base Blockchain
        </div>

        {/* Main heading with better contrast */}
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight max-w-4xl mb-6 text-gray-900">
          Get paid globally in {" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            USDC{" "}
          </span>
          — no bank account, no delays.
        </h1>

        {/* Subheading with improved contrast */}
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-10">
          Empower your business: Accept fast, secure USDC payments on Base with
          easy-to-use smart wallets.{" "}
        </p>

        {/* Center-aligned CTA buttons with improved contrast */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <Link
            href="/signup"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 inline-flex items-center"
          >
            Get Started
            <ArrowRight className="ms-3" />
          </Link>
        </div>

        {/* Enhanced trust badges with better contrast */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-x-10 gap-y-6">
          <div className="flex items-center text-gray-700">
            <ShieldCheck className="mx-1  text-purple-600" />
            <span className="text-sm font-medium text-black">
              Secure Transactions
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <CircleDollarSign className="mx-1  text-purple-600" />
            <span className="text-sm font-medium">Low Transaction Fees</span>
          </div>

          <div className="flex items-center text-gray-700">
            <Smartphone className="mx-1  text-purple-600" />

            <span className="text-sm font-medium">No App Required</span>
          </div>
        </div>
      </div>
    </section>
  );
}
