import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";
type AuthHeaderButtonProps = {
  loginLabel: string;
  className?: string;
  fullWidth?: boolean;
  onNavigate?: () => void;
};

export function AuthHeaderButton({
  loginLabel,
  className,
  fullWidth = false,
  onNavigate,
}: AuthHeaderButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className={cn(fullWidth && "w-full justify-center", className)}
      onClick={onNavigate}
    >
      <Link href="/login" prefetch={false}>
        <LogIn className="size-4" aria-hidden="true" />
        {loginLabel}
      </Link>
    </Button>
  );
}
