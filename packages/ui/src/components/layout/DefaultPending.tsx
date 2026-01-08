import { Spinner } from "../spinner.js";
import { cn } from "@repo/ui/lib/utils";

const DefaultPending = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center h-screen w-svw",
        className,
      )}
    >
      <Spinner />
    </div>
  );
};

export default DefaultPending;
