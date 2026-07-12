export type FaqCategorySeed = {
  slug: string;
  nameEn: string;
  displayOrder: number;
};

export type FaqItemSeed = {
  categorySlug: string;
  questionEn: string;
  answerEn: string;
  displayOrder: number;
  isFeatured?: boolean;
  featuredDisplayOrder?: number;
};

export const FAQ_CATEGORY_SEEDS: FaqCategorySeed[] = [
  { slug: "general", nameEn: "General", displayOrder: 1 },
  { slug: "services", nameEn: "Services", displayOrder: 2 },
  { slug: "support", nameEn: "Support", displayOrder: 3 },
  { slug: "account", nameEn: "Account", displayOrder: 4 },
  {
    slug: "documents",
    nameEn: "Documents",
    displayOrder: 5},
  {
    slug: "vehicle-number-formats",
    nameEn: "Vehicle Number Formats",
    displayOrder: 6},
  {
    slug: "billing-payment",
    nameEn: "Billing & Payment",
    displayOrder: 7},
  { slug: "tracking", nameEn: "Tracking", displayOrder: 8 },
  {
    slug: "refund-cancellation",
    nameEn: "Refund & Cancellation",
    displayOrder: 9}];

/** Legacy category slugs deactivated after re-seed. */
export const DEPRECATED_FAQ_CATEGORY_SLUGS = ["billing", "regions"] as const;

