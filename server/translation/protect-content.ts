import "server-only";

type ProtectedSegment = {
  token: string;
  value: string;
};

const PROTECTED_PATTERNS: RegExp[] = [
  /\bPakExcise\.com\b/gi,
  /\bPakExcise\b/g,
  /https?:\/\/[^\s<>"']+/gi,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  /\b0?3\d{2}[-\s]?\d{7}\b/g,
  /\b\+92[-\s]?3\d{2}[-\s]?\d{7}\b/gi,
  /\b[A-Z]{2,}-\d{4,}\b/g,
  /\b[A-Z0-9]{8,}\b/g,
];

export function protectTranslatableText(text: string): {
  protectedText: string;
  segments: ProtectedSegment[];
} {
  let protectedText = text;
  const segments: ProtectedSegment[] = [];

  for (const pattern of PROTECTED_PATTERNS) {
    protectedText = protectedText.replace(pattern, (match) => {
      const token = `__PE_KEEP_${segments.length}__`;
      segments.push({ token, value: match });
      return token;
    });
  }

  return { protectedText, segments };
}

export function restoreProtectedText(
  translatedText: string,
  segments: ProtectedSegment[],
): string {
  return segments.reduce(
    (result, segment) => result.replaceAll(segment.token, segment.value),
    translatedText,
  );
}
