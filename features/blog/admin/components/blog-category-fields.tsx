"use client";

import { Label } from "@/components/ui/label";

type CategoryOption = { id: string; label: string };

type BlogCategoryFieldsProps = {
  categoryId: string;
  subCategoryId: string;
  parents: CategoryOption[];
  childrenByParent: Record<string, CategoryOption[]>;
  onCategoryChange: (categoryId: string) => void;
  onSubCategoryChange: (subCategoryId: string) => void;
};

export function BlogCategoryFields({
  categoryId,
  subCategoryId,
  parents,
  childrenByParent,
  onCategoryChange,
  onSubCategoryChange,
}: BlogCategoryFieldsProps) {
  const subCategories = categoryId ? (childrenByParent[categoryId] ?? []) : [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="blogCategoryId">Category</Label>
        <select
          id="blogCategoryId"
          value={categoryId}
          onChange={(event) => {
            onCategoryChange(event.target.value);
            onSubCategoryChange("");
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select category</option>
          {parents.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="blogSubCategoryId">Sub-category</Label>
        <select
          id="blogSubCategoryId"
          value={subCategoryId}
          disabled={!categoryId || subCategories.length === 0}
          onChange={(event) => onSubCategoryChange(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Select sub-category (optional)</option>
          {subCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
