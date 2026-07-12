export type SocialPanelLabels = Awaited<ReturnType<typeof getSocialPanelLabels>>;

export async function getSocialPanelLabels() {
    return {
    existing: "Existing links",
    empty: "No social links configured yet.",
    addLink: "Add social link",
    editLink: "Edit social link",
    platform: "Platform",
    platformPlaceholder: "Select platform",
    url: "URL",
    iconName: "Lucide icon name",
    labelEn: "Label (English)",
    isActive: "Active",
    displayOrder: "Display order",
    saveLink: "Save link",
    clear: "Clear form",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Delete this social link?",
    saveFailed: "Could not save social link",
    whatsappNotice: "WhatsApp social links are separate from the floating WhatsApp CTA. Social links fire click_social_link; the FAB fires click_whatsapp.",
    active: "Active",
    inactive: "Inactive",
    moveUp: "Move up",
    moveDown: "Move down"};
}
