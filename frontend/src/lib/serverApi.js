// Server Component'ler (Node ortamında çalışır) backend'e doğrudan,
// mutlak bir URL ile istek atar — tarayıcıdaki gibi next.config.mjs'teki
// /api rewrite'ına ihtiyaç duymazlar. Hata durumunda sayfayı çökertmemek
// için null/boş değerlere düşer; ilgili bileşen bunu "veri yok" gibi
// nazikçe ele alır.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function getStats() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/photos/stats`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getExamplePair() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/photos/example-pair`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.pair;
  } catch {
    return null;
  }
}

export async function getPhotoDetail(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/photos/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function fileUrlServer(imagePath) {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const filename = imagePath.split(/[\\/]/).pop();
  return `/uploads/${filename}`;
}
