"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const faqs = [
    {
      question: "Do I need a crypto wallet?",
      answer:
        "No, as a merchant, you'll get a smart wallet during onboarding. No need to download any additional wallet apps or manage seed phrases.",
    },
    {
      question: "How do I get USDC?",
      answer:
        "You can receive USDC directly from customers who pay using the platform. You don't need to purchase USDC separately to get started.",
    },
    {
      question: "Can I convert USDC to UGX?",
      answer:
        "Off-ramp solutions are coming soon. For the Buildathon, this process is simulated but will be fully implemented in the production version.",
    },
    {
      question: "Is there a fee to use the service?",
      answer:
        "We charge a small transaction fee that's significantly lower than traditional payment processors or mobile money services.",
    },
    {
      question: "Do my customers need crypto knowledge?",
      answer:
        "Customers who already have crypto wallets can pay easily. For those who don't, we're working on simple onboarding solutions.",
    },
  ];

  return (
    <section id="faq" className="relative py-24 overflow-hidden bg-white">
      <div className="container relative mx-auto px-4 z-10">
        {/* Section badge */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-block px-5 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6 shadow-sm">
            Help Center
          </div>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-4">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Questions
            </span>
          </h2>

          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Everything you need to know about Payne payments
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <button
                className="w-full flex items-center justify-between p-6 focus:outline-none"
                onClick={() => toggleFaq(index)}
                aria-expanded={openIndex === index}
              >
                <h3 className="font-heading text-xl font-semibold text-gray-900 text-left">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="flex-shrink-0 w-5 h-5 text-purple-600" />
                ) : (
                  <ChevronDown className="flex-shrink-0 w-5 h-5 text-gray-500" />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-6 pb-6 text-lg leading-relaxed text-gray-700">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
