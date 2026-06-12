"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCityAction,
  deleteCityAction,
  toggleCityAction,
} from "@/features/cities/admin/actions/city-actions";
import type { AdminCityListItem } from "@/server/repositories/admin-city-repository";

type RegionCitiesPanelProps = {
  regionId: string;
  cities: AdminCityListItem[];
  labels: {
    title: string;
    addCity: string;
    slug: string;
    nameEn: string;
    nameUr: string;
    descriptionEn: string;
    isActive: string;
    save: string;
    saving: string;
    delete: string;
    confirmDelete: string;
    active: string;
    inactive: string;
    empty: string;
  };
};

export function RegionCitiesPanel({
  regionId,
  cities,
  labels,
}: RegionCitiesPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameUr, setNameUr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");

  function handleCreate() {
    startTransition(async () => {
      const result = await createCityAction({
        regionId,
        slug,
        nameEn,
        nameUr,
        descriptionEn: descriptionEn || null,
        descriptionUr: null,
        isActive: true,
        displayOrder: cities.length,
      });

      if (result.success) {
        setShowForm(false);
        setSlug("");
        setNameEn("");
        setNameUr("");
        setDescriptionEn("");
        router.refresh();
      }
    });
  }

  function handleToggle(cityId: string, isActive: boolean) {
    startTransition(async () => {
      await toggleCityAction({ id: cityId, isActive });
      router.refresh();
    });
  }

  function handleDelete(cityId: string) {
    if (!window.confirm(labels.confirmDelete)) return;

    startTransition(async () => {
      await deleteCityAction({ id: cityId });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{labels.title}</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowForm((current) => !current)}
        >
          {labels.addCity}
        </Button>
      </div>

      {showForm ? (
        <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{labels.slug}</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{labels.nameEn}</Label>
            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{labels.nameUr}</Label>
            <Input
              value={nameUr}
              onChange={(e) => setNameUr(e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{labels.descriptionEn}</Label>
            <Textarea
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={isPending}
            onClick={handleCreate}
            className="md:col-span-2"
          >
            {isPending ? labels.saving : labels.save}
          </Button>
        </div>
      ) : null}

      {cities.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="space-y-2">
          {cities.map((city) => (
            <div
              key={city.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
            >
              <div>
                <p className="font-medium">{city.nameEn}</p>
                <p className="text-xs text-muted-foreground">{city.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleToggle(city.id, !city.isActive)}
                >
                  {city.isActive ? labels.active : labels.inactive}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => handleDelete(city.id)}
                >
                  {labels.delete}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
