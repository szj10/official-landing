import { remark } from "remark";
import html from "remark-html";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPostBySlug, getAllPosts, type Post } from "@/lib/posts";
import PostPageContent, { PostNotFound } from "./PostPageContent";

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html, { sanitize: false }).process(markdown);
  return result.toString();
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-dot-pattern">
        <Header />
        <PostNotFound />
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
        <PostPageContent
          title={post.title}
          category={post.category}
          readTime={post.readTime}
          trending={!!post.trending}
          hot={!!post.hot}
          author={post.author}
          date={post.date}
          content={content}
          prevPost={prevPost ? { slug: prevPost.slug, title: prevPost.title } : null}
          nextPost={nextPost ? { slug: nextPost.slug, title: nextPost.title } : null}
        />
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
