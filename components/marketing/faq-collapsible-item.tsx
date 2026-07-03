"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import type { FaqItem } from "@/components/marketing/faq-accordion";

type FaqCollapsibleItemProps = {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
};

export function FaqCollapsibleItem({
  item,
  isOpen,
  onToggle,
}: FaqCollapsibleItemProps) {
  const panelId = useId();

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-sm transition-shadow",
        isOpen && "shadow-md",
      )}
    >
      <button
        type="button"
        className="flex w-full cursor-pointer items-start justify-between gap-4 px-4 py-4 text-start md:px-5 md:py-5"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="min-w-0 flex-1 text-bidi-auto text-base font-semibold leading-relaxed text-start">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div
          id={panelId}
          className="border-t px-4 pb-4 pt-3 md:px-5 md:pb-5"
        >
          <p className="text-bidi-auto text-sm leading-loose text-muted-foreground whitespace-pre-line">
            {item.answer}
          </p>
        </div>
      ) : null}
    </div>
  );
}

type FaqCollapsibleListProps = {
  items: FaqItem[];
  className?: string;
  defaultOpenFirst?: boolean;
  openId?: string | null;
  onOpenChange?: (id: string | null) => void;
};

function resolveDefaultOpenId(items: FaqItem[], defaultOpenFirst: boolean) {
  return defaultOpenFirst && items[0] ? items[0].id : null;
}

export function FaqCollapsibleList({
  items,
  className,
  defaultOpenFirst = true,
  openId: controlledOpenId,
  onOpenChange,
}: FaqCollapsibleListProps) {
  const [internalOpenId, setInternalOpenId] = useState<string | null>(() =>
    resolveDefaultOpenId(items, defaultOpenFirst),
  );

  const isControlled = controlledOpenId !== undefined;
  const openId = isControlled
    ? controlledOpenId
    : internalOpenId && items.some((item) => item.id === internalOpenId)
      ? internalOpenId
      : resolveDefaultOpenId(items, defaultOpenFirst);

  const setOpenId = (id: string | null) => {
    if (onOpenChange) {
      onOpenChange(id);
      return;
    }

    setInternalOpenId(id);
  };

  function handleToggle(itemId: string) {
    setOpenId(openId === itemId ? null : itemId);
  }

  return (
    <div className={cn("grid gap-3", className)}>
      {items.map((item) => (
        <FaqCollapsibleItem
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => handleToggle(item.id)}
        />
      ))}
    </div>
  );
}
