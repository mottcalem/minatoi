/**
 * /blog layout route
 * Bu dosya sadece layout wrapper'dır.
 * Blog listeleme → blog.index.tsx
 * Blog detay    → blog.$slug.tsx
 */
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

function BlogLayout() {
  return <Outlet />;
}
