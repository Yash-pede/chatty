// apps/web/src/components/ComponentError.tsx

import * as React from "react";
import { ErrorComponentProps } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card.js";
import { Button } from "../button.js";
import { Separator } from "../separator.js";
import { Alert, AlertDescription, AlertTitle } from "../alert.js";
import { ScrollArea } from "../scroll-area.js";
import { LucideCalendarMinus, RotateCcw } from "lucide-react";

export function ComponentError(props: ErrorComponentProps) {
  const { error, reset, info } = props;

  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <LucideCalendarMinus className="h-6 w-6 text-destructive" />
          </div>

          <CardTitle className="text-2xl">Something went wrong</CardTitle>

          <CardDescription>
            An unexpected error occurred. You can retry the action or inspect
            technical details below.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* User-visible error message */}
          <Alert variant="destructive">
            <AlertTitle>Error message</AlertTitle>
            <AlertDescription className="break-words">
              {error?.message || "Unknown error"}
            </AlertDescription>
          </Alert>

          {/* Developer details */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails((v) => !v)}
            >
              {showDetails
                ? "Hide technical details"
                : "Show technical details"}
            </Button>

            {showDetails && (
              <>
                <Separator />

                <ScrollArea className="h-64 rounded-md border bg-muted p-3 text-sm">
                  <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                    {JSON.stringify(
                      {
                        name: error?.name,
                        message: error?.message,
                        stack: error?.stack,
                        routerInfo: info,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </ScrollArea>
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => location.reload()}>
            Reload page
          </Button>

          <Button onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
