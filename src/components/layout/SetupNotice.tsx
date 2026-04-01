// FILE: src/components/layout/SetupNotice.tsx
import Link from "next/link";

import { Badge, Button, Card } from "@/components/ui";

interface SetupNoticeProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function SetupNotice({ title, description, actionHref, actionLabel }: SetupNoticeProps) {
  return (
    <Card className="mx-auto max-w-2xl space-y-4 text-center">
      <div className="space-y-2">
        <Badge variant="warning">Configuration needed</Badge>
        <h1 className="text-3xl font-medium text-charcoal-200">{title}</h1>
        <p className="text-sm text-grey-500">{description}</p>
      </div>

      {actionHref && actionLabel ? (
        <div className="flex justify-center">
          <Link href={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
