import * as React from "react";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useClerkAuth } from "@/auth/clerk.tsx";
import { DefaultNotFoundPage } from "@repo/ui/components/layout/NotFound";

interface RouterContext {
  auth: ReturnType<typeof useClerkAuth>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: DefaultNotFoundPage,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
      <TanStackRouterDevtools />
    </React.Fragment>
  );
}
