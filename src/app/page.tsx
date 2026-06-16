'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/i18n';

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                {t('hero.title')}{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t('hero.titleHighlight')}
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('common.getStartedFree')}
                </Link>
                <Link
                  href="/"
                  className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  {t('common.watchDemo')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">{t('trust.title')}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Logo {i}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('solutions.title')}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t('solutions.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('solutions.script.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('solutions.script.description')}
                </p>
                <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  {t('common.learnMore')}
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01.469-1.57m0 0a3 3 0 01-1.469-1.57m0 0L9 7m4.469 4.43a3 3 0 01.469 1.57m0 0a3 3 0 01-1.469 1.57m0 0l.469.43m0 0L15 17" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('solutions.voice.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('solutions.voice.description')}
                </p>
                <Link href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                  {t('common.learnMore')}
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('solutions.video.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('solutions.video.description')}
                </p>
                <Link href="/" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
                  {t('common.learnMore')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('features.title')}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { key: 'endToEnd' },
                { key: 'speed' },
                { key: 'quality' },
                { key: 'affordable' },
                { key: 'customizable' },
                { key: 'scalable' },
              ].map((feature, i) => (
                <div key={i} className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t(`features.${feature.key}.title`)}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t(`features.${feature.key}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                {t('common.startFreeTrial')}
              </Link>
              <Link
                href="/pricing"
                className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium"
              >
                {t('common.viewPricing')}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('faq.title')}
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {['q1', 'q2', 'q3', 'q4'].map((q, i) => (
                <details key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 group">
                  <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                    {t(`faq.${q}.question`)}
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">{t(`faq.${q}.answer`)}</p>
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
