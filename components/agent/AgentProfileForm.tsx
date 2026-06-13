"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAgentProfileAction } from "@/features/agents/actions/profile";

const profileFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(1)
    .regex(/^(\+92|0)?3\d{9}$/),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type AgentProfileFormProps = {
  initialName: string;
  initialPhone: string;
  email: string;
  commissionRate: string;
  commissionMode: string;
  commissionFixedAmount: string | null;
  labels: {
    name: string;
    phone: string;
    email: string;
    emailReadOnly: string;
    commissionRate: string;
    commissionMode: string;
    commissionModeManual: string;
    commissionModePercentage: string;
    commissionModeFixed: string;
    fixedAmount: string;
    approvalStatus: string;
    save: string;
    saving: string;
    saved: string;
    error: string;
  };
  statusLabel: string;
};

export function AgentProfileForm({
  initialName,
  initialPhone,
  email,
  commissionRate,
  commissionMode,
  commissionFixedAmount,
  labels,
  statusLabel,
}: AgentProfileFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialName,
      phone: initialPhone,
    },
  });

  function onSubmit(values: ProfileFormValues) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateAgentProfileAction(values);

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      setMessage(labels.saved);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{labels.approvalStatus}</Label>
          <Input value={statusLabel} readOnly disabled />
        </div>
        <div className="space-y-2">
          <Label>{labels.commissionMode}</Label>
          <Input
            value={
              commissionMode === "PERCENTAGE"
                ? labels.commissionModePercentage
                : commissionMode === "FIXED"
                  ? labels.commissionModeFixed
                  : labels.commissionModeManual
            }
            readOnly
            disabled
          />
        </div>
        {commissionMode === "PERCENTAGE" ? (
          <div className="space-y-2">
            <Label>{labels.commissionRate}</Label>
            <Input value={`${commissionRate}%`} readOnly disabled />
          </div>
        ) : null}
        {commissionMode === "FIXED" ? (
          <div className="space-y-2">
            <Label>{labels.fixedAmount}</Label>
            <Input
              value={`PKR ${commissionFixedAmount ?? "0"}`}
              readOnly
              disabled
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">{labels.name}</Label>
        <Input id="name" {...register("name")} autoComplete="name" />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{labels.email}</Label>
        <Input id="email" value={email} readOnly disabled />
        <p className="text-xs text-muted-foreground">{labels.emailReadOnly}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{labels.phone}</Label>
        <Input id="phone" {...register("phone")} autoComplete="tel" />
        {errors.phone ? (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? labels.saving : labels.save}
      </Button>
    </form>
  );
}
