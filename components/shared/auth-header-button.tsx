"use client";

import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type AuthHeaderButtonProps = {
  label: string;
  className?: string;
  fullWidth?: boolean;
  onNavigate?: () => void;
};

export function AuthHeaderButton({
  label,
  className,
  fullWidth = false,
  onNavigate,
}: AuthHeaderButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className={cn(fullWidth && "w-full justify-start", className)}
    >
      <Link href="/login" onClick={onNavigate}>
        <LogIn className="size-4" aria-hidden="true" />
        <span>{label}</span>
      </Link>
    </Button>
  );
}
