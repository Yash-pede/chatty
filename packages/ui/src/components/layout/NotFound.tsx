import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../empty.js";
import { Button } from "../button.js";
import { Link } from "@tanstack/react-router";

export function DefaultNotFoundPage() {
  return (
    <Empty className={"h-screen flex flex-col items-center justify-center"}>
      <EmptyHeader>
        <EmptyTitle>404 - Not Found</EmptyTitle>
        <EmptyDescription>
          The page you&apos;re looking for doesn&apos;t exist. Try searching for
          what you need below.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
          <Link to={"/chat"}>
            <Button>HOME</Button>
          </Link>
        </div>
        <EmptyDescription>
          Need help? <a href="#">Contact support</a>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
