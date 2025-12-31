import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react";

export const Route = createFileRoute("/sign-up")({
  validateSearch: (search: Record<string, unknown>): { role: string } => {
    return {
      role: search.role as string,
    };
  },
  component: SignUpComponent,
});

function SignUpComponent() {
  const { role } = Route.useSearch();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        redirectUrl="/"
        signInUrl="/sign-in"
        unsafeMetadata={{ role: role ?? "user" }}
      />
    </div>
  );
}
