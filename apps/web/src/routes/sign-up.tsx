import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["user", "agent"]).optional().default("user"),
  agentId: z
    .string()
    .regex(/^user_[a-zA-Z0-9]+$/)
    .optional(),
});
export const Route = createFileRoute("/sign-up")({
  validateSearch: zodValidator(roleSchema),
  component: SignUpComponent,
});

function SignUpComponent() {
  const { role, agentId } = Route.useSearch();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        signInUrl={`/sign-in?role=${role}&agentId=${agentId}`}
        unsafeMetadata={{ role, agent_id: agentId }}
      />
      {/*<p>{JSON.stringify({ role, agentId })}</p>*/}
    </div>
  );
}
