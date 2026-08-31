// Basit, bellek içi (in-memory) istek sınırlayıcı. Küçük ölçekli bir staj
// projesi için harici bir pakete (express-rate-limit vb.) ihtiyaç duymadan,
// özellikle admin girişi gibi kaba kuvvet (brute-force) denemelerine açık
// endpoint'leri korumak amacıyla yazıldı.
//
// NOT: Bellek içi olduğu için sunucu yeniden başlatıldığında sıfırlanır ve
// birden fazla sunucu kopyası (instance) arasında paylaşılmaz. Gerçek bir
// production ortamında Redis tabanlı bir çözüm tercih edilmeli.
const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 10, message } = {}) {
  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || now - bucket.start > windowMs) {
      bucket = { start: now, count: 0 };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      return res.status(429).json({
        error: message || "Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.",
      });
    }

    next();
  };
}
