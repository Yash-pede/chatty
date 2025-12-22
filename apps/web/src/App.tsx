import "@repo/ui/styles/globals.css";
import { routeTree } from "./routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "@repo/ui/components/theme-provider";
import { ClerkWrapper, useClerkAuth } from "./auth/clerk";
const router = createRouter({
  routeTree,
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useClerkAuth();

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return <RouterProvider router={router} context={{ auth }} />;
}
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <ClerkWrapper>
        <InnerApp />
      </ClerkWrapper>
    </ThemeProvider>
  );
}

export default App;