export const FAQ_ITEM_SEEDS: FaqItemSeed[] = [
  {
    categorySlug: "general",
    questionEn: "What is PakExcise?",
    answerEn:
      "PakExcise is a private facilitation platform in Pakistan that helps users get support for vehicle transfer, token tax, new vehicle registration, driving license renewal, learner's license, route permit, vehicle data correction, vehicle passing/fitness, and e-challan-related services.",
    displayOrder: 1},
  {
    categorySlug: "general",
    questionEn: "Is PakExcise.com a government website?",
    answerEn:
      "No. PakExcise.com is a private facilitation service and is not affiliated with any government department, Excise & Taxation office, MTMIS, NADRA, ICT Excise, Safe City, or any Government of Pakistan body.",
    displayOrder: 2,
    isFeatured: true,
    featuredDisplayOrder: 1},
  {
    categorySlug: "general",
    questionEn: "What services does PakExcise provide?",
    answerEn:
      "PakExcise provides private facilitation support for vehicle services, license services, and e-challan/Safe City-related guidance. Services include vehicle transfer, token tax payment support, new vehicle registration, vehicle passing/fitness, route permit, data correction, driving license renewal, learner's license, and e-challan support.",
    displayOrder: 3,
    isFeatured: true,
    featuredDisplayOrder: 2},
  {
    categorySlug: "general",
    questionEn: "Does PakExcise provide services in all provinces?",
    answerEn:
      "Service availability depends on the selected service and province. Some services are available in Punjab and Islamabad ICT, while token tax and e-challan support may cover more provinces. You can check the service page or province page to see current availability.",
    displayOrder: 4},
  {
    categorySlug: "general",
    questionEn: "Can PakExcise guarantee approval or completion?",
    answerEn:
      "PakExcise helps with private facilitation, document guidance, request handling, and support. Final approval, verification, tax status, challan status, registration update, or license processing may depend on the relevant official system, department, documents, and user-provided information.",
    displayOrder: 5},
  {
    categorySlug: "services",
    questionEn: "Which vehicle services are available on PakExcise?",
    answerEn:
      "PakExcise supports vehicle transfer, token tax payment support, new vehicle registration, vehicle passing/fitness, route permit, and vehicle data correction where available by province.",
    displayOrder: 1},
  {
    categorySlug: "services",
    questionEn: "Which license services are available?",
    answerEn:
      "PakExcise provides facilitation support for driving license renewal and learner's license services where available, including Punjab and Islamabad ICT based on service availability.",
    displayOrder: 2},
  {
    categorySlug: "services",
    questionEn: "Does PakExcise support e-challan services?",
    answerEn:
      "Yes. PakExcise provides private guidance and support for e-challan/Safe City-related queries. Users may need to upload a clear smart card or registration book depending on the request.",
    displayOrder: 3},
  {
    categorySlug: "services",
    questionEn: "Can I apply for token tax payment through PakExcise?",
    answerEn:
      "Yes. PakExcise provides token tax payment support for supported provinces. You may need to provide your vehicle registration number in the correct province format.",
    displayOrder: 4},
  {
    categorySlug: "services",
    questionEn: "Can I apply for vehicle transfer through PakExcise?",
    answerEn:
      "Yes. PakExcise provides vehicle transfer facilitation support for supported regions such as Punjab and Islamabad ICT. Required documents may vary by province.",
    displayOrder: 5},
  {
    categorySlug: "services",
    questionEn: "Can I request vehicle data correction?",
    answerEn:
      "Yes. PakExcise can help you submit a data correction request where available. Common correction types include name spelling, father name spelling, CNIC digits, address, engine number, chassis number, vehicle color, engine capacity/CC, and other record corrections.",
    displayOrder: 6},
  {
    categorySlug: "support",
    questionEn: "Can I get help on WhatsApp?",
    answerEn:
      "Yes. You can contact PakExcise support on WhatsApp for quick guidance. WhatsApp support is useful if you want fast help before submitting a request or applying with an account.",
    displayOrder: 1,
    isFeatured: true,
    featuredDisplayOrder: 3},
  {
    categorySlug: "support",
    questionEn: "What is Quick WhatsApp Service?",
    answerEn:
      "Quick WhatsApp Service allows you to contact PakExcise support directly on WhatsApp. This is the fastest option for basic guidance, document questions, service availability, and next steps.",
    displayOrder: 2},
  {
    categorySlug: "support",
    questionEn: "What is Submit Request?",
    answerEn:
      "Submit Request allows you to send a simple service request without creating an account. After submission, PakExcise support may contact you on WhatsApp for further details and guidance.",
    displayOrder: 3},
  {
    categorySlug: "support",
    questionEn: "What is Apply with Account?",
    answerEn:
      "Apply with Account is for users who want full website tracking. After creating an account, you can submit an application, upload documents, view status, check invoices, see history, and receive updates from your dashboard.",
    displayOrder: 4},
  {
    categorySlug: "support",
    questionEn: "What are PakExcise support hours?",
    answerEn:
      "PakExcise support is available Monday to Sunday from 7:00 AM to 12:00 PM. Support availability may vary during holidays, technical maintenance, or high request volume.",
    displayOrder: 5},
  {
    categorySlug: "account",
    questionEn: "Do I need to create an account to use PakExcise?",
    answerEn:
      "No. You can use WhatsApp support or Submit Request without creating an account. However, if you want full tracking, document history, invoice history, and status updates, you should apply with an account.",
    displayOrder: 1,
    isFeatured: true,
    featuredDisplayOrder: 4},
  {
    categorySlug: "account",
    questionEn: "What are the benefits of creating an account?",
    answerEn:
      "An account allows you to track application status, upload documents, view invoices, check payment status, see application history, and receive updates from your dashboard.",
    displayOrder: 2},
  {
    categorySlug: "account",
    questionEn: "Can I track my request without an account?",
    answerEn:
      "Tracking is mainly available for account-based applications. If you use Quick WhatsApp Service or Submit Request, support may continue through WhatsApp instead of full website tracking.",
    displayOrder: 3},
  {
    categorySlug: "account",
    questionEn: "Can I edit my submitted application?",
    answerEn:
      "Editing depends on the application status. If your application is still under review, PakExcise support may request corrections or additional documents. Some details may not be editable once processing has started.",
    displayOrder: 4},
  {
    categorySlug: "documents",
    questionEn: "Can I see required documents before applying?",
    answerEn:
      "Yes. PakExcise shows required documents where available based on the selected service and province. Document requirements may vary for Punjab, Islamabad ICT, Sindh, Balochistan, Khyber Pakhtunkhwa, AJK, and other regions.",
    displayOrder: 1,
    isFeatured: true,
    featuredDisplayOrder: 5},
  {
    categorySlug: "documents",
    questionEn: "Why do document requirements vary by province?",
    answerEn:
      "Each province or region may follow different service requirements, vehicle number formats, verification steps, or document processes. PakExcise displays requirements based on the selected service and province.",
    displayOrder: 2},
  {
    categorySlug: "documents",
    questionEn: "What file types can I upload?",
    answerEn:
      "PakExcise may allow common file types such as JPG, PNG, WebP, and PDF depending on the document type. Uploaded files should be clear, readable, and relevant to the selected service.",
    displayOrder: 3},
  {
    categorySlug: "documents",
    questionEn: "What happens if my document is unclear or incorrect?",
    answerEn:
      "If a document is unclear, incomplete, expired, or incorrect, PakExcise support may ask you to upload a new document or provide additional information before the request can move forward.",
    displayOrder: 4},
  {
    categorySlug: "documents",
    questionEn: "Is my uploaded document safe?",
    answerEn:
      "PakExcise uses reasonable security practices such as restricted access, secure storage, and role-based access controls to protect uploaded documents. You should only upload documents required for your selected service.",
    displayOrder: 5},
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "Why is vehicle number format important?",
    answerEn:
      "Vehicle number format is important because different provinces use different registration number patterns. Entering the wrong format may cause delays, incorrect search results, or failed verification.",
    displayOrder: 1},
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "What is the Punjab vehicle number format?",
    answerEn:
      "Punjab vehicle registration numbers may use formats such as ABC 123, ABC 0123, ABC 1111, or ABC-07-1111, depending on the registration type and record.",
    displayOrder: 2},
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "What is the Islamabad ICT vehicle number format?",
    answerEn: "Islamabad ICT vehicle numbers commonly use the format ABC-123.",
    displayOrder: 3},
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "What is the Sindh vehicle number format?",
    answerEn: "Sindh vehicle numbers commonly use the format ABC-123.",
    displayOrder: 4},
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "What is the Khyber Pakhtunkhwa vehicle number format?",
    answerEn:
      "Khyber Pakhtunkhwa vehicle numbers may use formats such as ABC-1234 or ABC-123.",
    displayOrder: 5},
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "What is the Azad Jammu & Kashmir vehicle number format?",
    answerEn:
      "Azad Jammu & Kashmir vehicle numbers may use formats such as AA-BB-1234 or AB-123, depending on the vehicle type and registration style.",
    displayOrder: 6},
  {
    categorySlug: "billing-payment",
    questionEn: "Are service fees shown on the website?",
    answerEn:
      "No. PakExcise does not show fixed service fees on public pages. Facilitation charges may depend on the service type, province, document requirements, case status, and support needed.",
    displayOrder: 1,
    isFeatured: true,
    featuredDisplayOrder: 6},
  {
    categorySlug: "billing-payment",
    questionEn: "How will I know the payment amount?",
    answerEn:
      "If payment is required, PakExcise will share the amount through an invoice, application update, or support message after reviewing your request.",
    displayOrder: 2},
  {
    categorySlug: "billing-payment",
    questionEn: "Are government fees included in PakExcise charges?",
    answerEn:
      "Government fees, official taxes, challans, penalties, registration fees, license fees, or department charges are separate where applicable. PakExcise facilitation charges are separate from official charges.",
    displayOrder: 3},
  {
    categorySlug: "billing-payment",
    questionEn: "How do I upload payment proof?",
    answerEn:
      "For account-based applications, you may upload payment proof from your dashboard when an invoice is issued. The screenshot or receipt should be clear and include amount, date/time, and transaction details where available.",
    displayOrder: 4},
  {
    categorySlug: "billing-payment",
    questionEn: "When is my payment considered verified?",
    answerEn:
      "Payment is considered verified only after PakExcise reviews and approves the payment proof. Uploading a screenshot does not automatically confirm payment.",
    displayOrder: 5},
  {
    categorySlug: "tracking",
    questionEn: "How do I track my application?",
    answerEn:
      "You can track your application from the Track page using your tracking ID. Account users can also view status, invoices, documents, history, and updates from their dashboard.",
    displayOrder: 1,
    isFeatured: true,
    featuredDisplayOrder: 7},
  {
    categorySlug: "tracking",
    questionEn: 'What does "Submitted" status mean?',
    answerEn:
      "Submitted means your application has been received and is waiting for review by PakExcise support or admin.",
    displayOrder: 2},
  {
    categorySlug: "tracking",
    questionEn: 'What does "Docs Required" status mean?',
    answerEn:
      "Docs Required means additional documents or corrected files are needed before your application can move forward.",
    displayOrder: 3},
  {
    categorySlug: "tracking",
    questionEn: 'What does "Invoice Sent" status mean?',
    answerEn:
      "Invoice Sent means PakExcise has reviewed your request and shared payment details or invoice information where applicable.",
    displayOrder: 4},
  {
    categorySlug: "tracking",
    questionEn: 'What does "Completed" status mean?',
    answerEn:
      "Completed means PakExcise has completed the agreed facilitation step or service handling based on the selected request and available process.",
    displayOrder: 5},
  {
    categorySlug: "refund-cancellation",
    questionEn: "Can I cancel my request?",
    answerEn:
      "You may request cancellation before processing starts. If document review, support work, coordination, payment handling, or service processing has already started, cancellation may not qualify for a full refund.",
    displayOrder: 1},
  {
    categorySlug: "refund-cancellation",
    questionEn: "Can I get a refund?",
    answerEn:
      "Refund eligibility depends on payment status, application status, and work completed. Duplicate payments or payments made by mistake may be reviewed by PakExcise support.",
    displayOrder: 2},
  {
    categorySlug: "refund-cancellation",
    questionEn: "Are government fees refundable?",
    answerEn:
      "Government fees, official taxes, challans, courier charges, wallet/bank charges, or third-party charges are usually non-refundable once paid or submitted.",
    displayOrder: 3}];
