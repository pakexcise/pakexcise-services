"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteDocumentRequirementAction,
  upsertDocumentRequirementAction,
} from "@/features/services/admin/actions/service-actions";
import type { DocumentPanelLabels } from "@/features/services/admin/lib/labels";
import type { AdminServiceDetail } from "@/server/repositories/admin-service-repository";

const DEFAULT_MIME = "image/jpeg, image/png, image/webp, application/pdf";

type DocumentRequirementsPanelProps = {
  serviceId: string;
  documents: AdminServiceDetail["documentReqs"];
  regions: Array<{ id: string; nameEn: string; nameUr: string }>;
  labels: DocumentPanelLabels;
};

type DocumentDraft = {
  id?: string;
  regionId: string;
  docType: string;
  labelEn: string;
  labelUr: string;
  instructionsEn: string;
  instructionsUr: string;
  isRequired: boolean;
  maxSizeBytes: number;
  acceptedMimeTypes: string;
  displayOrder: number;
  isActive: boolean;
};

function emptyDraft(displayOrder: number): DocumentDraft {
  return {
    regionId: "",
    docType: "",
    labelEn: "",
    labelUr: "",
    instructionsEn: "",
    instructionsUr: "",
    isRequired: true,
    maxSizeBytes: 5242880,
    acceptedMimeTypes: DEFAULT_MIME,
    displayOrder,
    isActive: true,
  };
}

function toDraft(
  doc: AdminServiceDetail["documentReqs"][number],
): DocumentDraft {
  const mimeTypes = Array.isArray(doc.acceptedMimeTypes)
    ? (doc.acceptedMimeTypes as string[]).join(", ")
    : DEFAULT_MIME;

  return {
    id: doc.id,
    regionId: doc.regionId ?? "",
    docType: doc.docType,
    labelEn: doc.labelEn,
    labelUr: doc.labelUr,
    instructionsEn: doc.instructionsEn ?? "",
    instructionsUr: doc.instructionsUr ?? "",
    isRequired: doc.isRequired,
    maxSizeBytes: doc.maxSizeBytes,
    acceptedMimeTypes: mimeTypes,
    displayOrder: doc.displayOrder,
    isActive: doc.isActive,
  };
}

export function DocumentRequirementsPanel({
  serviceId,
  documents,
  regions,
  labels,
}: DocumentRequirementsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<DocumentDraft>(
    emptyDraft(documents.length + 1),
  );
  const [error, setError] = useState<string | null>(null);

  function saveDocument() {
    setError(null);

    startTransition(async () => {
      const result = await upsertDocumentRequirementAction({
        ...draft,
        serviceId,
        regionId: draft.regionId || null,
        acceptedMimeTypes: draft.acceptedMimeTypes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setDraft(emptyDraft(documents.length + 2));
      router.refresh();
    });
  }

  function removeDocument(id: string) {
    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteDocumentRequirementAction({ id, serviceId });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3 font-medium">{labels.existing}</div>
        {documents.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            {labels.empty}
          </p>
        ) : (
          <ul className="divide-y">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{doc.labelEn}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.docType} ·{" "}
                    {doc.region
                      ? doc.region.nameEn
                      : labels.allRegions}{" "}
                    · {doc.isRequired ? labels.required : labels.optional}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setDraft(toDraft(doc))}
                  >
                    {labels.edit}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => removeDocument(doc.id)}
                  >
                    {labels.delete}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 rounded-xl border p-4 lg:grid-cols-2">
        <h3 className="text-base font-semibold lg:col-span-2">
          {draft.id ? labels.editDocument : labels.addDocument}
        </h3>
        <div>
          <Label className="mb-2 block">{labels.region}</Label>
          <select
            value={draft.regionId}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                regionId: event.target.value,
              }))
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{labels.allRegions}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nameEn}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="mb-2 block">{labels.docType}</Label>
          <Input
            value={draft.docType}
            onChange={(event) =>
              setDraft((current) => ({ ...current, docType: event.target.value }))
            }
          />
        </div>
        <div>
          <Label className="mb-2 block">{labels.displayOrder}</Label>
          <Input
            type="number"
            value={draft.displayOrder}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                displayOrder: Number(event.target.value),
              }))
            }
          />
        </div>
        <div>
          <Label className="mb-2 block">{labels.labelEn}</Label>
          <Input
            value={draft.labelEn}
            onChange={(event) =>
              setDraft((current) => ({ ...current, labelEn: event.target.value }))
            }
          />
        </div>
        <div>
          <Label className="mb-2 block">{labels.labelUr}</Label>
          <Input
            value={draft.labelUr}
            onChange={(event) =>
              setDraft((current) => ({ ...current, labelUr: event.target.value }))
            }
            dir="rtl"
          />
        </div>
        <div className="lg:col-span-2">
          <Label className="mb-2 block">{labels.instructionsEn}</Label>
          <Textarea
            value={draft.instructionsEn}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                instructionsEn: event.target.value,
              }))
            }
          />
        </div>
        <div className="lg:col-span-2">
          <Label className="mb-2 block">{labels.instructionsUr}</Label>
          <Textarea
            value={draft.instructionsUr}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                instructionsUr: event.target.value,
              }))
            }
            dir="rtl"
          />
        </div>
        <div>
          <Label className="mb-2 block">{labels.maxSizeBytes}</Label>
          <Input
            type="number"
            value={draft.maxSizeBytes}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                maxSizeBytes: Number(event.target.value),
              }))
            }
          />
        </div>
        <div>
          <Label className="mb-2 block">{labels.acceptedMimeTypes}</Label>
          <Input
            value={draft.acceptedMimeTypes}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                acceptedMimeTypes: event.target.value,
              }))
            }
          />
        </div>
        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.isRequired}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  isRequired: event.target.checked,
                }))
              }
            />
            {labels.required}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
            />
            {labels.isActive}
          </label>
        </div>
        <div className="flex gap-2 lg:col-span-2">
          <Button type="button" onClick={saveDocument} disabled={isPending}>
            {labels.saveDocument}
          </Button>
          {draft.id ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraft(emptyDraft(documents.length + 1))}
            >
              {labels.clear}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
