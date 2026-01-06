import * as React from "react";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useClerkAuth } from "@/auth/clerk.tsx";
import { DefaultNotFoundPage } from "@repo/ui/components/layout/NotFound";
import { ComponentError } from "@repo/ui/components/layout/ComponentError";
import { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  auth: ReturnType<typeof useClerkAuth>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: DefaultNotFoundPage,
  errorComponent: ComponentError,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
      {/*<TanStackRouterDevtools />*/}
    </React.Fragment>
  );
}
