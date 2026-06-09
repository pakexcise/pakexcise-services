"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OtpCodeInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
};

export function OtpCodeInput({
  id,
  label,
  value,
  onChange,
  hint,
}: OtpCodeInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        value={value}
        onChange={(event) => {
          onChange(event.target.value.replace(/\D/g, "").slice(0, 6));
        }}
        className="text-center text-lg tracking-[0.4em]"
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
