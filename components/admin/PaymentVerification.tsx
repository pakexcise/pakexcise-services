"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SecurePaymentViewer } from "@/components/shared/SecurePaymentViewer";
import {
  rejectPaymentAction,
  verifyPaymentAction,
} from "@/features/payments/actions";
import { broadcastApplicationUpdate } from "@/features/realtime/broadcast-application-update";

type PaymentVerificationProps = {
  payment: {
    id: string;
    status: string;
    amount: string;
    fileName?: string | null;
    rejectionReason?: string | null;
  };
  labels: {
    title: string;
    description: string;
    amount: string;
    approve: string;
    approving: string;
    reject: string;
    rejecting: string;
    verifyNote: string;
    rejectReason: string;
    rejectNote: string;
    successApprove: string;
    successReject: string;
    error: string;
    viewerLoading: string;
    viewerError: string;
    viewerRetry: string;
    viewerOpen: string;
    viewerUnsupported: string;
  };
};

export function PaymentVerification({ payment, labels }: PaymentVerificationProps) {
  const router = useRouter();
  const [verifyNote, setVerifyNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (payment.status !== "UPLOADED") {
    return null;
  }

  function handleApprove() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await verifyPaymentAction({
        paymentId: payment.id,
        note: verifyNote,
      });

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      setMessage(labels.successApprove);
      broadcastApplicationUpdate();
      router.refresh();
    });
  }

  function handleReject() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await rejectPaymentAction({
        paymentId: payment.id,
        reason: rejectReason,
        note: rejectNote,
      });

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      setMessage(labels.successReject);
      broadcastApplicationUpdate();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold">{labels.title}</h3>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
        <p className="text-sm">
          {labels.amount}: PKR {payment.amount}
        </p>
      </div>

      <SecurePaymentViewer
        paymentId={payment.id}
        labels={{
          loading: labels.viewerLoading,
          error: labels.viewerError,
          retry: labels.viewerRetry,
          openNewTab: labels.viewerOpen,
          unsupported: labels.viewerUnsupported,
        }}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded-lg border p-4">
          <Label htmlFor="verifyNote">{labels.verifyNote}</Label>
          <Textarea
            id="verifyNote"
            value={verifyNote}
            onChange={(event) => setVerifyNote(event.target.value)}
            rows={3}
            required
            minLength={3}
          />
          <Button
            type="button"
            onClick={handleApprove}
            disabled={isPending || verifyNote.trim().length < 3}
          >
            {isPending ? labels.approving : labels.approve}
          </Button>
        </div>

        <div className="space-y-2 rounded-lg border p-4">
          <Label htmlFor="rejectReason">{labels.rejectReason}</Label>
          <Textarea
            id="rejectReason"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={2}
            required
            minLength={3}
          />
          <Label htmlFor="rejectNote">{labels.rejectNote}</Label>
          <Textarea
            id="rejectNote"
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
            rows={2}
            required
            minLength={3}
          />
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={
              isPending ||
              rejectReason.trim().length < 3 ||
              rejectNote.trim().length < 3
            }
          >
            {isPending ? labels.rejecting : labels.reject}
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
    </div>
  );
}
