import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@repo/ui/components/layout/Navbar";
import { UserButton } from "@clerk/clerk-react";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Navbar UserButton={UserButton} />
      <p>main content</p>
    </div>
  );
}
