import { Wrench } from "lucide-react";

type MaintenanceViewProps = {
  message: string;
};

export function MaintenanceView({ message }: MaintenanceViewProps) {
  return (
    <div className="container-site flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <Wrench className="size-10 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-bold">Maintenance</h1>
      <p className="max-w-lg text-muted-foreground">{message}</p>
    </div>
  );
}
