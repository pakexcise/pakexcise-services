export type ServiceEditorLabels = Awaited<
  ReturnType<typeof getServiceEditorLabels>
>;
export type DocumentPanelLabels = Awaited<
  ReturnType<typeof getDocumentPanelLabels>
>;
export type FormFieldsPanelLabels = Awaited<
  ReturnType<typeof getFormFieldsPanelLabels>
>;

export async function getServiceEditorLabels() {
    return {
    tabGeneral: "General",
    tabSeo: "SEO",
    slug: "Slug",
    region: "Region",
    regions: "Assigned provinces",
    selectRegion: "Select region",
    nameEn: "Name (English)",
    shortDescriptionEn: "Short description (English)",
    contentEn: "Content (English)",
    ctaTextEn: "CTA text (English)",
    processingNotesEn: "Processing notes (English)",
    internalNotes: "Internal admin notes",
    internalNotesHint: "Visible to admin only. Not shown on public pages.",
    referenceLinksJson: "Reference links JSON",
    referenceLinksHint: "Optional JSON array. Each item needs labelEn, and url (HTTPS).",
    category: "Service category",
    selectCategory: "Select category",
    inactiveCategory: "inactive",
    parentService: "Parent service (sub-service of)",
    noParentService: "Top-level service",
    requiresProof: "Requires completion proof",
    isActive: "Active",
    isFeatured: "Featured on homepage",
    featuredDisplayOrder: "Featured display order",
    showInFooter: "Show in site footer",
    footerDisplayOrder: "Footer display order",
    displayOrder: "Display order",
    metaTitleEn: "Meta title (English)",
    metaDescriptionEn: "Meta description (English)",
    h1En: "H1 (English)",
    canonicalUrl: "Canonical URL",
    ogTitleEn: "OG title (English)",
    ogDescriptionEn: "OG description (English)",
    ogImage: "OG image URL",
    robotsIndex: "Allow indexing",
    robotsFollow: "Allow following links",
    faqSchemaJson: "FAQ schema JSON",
    breadcrumbJson: "Breadcrumb schema JSON",
    save: "Save service",
    saving: "Saving...",
    saveFailed: "Failed to save service",
    cancel: "Cancel"};
}

export async function getDocumentPanelLabels() {
    return {
    existing: "Current requirements",
    empty: "No document requirements configured yet.",
    addDocument: "Add document requirement",
    editDocument: "Edit document requirement",
    docType: "Document type key",
    labelEn: "Label (English)",
    instructionsEn: "Instructions (English)",
    required: "Required",
    optional: "Optional",
    maxSizeBytes: "Max file size (bytes)",
    acceptedMimeTypes: "Accepted MIME types (comma separated)",
    displayOrder: "Display order",
    isActive: "Active",
    region: "Province scope",
    allRegions: "All assigned provinces",
    saveDocument: "Save requirement",
    clear: "Clear form",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Delete this document requirement?"};
}

export async function getFormFieldsPanelLabels() {
    return {
    existing: "Current form fields",
    empty: "No dynamic form fields configured yet.",
    addField: "Add form field",
    editField: "Edit form field",
    fieldKey: "Field key",
    fieldType: "Field type",
    labelEn: "Label (English)",
    placeholderEn: "Placeholder (English)",
    helpTextEn: "Help text (English)",
    required: "Required",
    isEncrypted: "Encrypt stored value",
    isActive: "Active",
    displayOrder: "Display order",
    optionsJson: "Options JSON",
    validationJson: "Validation JSON",
    conditionalJson: "Conditional logic JSON",
    saveField: "Save field",
    clear: "Clear form",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Delete this form field?",
    invalidJson: "Invalid JSON format"};
}
