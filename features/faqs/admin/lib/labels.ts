export type FaqEditorLabels = Awaited<ReturnType<typeof getFaqEditorLabels>>;
export type FaqListLabels = Awaited<ReturnType<typeof getFaqListLabels>>;

export async function getFaqEditorLabels() {
    return {
    questionEn: "Question (English)",
    answerEn: "Answer (English)",
    category: "Category",
    selectCategory: "Select a category",
    unknownCategory: "Unknown category",
    inactiveCategory: "inactive",
    service: "Linked service (optional)",
    noService: "Global FAQ (main /faqs page)",
    serviceHint: "Assign to a service page to show only on that service. Leave empty for global FAQs.",
    region: "Linked province/region (optional)",
    noRegion: "All regions",
    regionHint: "Optional. Limit this FAQ to a specific province when relevant.",
    seoKeywordsEn: "SEO keywords (English)",
    seoKeywordsPlaceholder: "Comma-separated keywords",
    isActive: "Active",
    isFeatured: "Show on homepage",
    featuredHint: "Homepage featured FAQs must be global (no linked service).",
    featuredDisplayOrder: "Homepage order",
    displayOrder: "Display order",
    save: "Save FAQ",
    saving: "Saving...",
    saveFailed: "Could not save FAQ",
    cancel: "Cancel"};
}

export async function getFaqListLabels() {
    return {
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Delete this FAQ?",
    active: "Active",
    inactive: "Inactive",
    moveUp: "Move up",
    moveDown: "Move down"};
}
