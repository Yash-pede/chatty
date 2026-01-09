import { createFileRoute, Outlet } from "@tanstack/react-router";
import DefaultPending from "@repo/ui/components/layout/DefaultPending";
import { getUserById } from "@/queries/user.queries.ts";
import { AppSidebar } from "@/components/app-sidebar.tsx";

export const Route = createFileRoute("/_authenticated/chat/_layout")({
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
  return (
    <>
      <AppSidebar userData={userData.data} />
      <main>
        <Outlet />
      </main>
    </>
  );
}
