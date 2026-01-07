import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const roleSchema = z.object({
  role: z.enum(["user", "agent"]).optional().default("user"),
  agentId: z
    .string()
    .regex(/^user_[a-zA-Z0-9]+$/)
    .optional(),
});
export const Route = createFileRoute("/sign-in")({
  validateSearch: zodValidator(roleSchema),
  component: SignInComponent,
});

function SignInComponent() {
  const { role, agentId } = Route.useSearch();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        signUpUrl={`/sign-up?role=${role}&agentId=${agentId}`}
        unsafeMetadata={{ role, agent_id: agentId }}
      />
      {/*<p>{JSON.stringify({ role, agentId })}</p>*/}
    </div>
  );
}
