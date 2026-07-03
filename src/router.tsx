import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // defaultPreloadStaleTime kaldırıldı — 0 verince her hover'da loader tetiklenip
    // navigasyon bloklanıyor. Varsayılan değer (30sn) daha kararlı çalışır.
    defaultStaleTime: 30_000,
  });

  return router;
};
