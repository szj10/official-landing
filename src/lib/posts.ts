import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostMetadata {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  trending?: boolean;
  hot?: boolean;
  author: string;
}

export interface Post extends PostMetadata {
  content: string;
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
}

export function getPostBySlug(slug: string): Post | null {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    title: data.title || "",
    excerpt: data.excerpt || "",
    date: data.date || "",
    category: data.category || "",
    readTime: data.readTime || "",
    trending: data.trending || false,
    hot: data.hot || false,
    author: data.author || "",
    content,
  };
}

export function getAllPosts(): PostMetadata[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post) return null;
      return {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        category: post.category,
        readTime: post.readTime,
        trending: post.trending,
        hot: post.hot,
        author: post.author,
      } as PostMetadata;
    })
    .filter((post): post is PostMetadata => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getPostsByCategory(category: string): PostMetadata[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.category === category);
}
