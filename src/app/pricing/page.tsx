'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for individuals and small projects',
      price: billingCycle === 'monthly' ? 0 : 0,
      features: [
        '1,000 API calls/month',
        'Basic voices',
        'Email support',
        'Community access',
        'Standard latency',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Professional',
      description: 'For growing teams and businesses',
      price: billingCycle === 'monthly' ? 49 : 39,
      features: [
        '50,000 API calls/month',
        'All premium voices',
        'Priority support',
        'Advanced analytics',
        'Low latency',
        'Custom pronunciation',
        'API access',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Business',
      description: 'For scaling organizations',
      price: billingCycle === 'monthly' ? 199 : 159,
      features: [
        '500,000 API calls/month',
        'All premium voices',
        '24/7 dedicated support',
        'Advanced analytics',
        'Ultra-low latency',
        'Custom pronunciation',
        'Voice cloning',
        'SSO & SAML',
        'SLA guarantee',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: null,
      features: [
        'Unlimited API calls',
        'All features included',
        'Dedicated account manager',
        'Custom integrations',
        'On-premise deployment',
        'Volume discounts',
        'Custom SLA',
        'Training & onboarding',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Choose the perfect plan for your needs. All plans include a 14-day free trial.
              </p>

              <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    billingCycle === 'annual'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Annual
                  <span className="ml-2 text-xs text-green-600 font-semibold">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-xl p-8 ${
                    plan.popular
                      ? 'ring-2 ring-blue-600 shadow-xl'
                      : 'shadow-sm hover:shadow-lg'
                  } transition-shadow relative`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    {plan.price !== null ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-600">/month</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">Custom Pricing</span>
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
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/"
                    className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compare Plans
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Starter</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Professional</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Business</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'API Calls', starter: '1K', pro: '50K', business: '500K', enterprise: 'Unlimited' },
                    { feature: 'Voice Selection', starter: 'Basic', pro: 'Premium', business: 'Premium', enterprise: 'Premium' },
                    { feature: 'Support', starter: 'Email', pro: 'Priority', business: '24/7', enterprise: 'Dedicated' },
                    { feature: 'Analytics', starter: '—', pro: '✓', business: '✓', enterprise: '✓' },
                    { feature: 'Voice Cloning', starter: '—', pro: '—', business: '✓', enterprise: '✓' },
                    { feature: 'SSO/SAML', starter: '—', pro: '—', business: '✓', enterprise: '✓' },
                    { feature: 'SLA', starter: '—', pro: '—', business: '✓', enterprise: 'Custom' },
                    { feature: 'On-premise', starter: '—', pro: '—', business: '—', enterprise: '✓' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-gray-900">{row.feature}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{row.starter}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{row.pro}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{row.business}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Need a custom solution?
                </h3>
                <p className="text-gray-600 mb-6">
                  Our enterprise team can help you build a custom plan that fits your specific requirements, 
                  including volume discounts, dedicated support, and custom integrations.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Contact Sales
                </Link>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Start with a free trial
                </h3>
                <p className="text-gray-600 mb-6">
                  Try our platform risk-free for 14 days. No credit card required. 
                  Get full access to all features and see the results for yourself.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: 'Can I switch plans at any time?',
                  a: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, you\'ll receive credit for the unused portion.',
                },
                {
                  q: 'What happens if I exceed my API call limit?',
                  a: 'We\'ll notify you when you reach 80% of your limit. You can either upgrade your plan or purchase additional calls at our pay-as-you-go rate.',
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'Yes, we offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact our support team for a full refund.',
                },
                {
                  q: 'Is there a free trial?',
                  a: 'Yes! All plans include a 14-day free trial with full access to features. No credit card required to start.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans.',
                },
              ].map((faq, i) => (
                <details key={i} className="bg-gray-50 rounded-lg p-6 group">
                  <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-gray-900">
                    {faq.q}
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600">{faq.a}</p>
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
