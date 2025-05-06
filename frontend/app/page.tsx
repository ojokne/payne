"use client";

import { useState } from "react";
import Hero from "@/components/landing/hero";
import Header from "@/components/landing/header";
import WhyUse from "@/components/landing/why-use-section";
import HowItWorks from "@/components/landing/how-it-works";
import Architecture from "@/components/landing/architecture";
import WhatsNext from "@/components/landing/whats-next";
import FAQ from "@/components/landing/faq";
import Footer from "@/components/landing/footer";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
      {/* Navigation */}
      <Header />

      <main className="flex-grow">
        {/* Hero Section - Enhanced with vibrant design */}
        <Hero />

        {/* Why Use Payne? */}
        <WhyUse />

        {/* How It Works */}
        <HowItWorks />

        {/* Built for Local Merchants */}

        {/* Features Overview */}

        {/* Live Demo & GitHub */}

        {/* Architecture Overview */}
        <Architecture />

        {/* What's Next? */}
        <WhatsNext />

        {/* FAQ Section */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}
