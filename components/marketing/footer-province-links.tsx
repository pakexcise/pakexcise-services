import { Link } from "@/i18n/navigation";

export type FooterProvinceLink = {
  id: string;
  slug: string;
  name: string;
};

type FooterProvinceLinksProps = {
  title: string;
  provinces: FooterProvinceLink[];
  emptyMessage: string;
  className?: string;
};

export function FooterProvinceLinks({
  title,
  provinces,
  emptyMessage,
  className,
}: FooterProvinceLinksProps) {
  return (
    <nav className={className} aria-label={title}>
      <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h2>

      {provinces.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-1.5">
          {provinces.map((province) => (
            <li key={province.id}>
              <Link
                href={`/regions/${province.slug}`}
                title={province.name}
                aria-label={province.name}
                className="inline-block text-sm leading-snug text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm"
              >
                {province.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
