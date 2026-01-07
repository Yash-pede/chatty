import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import DefaultPending from "@repo/ui/components/layout/DefaultPending";
import { getUserById } from "@/queries/user.queries.ts";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
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

  pendingComponent: () => <DefaultPending />,
});

function RouteComponent() {
  const { userData } = Route.useLoaderData();
  return (
    <>
      <AppSidebar userData={userData.data} />
      <main></main>
    </>
  );
}
