import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import Link from "next/link";
type RelatedService = {
  id: string;
  slug: string;
  nameEn: string;
  shortDescriptionEn: string | null;
};

type AttachedFaq = {
  id: string;
  questionEn: string;
  answerEn: string;
};

type ContentDetailExtrasProps = {
  locale: string;
  relatedServices: RelatedService[];
  attachedFaqs: AttachedFaq[];
  labels: {
    relatedServices: string;
    faqs: string;
  };
};

export function ContentDetailExtras({
  locale,
  relatedServices,
  attachedFaqs,
  labels}: ContentDetailExtrasProps) {
  const faqItems = mapFaqsForLocale(attachedFaqs, locale);

  return (
    <div className="container-site space-y-12 pb-12">
      {relatedServices.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{labels.relatedServices}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="rounded-xl border p-4 transition-colors hover:bg-muted/40"
              >
                <h3 className="font-medium text-primary">
                  {service.nameEn ?? ""}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {service.shortDescriptionEn ?? ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {faqItems.length > 0 ? (
        <section className="space-y-4">
          <FaqAccordion items={faqItems} title={labels.faqs} />
        </section>
      ) : null}
    </div>
  );
}
