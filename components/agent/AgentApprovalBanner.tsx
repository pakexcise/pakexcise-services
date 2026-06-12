import { AlertTriangle } from "lucide-react";

type AgentApprovalBannerProps = {
  status: "PENDING" | "REJECTED" | "APPROVED";
  labels: {
    pendingTitle: string;
    pendingDescription: string;
    rejectedTitle: string;
    rejectedDescription: string;
  };
};

export function AgentApprovalBanner({
  status,
  labels,
}: AgentApprovalBannerProps) {
  if (status !== "REJECTED") {
    return null;
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div>
        <p className="font-medium">{labels.rejectedTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {labels.rejectedDescription}
        </p>
      </div>
    </div>
  );
}
