"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/i18n";

export default function BlogPage() {
  const { t } = useI18n();

  const blogPosts = [
    {
      title: "Introducing Huavoi 2.0: The Future of AI Video Creation",
      excerpt:
        "Discover the latest features and improvements in our newest release, including advanced AI models and enhanced video generation capabilities.",
      date: "June 15, 2026",
      category: "Product Updates",
      readTime: "5 min read",
      image: "/images/blog-1.png",
    },
    {
      title: "How AI is Revolutionizing Video Content Creation",
      excerpt:
        "Explore the transformative impact of artificial intelligence on the video production industry and what it means for creators.",
      date: "June 10, 2026",
      category: "Industry Insights",
      readTime: "7 min read",
      image: "/images/blog-2.png",
    },
    {
      title: "10 Tips for Creating Engaging Marketing Videos",
      excerpt:
        "Learn proven strategies to create compelling marketing videos that capture attention and drive conversions.",
      date: "June 5, 2026",
      category: "Tutorials",
      readTime: "6 min read",
      image: "/images/blog-3.png",
    },
    {
      title: "Behind the Scenes: Our AI Voice Synthesis Technology",
      excerpt:
        "A deep dive into the technology powering our natural-sounding voice synthesis and how we achieve human-like narration.",
      date: "May 28, 2026",
      category: "Technology",
      readTime: "8 min read",
      image: "/images/blog-4.png",
    },
    {
      title: "Case Study: How Company X Increased Engagement by 300%",
      excerpt:
        "See how one company transformed their content strategy with AI-powered video creation and achieved remarkable results.",
      date: "May 20, 2026",
      category: "Case Studies",
      readTime: "4 min read",
      image: "/images/blog-5.png",
    },
    {
      title: "The Complete Guide to Video Script Writing with AI",
      excerpt:
        "Master the art of AI-assisted script writing with our comprehensive guide covering best practices and advanced techniques.",
      date: "May 15, 2026",
      category: "Tutorials",
      readTime: "10 min read",
      image: "/images/blog-6.png",
    },
  ];

  const categories = [
    "All Posts",
    "Product Updates",
    "Industry Insights",
    "Tutorials",
    "Technology",
    "Case Studies",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-dot-pattern">
      <Header />

      <main className="flex-1 pt-24">
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-6 shadow-sm shadow-indigo-500/5">
                <span>Latest Updates</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                Blog & Resources
              </h1>
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Insights, tutorials, and updates from the Huavoi team. Learn how to create amazing
                videos with AI.
              </p>

              <div className="flex flex-wrap gap-3 justify-center mb-12">
                {categories.map((category, i) => (
                  <button
                    key={i}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                      i === 0
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                        : "glass-panel text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:border-indigo-500/25"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, i) => (
                <article
                  key={i}
                  className="glass-panel rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/30 dark:to-purple-950/30 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 9l3 3m0 0l-3 3m3-3H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold">
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-zinc-500">
                          {post.readTime}
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                        {post.title}
                      </h2>

                      <p className="text-xs text-gray-600 dark:text-zinc-400 mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                      <span className="text-xs text-gray-500 dark:text-zinc-500">{post.date}</span>
                      <Link
                        href="/blog"
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        Read more
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-16 text-center">
              <button className="glass-panel px-8 py-3.5 rounded-full text-gray-700 dark:text-zinc-300 hover:bg-gray-100/50 dark:hover:bg-zinc-800/40 transition-all duration-200 font-semibold text-sm">
                Load More Posts
              </button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white/10 dark:bg-zinc-950/10 backdrop-blur-sm border-t border-gray-200/40 dark:border-zinc-900/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-panel rounded-3xl p-12 lg:p-16 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-base text-gray-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto">
                Get the latest updates, tutorials, and insights delivered straight to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl glass-panel text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-95">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
