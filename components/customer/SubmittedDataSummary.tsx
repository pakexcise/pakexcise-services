type SubmittedField = {
  fieldId: string;
  label: string;
  displayValue: string;
  isMasked: boolean;
};

type SubmittedDataSummaryProps = {
  fields: SubmittedField[];
  labels: {
    title: string;
    empty: string;
    protected: string;
  };
};

export function SubmittedDataSummary({
  fields,
  labels,
}: SubmittedDataSummaryProps) {
  return (
    <div className="rounded-xl border p-5">
      <h2 className="font-semibold">{labels.title}</h2>
      {fields.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.fieldId} className="rounded-lg border p-3">
              <dt className="text-xs text-muted-foreground">{field.label}</dt>
              <dd className="mt-1 text-sm font-medium">{field.displayValue}</dd>
              {field.isMasked ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {labels.protected}
                </p>
              ) : null}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
