type ProtectedSegment = {
  token: string;
  value: string;
};

const PROTECTION_RULES: Array<{
  pattern: RegExp;
  tokenPrefix: string;
}> = [
  { pattern: /PakExcise\.com/gi, tokenPrefix: "__PEXC_DOMAIN_" },
  { pattern: /PakExcise/gi, tokenPrefix: "__PEXC_BRAND_" },
  { pattern: /https?:\/\/[^\s<>"']+/gi, tokenPrefix: "__PEXC_URL_" },
  { pattern: /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, tokenPrefix: "__PEXC_EMAIL_" },
  {
    pattern: /\b(?:\+92|0)?3\d{2}[-\s]?\d{7}\b/g,
    tokenPrefix: "__PEXC_PHONE_",
  },
  { pattern: /\bPEX-[A-Z0-9-]+\b/g, tokenPrefix: "__PEXC_TRACK_" },
  { pattern: /\b[a-z0-9-]+\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\b/gi, tokenPrefix: "__PEXC_SLUG_" },
];

export function protectTranslatableText(text: string): {
  protectedText: string;
  segments: ProtectedSegment[];
} {
  let protectedText = text;
  const segments: ProtectedSegment[] = [];

  for (const rule of PROTECTION_RULES) {
    protectedText = protectedText.replace(rule.pattern, (match) => {
      const token = `${rule.tokenPrefix}${segments.length}__`;
      segments.push({ token, value: match });
      return token;
    });
  }

  return { protectedText, segments };
}

export function restoreProtectedTerms(
  text: string,
  segments: ProtectedSegment[],
): string {
  return segments.reduce(
    (result, segment) => result.replaceAll(segment.token, segment.value),
    text,
  );
}
