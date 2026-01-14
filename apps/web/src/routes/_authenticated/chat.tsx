import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import DefaultPending from "@repo/ui/components/layout/DefaultPending";
import { getUserById } from "@/queries/user.queries.ts";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { SocketProvider } from "@/lib/sockets/SocketProvider.tsx";

export const Route = createFileRoute("/_authenticated/chat")({
  component: RouteComponent,
  pendingComponent: () => <DefaultPending />,
  loader: async ({ context, abortController }) => {
    const userId = context.auth.user?.id;

    if (!userId) {
      abortController.abort("User not Authenticated");
      throw new Error("User not authenticated");
    }

    const userData = await context.queryClient.ensureQueryData({
      queryKey: ["user-data", userId],
      queryFn: () => getUserById(userId),
    });

    return { userData };
  },
});

function RouteComponent() {
  const { userData } = Route.useLoaderData();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const hideSidebar = pathname.match(/^\/chat\/[0-9a-f-]{36}$/);

  return (
    <SocketProvider>
      {/* Conditionally render sidebar */}
      <AppSidebar userData={userData.data} hidden={!!hideSidebar} />
      <main className="w-full h-full">
        <Outlet />
      </main>
    </SocketProvider>
  );
}
