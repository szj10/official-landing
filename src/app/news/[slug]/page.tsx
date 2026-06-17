import Link from "next/link";
import { remark } from "remark";
import html from "remark-html";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPostBySlug, getAllPosts, type Post } from "@/lib/posts";

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-dot-pattern">
        <Header />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Post not found
            </h1>
            <Link href="/news" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Back to News
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const content = await markdownToHtml(post.content);
  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-dot-pattern">
      <Header />

      <main className="flex-1 pt-24">
        <article className="py-16 lg:py-24 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to News
            </Link>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  {post.category}
                </span>
                <span className="text-sm text-gray-500 dark:text-zinc-500">{post.readTime}</span>
                {post.trending && (
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold">
                    🔥 TRENDING
                  </span>
                )}
                {post.hot && !post.trending && (
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold">
                    ⚡ HOT
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-zinc-400">
                <span>{post.author}</span>
                <span>•</span>
                <span>{post.date}</span>
              </div>
            </div>

            <div className="aspect-[16/9] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-3xl mb-12 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
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

            <div
              className="prose prose-lg dark:prose-invert max-w-none mb-12
                prose-headings:font-extrabold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:first:mt-0
                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8
                prose-p:text-gray-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
                prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-gray-900 dark:prose-pre:bg-zinc-950 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto
                prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
                prose-li:text-gray-700 dark:prose-li:text-zinc-300
                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-zinc-400
                prose-hr:border-gray-200 dark:prose-hr:border-zinc-800 prose-hr:my-12"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            <div className="border-t border-gray-200 dark:border-zinc-800 pt-12">
              <div className="glass-panel rounded-2xl p-8 text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Ready to try Huavoi?
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
                  Start creating professional videos with AI today
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-95"
                >
                  Get Started Free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prevPost && (
                  <Link
                    href={`/news/${prevPost.slug}`}
                    className="glass-panel rounded-xl p-6 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="text-xs text-gray-500 dark:text-zinc-500 mb-2">
                      ← Previous Post
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {prevPost.title}
                    </div>
                  </Link>
                )}
                {nextPost && (
                  <Link
                    href={`/news/${nextPost.slug}`}
                    className="glass-panel rounded-xl p-6 hover:shadow-lg transition-all duration-200 group text-right"
                  >
                    <div className="text-xs text-gray-500 dark:text-zinc-500 mb-2">Next Post →</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {nextPost.title}
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
