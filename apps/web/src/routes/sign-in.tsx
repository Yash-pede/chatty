import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>): { role: string } => {
    return {
      role: search.role as string,
    };
  },
  component: SignInComponent,
});

function SignInComponent() {
  const { role } = Route.useSearch();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        redirectUrl="/"
        signUpUrl="/sign-up"
        unsafeMetadata={{ role: role ?? "user" }}
      />
    </div>
  );
}
