"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { syncServiceAvailabilityAction } from "@/features/services/admin/actions/service-availability-actions";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
type ServiceOption = {
  id: string;
  nameEn: string;
  slug: string;
};

type RegionOption = {
  id: string;
  nameEn: string;
  slug: string;
};

type ServiceAvailabilityMatrixProps = {
  services: ServiceOption[];
  regions: RegionOption[];
  initialAssignments: Record<string, string[]>;
  locale: "en";
  labels: {
    service: string;
    save: string;
    saving: string;
    saved: string;
    saveFailed: string;
    emptyServices: string;
    emptyRegions: string;
    hint: string;
  };
};

export function ServiceAvailabilityMatrix({
  services,
  regions,
  initialAssignments,
  locale,
  labels}: ServiceAvailabilityMatrixProps) {
  const router = useRouter();
  const [assignments, setAssignments] =
    useState<Record<string, string[]>>(initialAssignments);
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);
  const [savedServiceId, setSavedServiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirtyServices = useMemo(() => {
    const dirty = new Set<string>();

    for (const service of services) {
      const current = [...(assignments[service.id] ?? [])].sort().join(",");
      const initial = [...(initialAssignments[service.id] ?? [])].sort().join(",");

      if (current !== initial) {
        dirty.add(service.id);
      }
    }

    return dirty;
  }, [assignments, initialAssignments, services]);

  function toggleRegion(serviceId: string, regionId: string) {
    setSavedServiceId(null);
    setError(null);
    setAssignments((current) => {
      const existing = current[serviceId] ?? [];
      const next = existing.includes(regionId)
        ? existing.filter((id) => id !== regionId)
        : [...existing, regionId];

      return { ...current, [serviceId]: next };
    });
  }

  function handleSave(serviceId: string) {
    setPendingServiceId(serviceId);
    setSavedServiceId(null);
    setError(null);

    startTransition(async () => {
      const result = await syncServiceAvailabilityAction({
        serviceId,
        regionIds: assignments[serviceId] ?? []});

      setPendingServiceId(null);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSavedServiceId(serviceId);
      router.refresh();
    });
  }

  if (regions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{labels.emptyRegions}</p>
    );
  }

  if (services.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{labels.emptyServices}</p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{labels.hint}</p>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="sticky start-0 z-10 bg-muted/40 px-4 py-3 text-start font-medium">
                {labels.service}
              </th>
              {regions.map((region) => (
                <th
                  key={region.id}
                  className="px-3 py-3 text-center font-medium whitespace-nowrap"
                >
                  {region.nameEn}
                </th>
              ))}
              <th className="px-4 py-3 text-end font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const isDirty = dirtyServices.has(service.id);
              const isSaving = isPending && pendingServiceId === service.id;
              const isSaved = savedServiceId === service.id && !isDirty;

              return (
                <tr key={service.id} className="border-b last:border-b-0">
                  <td className="sticky start-0 z-10 bg-background px-4 py-3 font-medium">
                    {service.nameEn}
                  </td>
                  {regions.map((region) => {
                    const checked = (assignments[service.id] ?? []).includes(
                      region.id,
                    );

                    return (
                      <td key={region.id} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          aria-label={`${service.nameEn} — ${region.nameEn}`}
                          className="size-4 accent-primary"
                          onChange={() => toggleRegion(service.id, region.id)}
                        />
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-end">
                    <Button
                      type="button"
                      size="sm"
                      variant={isDirty ? "default" : "outline"}
                      disabled={!isDirty || isSaving}
                      onClick={() => handleSave(service.id)}
                      className={cn(isSaved && !isDirty && "border-emerald-500/40")}
                    >
                      {isSaving
                        ? labels.saving
                        : isSaved && !isDirty
                          ? labels.saved
                          : labels.save}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
