import { SiteLogo } from "@/components/shared/SiteLogo";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { disclaimerCompactClassName } from "@/lib/styles/disclaimer-banner";

type AuthShellProps = {
  title: string;
  description: string;
  disclaimer: string;
  children: React.ReactNode;
};

export function AuthShell({
  title,
  description,
  disclaimer,
  children,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background px-4 py-10 dark:from-primary/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(33,89,186,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(33,89,186,0.14),transparent_55%)]" />
      <div className="relative w-full max-w-lg space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex justify-center hover:opacity-90">
            <SiteLogo priority imageClassName="max-h-11" />
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        <p className={cn("text-center font-medium", disclaimerCompactClassName)}>
          {disclaimer}
        </p>

        <div className="w-full overflow-hidden rounded-2xl border bg-card/95 p-6 shadow-sm backdrop-blur-sm sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
