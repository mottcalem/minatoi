// Blog yazıları veri dosyası — yeni yazılar ileride bu listeye eklenebilir.

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  tags: string[];
  content: string;
};

// Simdilik yayinlanmis blog yazisi yok.
export const BLOG_POSTS: BlogPost[] = [];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getLatestPosts(count?: number): BlogPost[] {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return count ? sorted.slice(0, count) : sorted;
}
