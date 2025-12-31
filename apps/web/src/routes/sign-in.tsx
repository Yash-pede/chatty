import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const valodateUserRoleSchema = z.object({
  role: z.string().optional().default("user"),
});
export const Route = createFileRoute("/sign-in")({
  validateSearch: zodValidator(valodateUserRoleSchema),
  component: SignInComponent,
});

function SignInComponent() {
  const { role } = Route.useSearch();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        signUpUrl="/sign-up"
        unsafeMetadata={{ role: role ?? "user" }}
      />
    </div>
  );
}
