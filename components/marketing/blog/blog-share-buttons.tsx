"use client";

import { Facebook, Link2, Linkedin, Mail, Send } from "lucide-react";
import { useState } from "react";

import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogShareButtonsProps = {
  url: string;
  title: string;
  shareLabel: string;
  copiedLabel: string;
  labels: {
    facebook: string;
    linkedin: string;
    whatsapp: string;
    x: string;
    telegram: string;
    email: string;
    copyLink: string;
  };
  className?: string;
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function BlogShareButtons({
  url,
  title,
  shareLabel,
  copiedLabel,
  labels,
  className,
}: BlogShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(`${title} ${url}`);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const shareLinks = [
    {
      key: "whatsapp",
      label: labels.whatsapp,
      href: `https://wa.me/?text=${shareText}`,
      icon: <WhatsAppIcon className="size-4" />,
    },
    {
      key: "facebook",
      label: labels.facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <Facebook className="size-4" />,
    },
    {
      key: "x",
      label: labels.x,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <XIcon className="size-4" />,
    },
    {
      key: "linkedin",
      label: labels.linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <Linkedin className="size-4" />,
    },
    {
      key: "telegram",
      label: labels.telegram,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <Send className="size-4" />,
    },
    {
      key: "email",
      label: labels.email,
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: <Mail className="size-4" />,
    },
  ] as const;

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-semibold text-foreground">{shareLabel}</p>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((link) => (
          <Button key={link.key} asChild size="sm" variant="outline">
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.icon}
              {link.label}
            </a>
          </Button>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={copyLink}>
          <Link2 className="size-4" />
          {copied ? copiedLabel : labels.copyLink}
        </Button>
      </div>
    </div>
  );
}
