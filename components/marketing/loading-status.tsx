export async function LoadingStatus() {
    return (
    <p role="status" aria-live="polite" className="sr-only">
      {"Loading..."}
    </p>
  );
}
