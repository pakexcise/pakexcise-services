type ApplicantDetailsSummaryProps = {
  details: {
    fullName: string;
    email: string;
    phone: string;
    cnic: string;
    hasData: boolean;
  };
  labels: {
    title: string;
    fullName: string;
    email: string;
    phone: string;
    cnic: string;
    empty: string;
  };
};

export function ApplicantDetailsSummary({
  details,
  labels,
}: ApplicantDetailsSummaryProps) {
  return (
    <div className="rounded-xl border p-5">
      <h2 className="font-semibold">{labels.title}</h2>
      {!details.hasData ? (
        <p className="mt-2 text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <dt className="text-xs text-muted-foreground">{labels.fullName}</dt>
            <dd className="mt-1 text-sm font-medium">{details.fullName}</dd>
          </div>
          <div className="rounded-lg border p-3">
            <dt className="text-xs text-muted-foreground">{labels.email}</dt>
            <dd className="mt-1 text-sm font-medium">{details.email}</dd>
          </div>
          <div className="rounded-lg border p-3">
            <dt className="text-xs text-muted-foreground">{labels.phone}</dt>
            <dd className="mt-1 text-sm font-medium">{details.phone}</dd>
          </div>
          <div className="rounded-lg border p-3">
            <dt className="text-xs text-muted-foreground">{labels.cnic}</dt>
            <dd className="mt-1 text-sm font-medium">{details.cnic}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
