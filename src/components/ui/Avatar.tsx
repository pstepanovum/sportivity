// FILE: src/components/ui/Avatar.tsx
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name?: string | null;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-medium_slate_blue-900 text-sm font-medium text-medium_slate_blue-300",
        className,
      )}
      aria-label={name ? `${name} avatar` : "User avatar"}
    >
      {getInitials(name)}
    </div>
  );
}
