import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { AnnouncementBar } from "@/components/AnnouncementBar";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    scripts: [
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-R32VEKYQ7R",
        async: true,
      },
      {
        children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-R32VEKYQ7R');`,
      },
      {
        children: `window.chatwootSettings = {"position":"right","type":"expanded_bubble","launcherTitle":"Canlı Destek"};
(function(d,t) {
  var BASE_URL="https://login.engagemetriq.com";
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src=BASE_URL+"/packs/js/sdk.js";
  g.async = true;
  s.parentNode.insertBefore(g,s);
  g.onload=function(){
    window.chatwootSDK.run({
      websiteToken: '8mw3b8PoA96aKEA72uXqZpwE',
      baseUrl: BASE_URL
    })
  }
})(document,"script");`,
      },
    ],
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MinaToi — El Yapımı Hakiki Deri Cüzdan, Kartlık & Kılıf" },
      {
        name: "description",
        content:
          "MinaToi el yapımı hakiki deri cüzdan, kartlık ve gözlük kılıfı koleksiyonu. %100 hakiki deri, el dikişi, Türkiye geneli kapıda ödeme.",
      },
      {
        name: "keywords",
        content:
          "deri cüzdan, hakiki deri cüzdan, el yapımı deri cüzdan, deri kartlık, erkek deri cüzdan, toptan deri cüzdan, MinaToi",
      },
      { name: "author", content: "MinaToi" },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "MinaToi" },
      { property: "og:title", content: "MinaToi — El Yapımı Hakiki Deri Cüzdan & Kartlık" },
      {
        property: "og:description",
        content:
          "MinaToi el yapımı hakiki deri cüzdan, kartlık ve gözlük kılıfı koleksiyonu. %100 hakiki deri, el dikişi.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://minatoi.ugurdogan.net" },
      { property: "og:image", content: "https://minatoi.ugurdogan.net/images/og-image.jpg" },
      { property: "og:locale", content: "tr_TR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@minatoi" },
      { name: "twitter:title", content: "MinaToi — El Yapımı Hakiki Deri Cüzdan & Kartlık" },
      {
        name: "twitter:description",
        content: "El yapımı hakiki deri cüzdan, kartlık ve gözlük kılıfı koleksiyonu.",
      },
      { name: "twitter:image", content: "https://minatoi.ugurdogan.net/images/og-image.jpg" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "canonical", href: "https://minatoi.ugurdogan.net" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <Header />
        <AnnouncementBar />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Footer />
      </div>
    </CartProvider>
    </QueryClientProvider>
  );
}
