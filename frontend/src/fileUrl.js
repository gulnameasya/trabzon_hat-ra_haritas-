// Veritabanında saklanan image_path, sunucunun işletim sistemine göre
// "/" veya "\" ayraçlı olabilir (Windows'ta backend "\" kullanır). Bu yüzden
// dosya adını çıkarırken her iki ayracı da dikkate alıyoruz. Ayrıca image_path
// doğrudan bir http(s) linki olabilir (link ile eklenen fotoğraflar) — bu
// durumda linki olduğu gibi döndürüyoruz.
export function fileUrl(imagePath) {
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const filename = imagePath.split(/[\\/]/).pop();
  return `/uploads/${filename}`;
}
