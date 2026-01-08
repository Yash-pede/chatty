import * as React from "react";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useClerkAuth } from "@/auth/clerk.tsx";
import { DefaultNotFoundPage } from "@repo/ui/components/layout/NotFound";
import { PageError } from "@repo/ui/components/layout/PageError";
import { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  auth: ReturnType<typeof useClerkAuth>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: DefaultNotFoundPage,
  errorComponent: PageError,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
      {/*<TanStackRouterDevtools />*/}
    </React.Fragment>
  );
}
