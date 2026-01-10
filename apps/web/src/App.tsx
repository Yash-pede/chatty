import "@repo/ui/styles/globals.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ClerkWrapper, useClerkAuth } from "./auth/clerk";
import { ThemeProvider } from "@repo/ui/components/providers/theme-provider";
import { routeTree } from "./routeTree.gen";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient.ts";
import DefaultPending from "@repo/ui/components/layout/DefaultPending";
import ClerkAxiosInterceptor from "@/lib/ClerkAxiosInterceptor.tsx";
import { Toaster } from "@repo/ui/components/sonner";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient: queryClient,
  },
});

function InnerApp() {
  const auth = useClerkAuth();
  if (auth.isLoading) {
    return <DefaultPending />;
  }

  return <RouterProvider router={router} context={{ auth, queryClient }} />;
}
function App() {
  return (
    <ClerkWrapper>
      <ThemeProvider defaultTheme="dark">
        <ClerkAxiosInterceptor>
          <QueryClientProvider client={queryClient}>
            <InnerApp />
             <Toaster />
          </QueryClientProvider>
        </ClerkAxiosInterceptor>
      </ThemeProvider>
    </ClerkWrapper>
  );
}

export default App;
