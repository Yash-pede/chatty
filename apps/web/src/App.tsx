import "@repo/ui/styles/globals.css";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "@repo/ui/components/theme-provider";
import { ClerkWrapper, useClerkAuth } from "./auth/clerk";
import { router } from "./router";
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
function InnerApp() {
  const auth = useClerkAuth();
  console.log("THE AUTH IS:", auth);
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
