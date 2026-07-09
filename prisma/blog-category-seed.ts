export const BLOG_CATEGORY_SEED = [
  {
    slug: "vehicle-excise-guide",
    nameEn: "Vehicle & Excise Guide",
    nameUr: "گاڑی اور ایکسائز گائیڈ",
    displayOrder: 1,
    children: [
      {
        slug: "vehicle-services",
        nameEn: "Vehicle Services",
        nameUr: "گاڑی کی خدمات",
        displayOrder: 1,
      },
      {
        slug: "license-services",
        nameEn: "License Services",
        nameUr: "لائسنس خدمات",
        displayOrder: 2,
      },
      {
        slug: "token-tax-guides",
        nameEn: "Token Tax Guides",
        nameUr: "ٹوکن ٹیکس گائیڈز",
        displayOrder: 3,
      },
    ],
  },
  {
    slug: "how-to-guides",
    nameEn: "How-to Guides",
    nameUr: "عملی گائیڈز",
    displayOrder: 2,
    children: [
      {
        slug: "step-by-step",
        nameEn: "Step-by-step Guides",
        nameUr: "مرحلہ وار گائیڈز",
        displayOrder: 1,
      },
      {
        slug: "document-checklists",
        nameEn: "Document Checklists",
        nameUr: "دستاویز چیک لسٹ",
        displayOrder: 2,
      },
    ],
  },
] as const;

export const PRIMARY_BLOG_CATEGORY_SLUG = "vehicle-excise-guide";
export const PRIMARY_BLOG_SUBCATEGORY_SLUG = "vehicle-services";
