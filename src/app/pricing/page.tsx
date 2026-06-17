"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals and small projects",
      price: billingCycle === "monthly" ? 0 : 0,
      features: [
        "10 videos/month",
        "AI script generation",
        "Basic voice selection",
        "Standard video templates",
        "Email support",
        "720p output quality",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      description: "For growing teams and content creators",
      price: billingCycle === "monthly" ? 49 : 39,
      features: [
        "100 videos/month",
        "Advanced AI scripts",
        "200+ premium voices",
        "Custom video templates",
        "Priority support",
        "1080p HD quality",
        "Brand customization",
        "API access",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Business",
      description: "For marketing teams and agencies",
      price: billingCycle === "monthly" ? 199 : 159,
      features: [
        "Unlimited videos",
        "Advanced AI scripts",
        "All premium voices",
        "Custom templates & branding",
        "24/7 dedicated support",
        "4K Ultra HD quality",
        "Team collaboration",
        "Advanced analytics",
        "SSO & SAML",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      price: null,
      features: [
        "Unlimited everything",
        "Custom AI models",
        "Voice cloning",
        "White-label solution",
        "Dedicated account manager",
        "On-premise deployment",
        "Custom integrations",
        "Volume discounts",
        "Custom SLA",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                Choose the perfect plan for your video creation needs. All plans include a 14-day
                free trial with full access.
              </p>

              <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    billingCycle === "monthly"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    billingCycle === "annual"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Annual
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-8 ${
                    plan.popular ? "ring-2 ring-blue-600 shadow-xl" : "shadow-sm hover:shadow-lg"
                  } transition-shadow relative`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    {plan.price !== null ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">/month</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        Custom Pricing
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/"
                    className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Compare Plans
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      Feature
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      Starter
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      Professional
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      Business
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: "Videos per Month",
                      starter: "10",
                      pro: "100",
                      business: "Unlimited",
                      enterprise: "Unlimited",
                    },
                    {
                      feature: "AI Script Writer",
                      starter: "✓",
                      pro: "✓",
                      business: "✓",
                      enterprise: "✓",
                    },
                    {
                      feature: "Voice Selection",
                      starter: "Basic",
                      pro: "200+",
                      business: "200+",
                      enterprise: "Custom",
                    },
                    {
                      feature: "Video Quality",
                      starter: "720p",
                      pro: "1080p",
                      business: "4K",
                      enterprise: "4K+",
                    },
                    {
                      feature: "Custom Branding",
                      starter: "—",
                      pro: "✓",
                      business: "✓",
                      enterprise: "✓",
                    },
                    {
                      feature: "Team Collaboration",
                      starter: "—",
                      pro: "—",
                      business: "✓",
                      enterprise: "✓",
                    },
                    {
                      feature: "API Access",
                      starter: "—",
                      pro: "✓",
                      business: "✓",
                      enterprise: "✓",
                    },
                    {
                      feature: "Voice Cloning",
                      starter: "—",
                      pro: "—",
                      business: "—",
                      enterprise: "✓",
                    },
                    {
                      feature: "White Label",
                      starter: "—",
                      pro: "—",
                      business: "—",
                      enterprise: "✓",
                    },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{row.feature}</td>
                      <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-300">
                        {row.starter}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-300">
                        {row.pro}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-300">
                        {row.business}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-300">
                        {row.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Need a custom solution?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Our enterprise team can build a custom video creation solution tailored to your
                  workflow, including custom AI models, voice cloning, white-label options, and
                  dedicated support.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Contact Sales
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Try it free for 14 days
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create your first AI-powered video in minutes. No credit card required. Experience
                  the full power of script-to-screen video creation.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: "What's included in the free trial?",
                  a: "Full access to all features for 14 days. Create up to 5 videos with AI scriptwriting, voice synthesis, and video generation. No credit card required.",
                },
                {
                  q: "Can I switch plans at any time?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, you'll receive credit for the unused portion.",
                },
                {
                  q: "What video formats and quality do you support?",
                  a: "We support MP4, MOV, and WebM formats. Quality ranges from 720p (Starter) to 1080p HD (Professional) to 4K Ultra HD (Business and Enterprise).",
                },
                {
                  q: "Can I use my own scripts or voices?",
                  a: "Absolutely. While our AI can generate scripts and voices, you can upload your own scripts, record custom audio, or use our voice cloning feature (Enterprise) to replicate specific voices.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with the video quality or features, contact our support team for a full refund.",
                },
              ].map((faq, i) => (
                <details key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 group">
                  <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                    {faq.q}
                    <svg
                      className="w-5 h-5 text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
