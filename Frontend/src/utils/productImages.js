const assetModules = {
  ...import.meta.glob("../assets/*.{png,jpg,jpeg,webp,svg}", { eager: true, import: "default" }),
};

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function getProductImageUrl(productName) {
  const target = normalizeKey(productName);
  if (!target) {
    return null;
  }

  for (const [path, url] of Object.entries(assetModules)) {
    const fileName = path.split("/").pop() || path;
    const base = fileName.replace(/\.[^/.]+$/, "");
    if (normalizeKey(base) === target) {
      return url;
    }
  }

  return null;
}

export function getLogoUrl() {
  const entry = Object.entries(assetModules).find(([path]) => normalizeKey(path).includes("logo"));
  return entry?.[1] || null;
}
