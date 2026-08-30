"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/i18n";

// ─── SVG Icons ──────────────────────────────────────────────────────────────

function CheckIcon({ className = "w-5 h-5 text-indigo-500" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { t } = useI18n();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: t("pricing.free.name"),
      description: t("pricing.free.description"),
      monthlyPrice: t("pricing.free.price.monthly"),
      annualPrice: t("pricing.free.price.annual"),
      isFree: true,
      features: [
        t("pricing.free.features.f1"),
        t("pricing.free.features.f2"),
        t("pricing.free.features.f3"),
        t("pricing.free.features.f4"),
        t("pricing.free.features.f5"),
        t("pricing.free.features.f6"),
      ],
      cta: t("pricing.free.cta"),
      popular: false,
    },
    {
      name: t("pricing.pro.name"),
      description: t("pricing.pro.description"),
      monthlyPrice: t("pricing.pro.price.monthly"),
      annualPrice: t("pricing.pro.price.annual"),
      isFree: false,
      features: [
        t("pricing.pro.features.f1"),
        t("pricing.pro.features.f2"),
        t("pricing.pro.features.f3"),
        t("pricing.pro.features.f4"),
        t("pricing.pro.features.f5"),
        t("pricing.pro.features.f6"),
        t("pricing.pro.features.f7"),
        t("pricing.pro.features.f8"),
      ],
      cta: t("pricing.pro.cta"),
      popular: true,
    },
    {
      name: t("pricing.premium.name"),
      description: t("pricing.premium.description"),
      monthlyPrice: t("pricing.premium.price.monthly"),
      annualPrice: t("pricing.premium.price.annual"),
      isFree: false,
      features: [
        t("pricing.premium.features.f1"),
        t("pricing.premium.features.f2"),
        t("pricing.premium.features.f3"),
        t("pricing.premium.features.f4"),
        t("pricing.premium.features.f5"),
        t("pricing.premium.features.f6"),
        t("pricing.premium.features.f7"),
        t("pricing.premium.features.f8"),
        t("pricing.premium.features.f9"),
      ],
      cta: t("pricing.premium.cta"),
      popular: false,
    },
    {
      name: t("pricing.enterprise.name"),
      description: t("pricing.enterprise.description"),
      isEnterprise: true,
      features: [
        t("pricing.enterprise.features.f1"),
        t("pricing.enterprise.features.f2"),
        t("pricing.enterprise.features.f3"),
        t("pricing.enterprise.features.f4"),
        t("pricing.enterprise.features.f5"),
        t("pricing.enterprise.features.f6"),
        t("pricing.enterprise.features.f7"),
        t("pricing.enterprise.features.f8"),
        t("pricing.enterprise.features.f9"),
        t("pricing.enterprise.features.f10"),
      ],
      cta: t("pricing.enterprise.cta"),
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-dot-pattern">
      <Header />

      <main className="flex-1 pt-24">
        {/* ─── Plans Grid Section ─────────────────────────────────────────── */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-6 shadow-sm shadow-indigo-500/5">
                <span>{t("pricing.badge")}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                {t("pricing.title")}
              </h1>
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                {t("pricing.subtitle")}
              </p>

              {/* Billing cycle toggle */}
              <div className="inline-flex items-center glass-panel rounded-full p-1 border border-gray-200/50 dark:border-zinc-800/80 shadow-md">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    billingCycle === "monthly"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {t("pricing.monthly")}
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    billingCycle === "annual"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span>{t("pricing.annual")}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      billingCycle === "annual"
                        ? "bg-white text-indigo-600"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {t("pricing.save20")}
                  </span>
                </button>
              </div>
            </div>

            {/* Plans List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={`glass-panel rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                    plan.popular
                      ? "ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-500/20 scale-102"
                      : "shadow-sm hover:shadow-lg hover:-translate-y-1"
                  }`}
                >
                  {/* Neon spotlight for popular plan */}
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent blur-2xl -z-10 pointer-events-none" />
                  )}

                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {t("pricing.mostPopular")}
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6 min-h-8">
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      {plan.isEnterprise ? (
                        <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                          {t("pricing.custom")}
                        </span>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                              {billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice}
                            </span>
                            {billingCycle === "annual" && !plan.isFree && (
                              <span className="text-xs text-gray-500 dark:text-zinc-500">
                                {t("pricing.free.price.billedAnnually")}
                              </span>
                            )}
                          </div>
                          {billingCycle === "annual" && !plan.isFree && (
                            <p className="text-xs text-gray-500 dark:text-zinc-500 line-through mt-1">
                              {plan.monthlyPrice} {t("pricing.free.price.billedMonthly")}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="h-px bg-gray-200/50 dark:bg-zinc-800/80 mb-6" />

                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start">
                          <CheckIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mr-2.5 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600 dark:text-zinc-400 leading-tight">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={
                      plan.isEnterprise
                        ? "/about#connect-with-us"
                        : process.env.NEXT_PUBLIC_SIGNUP_URL || "/"
                    }
                    target={plan.isEnterprise ? undefined : "_blank"}
                    rel={plan.isEnterprise ? undefined : "noopener noreferrer"}
                    className={`block w-full text-center py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      plan.popular
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 active:scale-95"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white active:scale-95"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Compare Plans Section ─────────────────────────────────────── */}
        <section className="py-20 bg-white/10 dark:bg-zinc-950/10 backdrop-blur-sm border-t border-gray-200/40 dark:border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                {t("pricing.comparePlans")}
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl glass-panel shadow-lg border border-gray-200/50 dark:border-zinc-800/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
                    <th className="py-5 px-6 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {t("pricing.compare.feature")}
                    </th>
                    <th className="py-5 px-6 text-center text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {t("pricing.free.name")}
                    </th>
                    <th className="py-5 px-6 text-center text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {t("pricing.pro.name")}
                    </th>
                    <th className="py-5 px-6 text-center text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {t("pricing.premium.name")}
                    </th>
                    <th className="py-5 px-6 text-center text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {t("pricing.enterprise.name")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: t("pricing.compare.creditsPerMonth"),
                      free: "5",
                      pro: "25",
                      premium: "100",
                      enterprise: t("pricing.custom"),
                    },
                    {
                      feature: t("pricing.compare.creditRollover"),
                      free: "10",
                      pro: "50",
                      premium: t("pricing.compare.unlimited"),
                      enterprise: t("pricing.compare.unlimited"),
                    },
                    {
                      feature: t("pricing.compare.voiceCreations"),
                      free: "2",
                      pro: "5",
                      premium: "10",
                      enterprise: t("pricing.compare.unlimited"),
                    },
                    {
                      feature: t("pricing.compare.aiScriptWriter"),
                      free: "✓",
                      pro: "✓",
                      premium: "✓",
                      enterprise: "✓",
                    },
                    {
                      feature: t("pricing.compare.videoQuality"),
                      free: "720p",
                      pro: "1080p",
                      premium: "4K",
                      enterprise: "4K+",
                    },
                    {
                      feature: t("pricing.compare.customBranding"),
                      free: "—",
                      pro: "—",
                      premium: "✓",
                      enterprise: "✓",
                    },
                    {
                      feature: t("pricing.compare.teamCollaboration"),
                      free: "—",
                      pro: "—",
                      premium: "✓",
                      enterprise: "✓",
                    },
                    {
                      feature: t("pricing.compare.apiAccess"),
                      free: "—",
                      pro: "✓",
                      premium: "✓",
                      enterprise: "✓",
                    },
                    {
                      feature: t("pricing.compare.voiceCloning"),
                      free: "—",
                      pro: "—",
                      premium: "—",
                      enterprise: "✓",
                    },
                    {
                      feature: t("pricing.compare.whiteLabel"),
                      free: "—",
                      pro: "—",
                      premium: "✓",
                      enterprise: "✓",
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 dark:border-zinc-800/80 hover:bg-gray-50/30 dark:hover:bg-zinc-900/10 transition-colors"
                    >
                      <td className="py-4.5 px-6 text-xs font-semibold text-gray-950 dark:text-white">
                        {row.feature}
                      </td>
                      <td className="py-4.5 px-6 text-center text-xs text-gray-600 dark:text-zinc-400">
                        {row.free}
                      </td>
                      <td className="py-4.5 px-6 text-center text-xs text-gray-600 dark:text-zinc-400 font-semibold">
                        {row.pro}
                      </td>
                      <td className="py-4.5 px-6 text-center text-xs text-gray-600 dark:text-zinc-400">
                        {row.premium}
                      </td>
                      <td className="py-4.5 px-6 text-center text-xs text-gray-600 dark:text-zinc-400">
                        {row.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── Custom Solution CTA ─────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-panel rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t("pricing.customSolution.title")}
                </h3>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                  {t("pricing.customSolution.description")}
                </p>
              </div>
              <Link
                href="/about#connect-with-us"
                className="w-full sm:w-auto inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 text-center"
              >
                {t("pricing.customSolution.cta")}
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FAQs ──────────────────────────────────────────────────────── */}
        <section className="py-20 border-t border-gray-200/40 dark:border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                {t("pricing.faq.title")}
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[1, 2, 3, 4, 5, 6].map((n) => ({
                q: t(`pricing.faq.q${n}.q`),
                a: t(`pricing.faq.q${n}.a`),
              })).map((faq, i) => (
                <details
                  key={i}
                  className="glass-panel rounded-2xl p-6 group transition-all duration-200 hover:border-indigo-500/25"
                >
                  <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-gray-900 dark:text-white text-sm">
                    {faq.q}
                    <span className="flex-shrink-0 ml-4 w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-open:bg-indigo-500/10 group-open:text-indigo-500 transition-colors">
                      <svg
                        className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400 group-open:rotate-180 group-open:text-indigo-500 transition-transform duration-200"
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
                    </span>
                  </summary>
                  <p className="mt-4 text-xs text-gray-600 dark:text-zinc-400 leading-relaxed border-t border-gray-100 dark:border-zinc-800 pt-4">
                    {faq.a}
                  </p>
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
