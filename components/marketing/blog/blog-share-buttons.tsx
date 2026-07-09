"use client";

import { Facebook, Link2, Linkedin } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogShareButtonsProps = {
  url: string;
  title: string;
  shareLabel: string;
  copiedLabel: string;
  className?: string;
};

export function BlogShareButtons({
  url,
  title,
  shareLabel,
  copiedLabel,
  className,
}: BlogShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-semibold text-foreground">{shareLabel}</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook className="size-4" />
            Facebook
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin className="size-4" />
            LinkedIn
          </a>
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={copyLink}>
          <Link2 className="size-4" />
          {copied ? copiedLabel : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
