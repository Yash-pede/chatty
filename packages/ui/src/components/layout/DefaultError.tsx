import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card.js";
import { Button } from "../button.js";
import { cn } from "../../lib/utils.js";

type DefaultErrorProps = {
  error: Error | null;
  title?: string;
  onRetry?: () => void;
  className?: string;
};

export function DefaultError({
  error,
  title = "Something went wrong",
  onRetry,
  className,
}: DefaultErrorProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center p-4",
        className,
      )}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">{title}</CardTitle>
          <CardDescription>
            An unexpected error occurred while loading the data.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            {(error && error.message) || "Unknown error"}
          </div>

          {onRetry && (
            <Button variant="outline" className="w-full" onClick={onRetry}>
              Try again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
