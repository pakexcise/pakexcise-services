const URDU_BRAND = "پاک ایکسائز";
const URDU_BRAND_DOMAIN = "پاک ایکسائز ڈاٹ کام";

export function localizeBrandTextForUrdu(text: string): string {
  return text
    .replaceAll("PakExcise.com", URDU_BRAND_DOMAIN)
    .replaceAll("PakExcise", URDU_BRAND);
}

export function localizeFaqTextForUrdu(text: string): string {
  return localizeBrandTextForUrdu(text)
    .replaceAll("Quick WhatsApp Service", "فوری واٹس ایپ سروس")
    .replaceAll("Submit Request", "درخواست جمع کریں")
    .replaceAll("Apply with Account", "اکاؤنٹ کے ساتھ درخواست")
    .replaceAll('"Docs Required"', '"دستاویزات درکار"')
    .replaceAll("Docs Required", "دستاویزات درکار")
    .replaceAll('"Invoice Sent"', '"انوائس بھیج دی گئی"')
    .replaceAll("Invoice Sent", "انوائس بھیج دی گئی")
    .replaceAll('"Submitted"', '"جمع شدہ"')
    .replaceAll("Submitted", "جمع شدہ")
    .replaceAll('"Completed"', '"مکمل"')
    .replaceAll("Completed", "مکمل")
    .replaceAll("Track صفحے", "ٹریک صفحے")
    .replaceAll("tracking ID", "ٹریکنگ آئی ڈی")
    .replaceAll("مaintainence", "مرمت")
    .replaceAll("role-based", "کردار کی بنیاد پر");
}

export function localizeFaqFieldsForUrdu<
  T extends { questionUr: string; answerUr: string },
>(faq: T): T {
  return {
    ...faq,
    questionUr: localizeFaqTextForUrdu(faq.questionUr),
    answerUr: localizeFaqTextForUrdu(faq.answerUr),
  };
}
