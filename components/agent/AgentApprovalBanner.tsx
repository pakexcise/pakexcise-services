import { AlertTriangle, Clock } from "lucide-react";

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
  if (status === "APPROVED") {
    return null;
  }

  const isRejected = status === "REJECTED";

  return (
    <div
      role="alert"
      className={
        isRejected
          ? "flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          : "flex items-start gap-3 rounded-xl border border-secondary/40 bg-secondary/10 p-4"
      }
    >
      {isRejected ? (
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
      ) : (
        <Clock className="mt-0.5 size-5 shrink-0 text-secondary-foreground" />
      )}
      <div>
        <p className="font-medium">
          {isRejected ? labels.rejectedTitle : labels.pendingTitle}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRejected ? labels.rejectedDescription : labels.pendingDescription}
        </p>
      </div>
    </div>
  );
}
