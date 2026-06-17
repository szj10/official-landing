import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/posts";
import NewsContent from "./NewsContent";

export default function NewsPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen flex flex-col bg-dot-pattern">
      <Header />
      <main className="flex-1 pt-24">
        <NewsContent posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
