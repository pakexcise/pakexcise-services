"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteServiceFormFieldAction,
  upsertServiceFormFieldAction,
} from "@/features/services/admin/actions/service-actions";
import type { FormFieldsPanelLabels } from "@/features/services/admin/lib/labels";
import type { AdminServiceDetail } from "@/server/repositories/admin-service-repository";

const FIELD_TYPES = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "SELECT",
  "MULTI_SELECT",
  "RADIO",
  "CHECKBOX",
  "FILE",
  "EMAIL",
  "PHONE",
  "CNIC",
] as const;

type FormFieldsPanelProps = {
  serviceId: string;
  fields: AdminServiceDetail["formFields"];
  labels: FormFieldsPanelLabels;
};

type FieldDraft = {
  id?: string;
  fieldKey: string;
  labelEn: string;
  labelUr: string;
  placeholderEn: string;
  placeholderUr: string;
  helpTextEn: string;
  helpTextUr: string;
  fieldType: (typeof FIELD_TYPES)[number];
  isRequired: boolean;
  isEncrypted: boolean;
  optionsJson: string;
  validationJson: string;
  conditionalJson: string;
  displayOrder: number;
  isActive: boolean;
};

function emptyDraft(displayOrder: number): FieldDraft {
  return {
    fieldKey: "",
    labelEn: "",
    labelUr: "",
    placeholderEn: "",
    placeholderUr: "",
    helpTextEn: "",
    helpTextUr: "",
    fieldType: "TEXT",
    isRequired: false,
    isEncrypted: false,
    optionsJson: "",
    validationJson: "",
    conditionalJson: "",
    displayOrder,
    isActive: true,
  };
}

function jsonToText(value: unknown): string {
  if (!value) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function toDraft(field: AdminServiceDetail["formFields"][number]): FieldDraft {
  return {
    id: field.id,
    fieldKey: field.fieldKey,
    labelEn: field.labelEn,
    labelUr: field.labelUr,
    placeholderEn: field.placeholderEn ?? "",
    placeholderUr: field.placeholderUr ?? "",
    helpTextEn: field.helpTextEn ?? "",
    helpTextUr: field.helpTextUr ?? "",
    fieldType: field.fieldType,
    isRequired: field.isRequired,
    isEncrypted: field.isEncrypted,
    optionsJson: jsonToText(field.optionsJson),
    validationJson: jsonToText(field.validationJson),
    conditionalJson: jsonToText(field.conditionalJson),
    displayOrder: field.displayOrder,
    isActive: field.isActive,
  };
}

function parseJsonField(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed) as Record<string, unknown> | unknown[];
}

export function FormFieldsPanel({
  serviceId,
  fields,
  labels,
}: FormFieldsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<FieldDraft>(emptyDraft(fields.length + 1));
  const [error, setError] = useState<string | null>(null);

  function saveField() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await upsertServiceFormFieldAction({
          ...draft,
          serviceId,
          optionsJson: parseJsonField(draft.optionsJson),
          validationJson: parseJsonField(draft.validationJson),
          conditionalJson: parseJsonField(draft.conditionalJson),
        });

        if (!result.success) {
          setError(result.error);
          return;
        }

        setDraft(emptyDraft(fields.length + 2));
        router.refresh();
      } catch (parseError) {
        setError(
          parseError instanceof Error ? parseError.message : labels.invalidJson,
        );
      }
    });
  }

  function removeField(id: string) {
    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteServiceFormFieldAction({ id, serviceId });

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
        {fields.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <ul className="divide-y">
            {fields.map((field) => (
              <li
                key={field.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{field.labelEn}</p>
                  <p className="text-xs text-muted-foreground">
                    {field.fieldKey} · {field.fieldType}
                    {field.isRequired ? ` · ${labels.required}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setDraft(toDraft(field))}
                  >
                    {labels.edit}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => removeField(field.id)}
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
          {draft.id ? labels.editField : labels.addField}
        </h3>
        <div>
          <Label className="mb-2 block">{labels.fieldKey}</Label>
          <Input
            value={draft.fieldKey}
            onChange={(event) =>
              setDraft((current) => ({ ...current, fieldKey: event.target.value }))
            }
          />
        </div>
        <div>
          <Label className="mb-2 block">{labels.fieldType}</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={draft.fieldType}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                fieldType: event.target.value as FieldDraft["fieldType"],
              }))
            }
          >
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
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
        <div>
          <Label className="mb-2 block">{labels.placeholderEn}</Label>
          <Input
            value={draft.placeholderEn}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                placeholderEn: event.target.value,
              }))
            }
          />
        </div>
        <div>
          <Label className="mb-2 block">{labels.placeholderUr}</Label>
          <Input
            value={draft.placeholderUr}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                placeholderUr: event.target.value,
              }))
            }
            dir="rtl"
          />
        </div>
        <div className="lg:col-span-2">
          <Label className="mb-2 block">{labels.helpTextEn}</Label>
          <Textarea
            value={draft.helpTextEn}
            onChange={(event) =>
              setDraft((current) => ({ ...current, helpTextEn: event.target.value }))
            }
          />
        </div>
        <div className="lg:col-span-2">
          <Label className="mb-2 block">{labels.helpTextUr}</Label>
          <Textarea
            value={draft.helpTextUr}
            onChange={(event) =>
              setDraft((current) => ({ ...current, helpTextUr: event.target.value }))
            }
            dir="rtl"
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
        <div className="flex flex-col gap-2">
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
              checked={draft.isEncrypted}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  isEncrypted: event.target.checked,
                }))
              }
            />
            {labels.isEncrypted}
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
        <div className="lg:col-span-2">
          <Label className="mb-2 block">{labels.optionsJson}</Label>
          <Textarea
            className="min-h-24 font-mono text-xs"
            value={draft.optionsJson}
            onChange={(event) =>
              setDraft((current) => ({ ...current, optionsJson: event.target.value }))
            }
          />
        </div>
        <div className="lg:col-span-2">
          <Label className="mb-2 block">{labels.validationJson}</Label>
          <Textarea
            className="min-h-24 font-mono text-xs"
            value={draft.validationJson}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                validationJson: event.target.value,
              }))
            }
          />
        </div>
        <div className="lg:col-span-2">
          <Label className="mb-2 block">{labels.conditionalJson}</Label>
          <Textarea
            className="min-h-24 font-mono text-xs"
            value={draft.conditionalJson}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                conditionalJson: event.target.value,
              }))
            }
          />
        </div>
        <div className="flex gap-2 lg:col-span-2">
          <Button type="button" onClick={saveField} disabled={isPending}>
            {labels.saveField}
          </Button>
          {draft.id ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraft(emptyDraft(fields.length + 1))}
            >
              {labels.clear}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
