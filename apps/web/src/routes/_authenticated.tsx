import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarProvider } from "@repo/ui/components/sidebar";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/sign-in",
        search: {
          role: "user",
        },
      });
    }
  },
  component: () => (
    <SidebarProvider defaultOpen>
      <Outlet />
    </SidebarProvider>
  ),
});
