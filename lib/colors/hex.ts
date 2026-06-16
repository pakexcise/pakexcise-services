export function normalizeHexColor(hex: string): string {
  const trimmed = hex.trim();

  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return trimmed.toLowerCase();
}

export function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHexColor(hex).replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function toHexColor(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((channel) =>
      Math.round(Math.max(0, Math.min(255, channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function mixHexWithWhite(hex: string, amount: number): string {
  const { r, g, b } = parseHexColor(hex);
  const ratio = Math.max(0, Math.min(1, amount));

  return toHexColor(
    r + (255 - r) * ratio,
    g + (255 - g) * ratio,
    b + (255 - b) * ratio,
  );
}

export function mixHexWithBlack(hex: string, amount: number): string {
  const { r, g, b } = parseHexColor(hex);
  const ratio = Math.max(0, Math.min(1, amount));

  return toHexColor(r * (1 - ratio), g * (1 - ratio), b * (1 - ratio));
}

export function getContrastForeground(hex: string): string {
  const { r, g, b } = parseHexColor(hex);

  const channels = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  const luminance =
    0.2126 * (channels[0] ?? 0) +
    0.7152 * (channels[1] ?? 0) +
    0.0722 * (channels[2] ?? 0);

  return luminance > 0.55 ? "#171717" : "#fafafa";
}
