import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { locales, defaultLocale } from "@/i18n/config";

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; locale: string }> }
) {
  const { type, locale } = await params;

  if (type !== "terms" && type !== "privacy") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const validLocale = (locales as readonly string[]).includes(locale) ? locale : defaultLocale;
  const filePath = path.join(process.cwd(), "content", "legal", type, `${validLocale}.md`);

  if (!fs.existsSync(filePath)) {
    const fallbackPath = path.join(process.cwd(), "content", "legal", type, `${defaultLocale}.md`);
    if (!fs.existsSync(fallbackPath)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const fallbackContents = fs.readFileSync(fallbackPath, "utf8");
    const { data, content } = matter(fallbackContents);
    const htmlContent = await markdownToHtml(content);
    return NextResponse.json({
      title: data.title || "",
      lastUpdated: data.lastUpdated || "",
      content: htmlContent,
    });
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const htmlContent = await markdownToHtml(content);

  return NextResponse.json({
    title: data.title || "",
    lastUpdated: data.lastUpdated || "",
    content: htmlContent,
  });
}
