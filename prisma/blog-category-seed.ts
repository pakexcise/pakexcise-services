export const BLOG_CATEGORY_SEED = [
  {
    slug: "vehicle-excise-guide",
    nameEn: "Vehicle & Excise Guide",
    displayOrder: 1,
    children: [
      {
        slug: "vehicle-services",
        nameEn: "Vehicle Services",
        displayOrder: 1,
      },
      {
        slug: "license-services",
        nameEn: "License Services",
        displayOrder: 2,
      },
      {
        slug: "token-tax-guides",
        nameEn: "Token Tax Guides",
        displayOrder: 3,
      },
    ],
  },
  {
    slug: "how-to-guides",
    nameEn: "How-to Guides",
    displayOrder: 2,
    children: [
      {
        slug: "step-by-step",
        nameEn: "Step-by-step Guides",
        displayOrder: 1,
      },
      {
        slug: "document-checklists",
        nameEn: "Document Checklists",
        displayOrder: 2,
      },
    ],
  },
] as const;

export const PRIMARY_BLOG_CATEGORY_SLUG = "vehicle-excise-guide";
export const PRIMARY_BLOG_SUBCATEGORY_SLUG = "vehicle-services";
