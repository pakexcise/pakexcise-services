import { Info } from "lucide-react";

import type { AgentNextAction } from "@/features/agents/lib/agent-next-action";

type AgentApplicationGuidanceCardProps = {
  action: AgentNextAction;
  title: string;
  description: string;
};

export function AgentApplicationGuidanceCard({
  action,
  title,
  description,
}: AgentApplicationGuidanceCardProps) {
  if (action === "none" || action === "closed" || action === "completed") {
    return null;
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <h2 className="text-sm font-semibold text-primary">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
