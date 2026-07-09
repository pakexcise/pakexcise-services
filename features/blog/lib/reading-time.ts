export function computeReadingTimeMinutes(content: string): number {
  const words = content
    .replace(/[#*_\[\]()]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}
