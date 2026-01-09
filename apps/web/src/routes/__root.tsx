import * as React from "react";
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useClerkAuth } from "@/auth/clerk.tsx";
import { DefaultNotFoundPage } from "@repo/ui/components/layout/NotFound";
import { PageError } from "@repo/ui/components/layout/PageError";
import { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  auth: ReturnType<typeof useClerkAuth>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/") {
      throw redirect({ to: "/chat" });
    }
  },
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
