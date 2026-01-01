import "@repo/ui/styles/globals.css";
import { RouterProvider } from "@tanstack/react-router";
import { ClerkWrapper, useClerkAuth } from "./auth/clerk";
import { router } from "./router";
import { Spinner } from "@repo/ui/components/spinner";
import { ThemeProvider } from "@repo/ui/components/providers/theme-provider";
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
        <Spinner />
      </div>
    );
  }

  return <RouterProvider router={router} context={{ auth }} />;
}
function App() {
  return (
    <ClerkWrapper>
      <ThemeProvider defaultTheme="dark">
        <InnerApp />
      </ThemeProvider>
    </ClerkWrapper>
  );
}

export default App;
