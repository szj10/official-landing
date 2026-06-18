"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n";

interface LegalData {
  title: string;
  lastUpdated: string;
  content: string;
}

export default function LegalContent({ type }: { type: "terms" | "privacy" }) {
  const { locale, t } = useI18n();
  const [data, setData] = useState<LegalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/legal/${type}/${locale}`)
      .then((res) => res.json())
      .then((json: LegalData) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [type, locale]);

  if (loading || !data) {
    return (
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-6 shadow-sm shadow-indigo-500/5">
              <span>{t("legal.badge")}</span>
            </div>
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg mb-4 mx-auto w-64" />
              <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-40 mx-auto" />
            </div>
          </div>
          <div className="animate-pulse space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-48 mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-6 shadow-sm shadow-indigo-500/5">
            <span>Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            {data.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-500">
            {t("legal.lastUpdated")}: {data.lastUpdated}
          </p>
        </div>

        <div
          className="prose prose-gray dark:prose-invert max-w-none
            prose-headings:font-extrabold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:first:mt-0
            prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10
            prose-h3:text-lg prose-h3:mb-3 prose-h3:mt-8
            prose-p:text-gray-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed
            prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
            prose-li:text-gray-600 dark:prose-li:text-zinc-400"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      </div>
    </section>
  );
}
