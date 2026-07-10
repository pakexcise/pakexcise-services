type BlogContentFormatGuideProps = {
  title: string;
};

export function BlogContentFormatGuide({ title }: BlogContentFormatGuideProps) {
  return (
    <details className="rounded-xl border bg-muted/20 p-4 text-sm">
      <summary className="cursor-pointer font-medium text-foreground">{title}</summary>
      <div className="mt-4 space-y-4 text-muted-foreground">
        <section className="space-y-2">
          <h4 className="font-medium text-foreground">English (LTR)</h4>
          <ul className="list-disc space-y-1 ps-5">
            <li>
              <strong>Heading (H2):</strong>{" "}
              <code className="rounded bg-muted px-1">## Section title</code>
            </li>
            <li>
              <strong>Subheading (H3):</strong>{" "}
              <code className="rounded bg-muted px-1">### Subsection title</code>
            </li>
            <li>
              <strong>Bold:</strong>{" "}
              <code className="rounded bg-muted px-1">**important text**</code>
            </li>
            <li>
              <strong>Link:</strong>{" "}
              <code className="rounded bg-muted px-1">
                [link text](https://example.com)
              </code>{" "}
              or internal{" "}
              <code className="rounded bg-muted px-1">[services](/services)</code>
            </li>
            <li>
              <strong>Bullet list:</strong> start lines with{" "}
              <code className="rounded bg-muted px-1">- item</code>
            </li>
            <li>
              <strong>Numbered list:</strong>{" "}
              <code className="rounded bg-muted px-1">1. first step</code>
            </li>
            <li>
              <strong>Image:</strong>{" "}
              <code className="rounded bg-muted px-1">![alt text](/api/blog/images/image.webp)</code>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h4 className="font-medium text-foreground">Urdu (RTL)</h4>
          <ul className="list-disc space-y-1 ps-5">
            <li>Use the Urdu content field with the same markdown syntax.</li>
            <li>Write Urdu naturally right-to-left; the editor and page render RTL automatically.</li>
            <li>
              Example heading:{" "}
              <code className="rounded bg-muted px-1" dir="rtl">
                ## PakExcise کیا ہے؟
              </code>
            </li>
            <li>
              Example link:{" "}
              <code className="rounded bg-muted px-1" dir="rtl">
                [خدمات دیکھیں](/services)
              </code>
            </li>
            <li>
              Example list:
              <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs" dir="rtl">
{`- گاڑی کی منتقلی
- ٹوکن ٹیکس
- لائسنس کی تجدید`}
              </pre>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h4 className="font-medium text-foreground">Best practices</h4>
          <ul className="list-disc space-y-1 ps-5">
            <li>Leave a blank line between paragraphs, headings, lists, and images.</li>
            <li>Use H2 for main sections and H3 for subsections (these appear in Table of Contents).</li>
            <li>Recommended in-content image size: 1200×675 px, WebP or JPEG, under 500 KB.</li>
            <li>Use the toolbar Write/Preview tabs to check formatting before publishing.</li>
          </ul>
        </section>
      </div>
    </details>
  );
}
