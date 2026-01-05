import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["user", "agent"]).optional().default("user"),
});
export const Route = createFileRoute("/sign-up")({
  validateSearch: zodValidator(roleSchema),
  component: SignUpComponent,
});

function SignUpComponent() {
  const { role } = Route.useSearch();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp signInUrl={`/sign-in?role=${role}`} unsafeMetadata={{ role }} />
    </div>
  );
}
