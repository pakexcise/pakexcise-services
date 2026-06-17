import { ProseContent } from "@/components/marketing/prose-content";

type ServiceRegionNotesProps = {
  title: string;
  notes: Array<{ regionName: string; notes: string }>;
};

export function ServiceRegionNotes({ title, notes }: ServiceRegionNotesProps) {
  if (notes.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((entry) => (
          <div
            key={entry.regionName}
            className="rounded-xl border bg-muted/30 p-5"
          >
            <h3 className="font-semibold text-primary">{entry.regionName}</h3>
            <ProseContent
              content={entry.notes}
              className="mt-2 text-sm text-muted-foreground"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
