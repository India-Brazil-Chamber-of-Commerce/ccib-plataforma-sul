export function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function getDisplayImageUrl(link) {
  if (!link) return null;
  const trimmed = link.trim();
  if (/^data:image\//i.test(trimmed)) {
    return trimmed;
  }
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  const driveOpenMatch = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveOpenMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveOpenMatch[1]}`;
  }
  // Imagens empacotadas pelo Vite (ex.: "/assets/foto-abc123.jpg")
  if (/^\/[^/].*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }
  if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}
