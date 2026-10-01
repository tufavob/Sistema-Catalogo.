const SPECIAL_WORDS: Record<string, string> = {
  iphone: "iPhone",
  gb: "GB",
  tb: "TB",
  s: "S",
  m: "M",
  l: "L",
  xl: "XL",
  xxl: "XXL",
};

export function formatTitle(text: string): string {
  const result = String(text)
    .trim()
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase();
      if (SPECIAL_WORDS[lower]) return SPECIAL_WORDS[lower];
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");

  return result.replace(/\bpro max\b/gi, "Pro Max");
}

export function parseColors(color: string | null | undefined): string[] {
  if (!color) return [];
  return color
    .split(",")
    .map((part) => formatTitle(part.trim()))
    .filter(Boolean);
}

export function parseImages(imageUrl: string | null | undefined): string[] {
  if (!imageUrl) return [];
  return imageUrl
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

export function parseColorGalleries(
  source: string | Record<string, unknown> | null | undefined,
): Record<string, string[]> {
  if (!source) return {};

  let parsed: unknown = source;

  if (typeof source === "string") {
    try {
      parsed = JSON.parse(source);
    } catch {
      return {};
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>)
      .map(([color, value]) => {
        const images = Array.isArray(value)
          ? value.filter((url): url is string => typeof url === "string")
          : typeof value === "string"
            ? value.split(",")
            : [];

        return [
          color,
          images.map((url) => url.trim()).filter(Boolean),
        ] as const;
      })
      .filter(([, images]) => images.length > 0),
  );
}

export function parseVariants(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,;/]/)
    .map((part) => formatTitle(part.trim()))
    .filter(Boolean);
}
