export type SelectedColorLike = string | Record<string, unknown>;

export function normalizeColorKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function colorNameOf(selected: SelectedColorLike): string {
  if (typeof selected === "string") return selected;
  const name = selected.name;
  return typeof name === "string" ? name : "";
}

export function resolveColorImages(
  selected: SelectedColorLike,
  colors: string[],
  colorGalleries: Record<string, string[]>,
  fallback: string[],
): string[] {
  if (!selected) return fallback;

  const selectedKey = normalizeColorKey(colorNameOf(selected));
  if (!selectedKey) return fallback;

  const matchedKey = Object.keys(colorGalleries).find(
    (key) => normalizeColorKey(key) === selectedKey,
  );

  if (matchedKey && colorGalleries[matchedKey]) {
    const colorImages = colorGalleries[matchedKey];
    if (Array.isArray(colorImages) && colorImages.length > 0) {
      return colorImages;
    }
  }

  if (colors.length > 1) {
    const colorIndex = colors.findIndex(
      (color) => normalizeColorKey(color) === selectedKey,
    );
    const indexedImage = colorIndex >= 0 ? fallback[colorIndex] : undefined;

    if (indexedImage) return [indexedImage];
  }

  if (typeof selected !== "string") {
    const images = selected.images;
    if (Array.isArray(images) && images.length > 0) {
      return images.filter((url): url is string => typeof url === "string");
    }

    const single = selected.image_url ?? selected.image;
    if (typeof single === "string" && single.trim()) {
      return [single.trim()];
    }
  }

  return fallback;
}
