import { Separator } from "@/components/ui/separator";

type AuthDividerProps = {
  label: string;
};

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
