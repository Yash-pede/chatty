import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar.tsx";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AppSidebar />
      <main></main>
    </>
  );
}
