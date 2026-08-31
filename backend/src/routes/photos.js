import { Router } from "express";
import path from "path";
import pool from "../db.js";
import upload, { verifyImageSignature } from "../middleware/upload.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { clusterPhotosByLocation } from "../utils.js";

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Çok fazla yükleme denemesi yapıldı. Lütfen biraz sonra tekrar deneyin.",
});

// GET /api/photos/stats
// Ana sayfadaki istatistik kartları için gerçek verilerden hesaplanan sayılar.
router.get("/stats", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT location_lat, location_lng, description FROM photos WHERE status = 'onaylandi'`
    );
    const totalPhotos = rows.length;
    const totalLocations = clusterPhotosByLocation(rows).length;
    const withMemory = rows.filter((r) => r.description && r.description.trim().length > 0).length;

    res.json({ totalPhotos, totalLocations, withMemory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "İstatistikler alınırken bir hata oluştu." });
  }
});

// GET /api/photos/example-pair
// Ana sayfa hero'sunda gösterilecek, gerçekten eşleşmiş (eski + güncel)
// bir fotoğraf çifti. Projenin ana fikrini (geçmiş ↔ bugün) daha ana
// sayfada somut bir örnekle gösterebilmek için eklendi. Uygun bir çift
// yoksa null döner — frontend bu durumda decorative photo stack'e geri düşer.
router.get("/example-pair", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, image_path, location_label, date_known, date_year, paired_photo_id
       FROM photos
       WHERE status = 'onaylandi' AND photo_type = 'eski' AND paired_photo_id IS NOT NULL
       ORDER BY created_at DESC LIMIT 1`
    );
    if (rows.length === 0) return res.json({ pair: null });

    const eski = rows[0];
    const guncelResult = await pool.query(
      `SELECT id, image_path FROM photos WHERE id = $1 AND status = 'onaylandi'`,
      [eski.paired_photo_id]
    );
    if (guncelResult.rows.length === 0) return res.json({ pair: null });

    res.json({
      pair: {
        eski: { id: eski.id, image_path: eski.image_path },
        guncel: { id: guncelResult.rows[0].id, image_path: guncelResult.rows[0].image_path },
        locationLabel: eski.location_label,
        year: eski.date_known ? eski.date_year : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Örnek eşleşme alınırken bir hata oluştu." });
  }
});

// GET /api/photos/list
// "Tüm Fotoğraflar" galeri sayfası için sayfalanmış onaylı fotoğraf listesi.
router.get("/list", async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);
  const offset = (page - 1) * limit;

  // Galeri filtreleri: tür (eski/guncel), tarih aralığı, konum metni.
  // Hepsi isteğe bağlı — verilmezse o koşul uygulanmaz.
  let where = "status = 'onaylandi'";
  const params = [];

  if (req.query.type === "eski" || req.query.type === "guncel") {
    params.push(req.query.type);
    where += ` AND photo_type = $${params.length}`;
  }
  const startYear = parseInt(req.query.start, 10);
  const endYear = parseInt(req.query.end, 10);
  if (Number.isFinite(startYear)) {
    params.push(startYear);
    where += ` AND date_known = true AND date_year >= $${params.length}`;
  }
  if (Number.isFinite(endYear)) {
    params.push(endYear);
    where += ` AND date_known = true AND date_year <= $${params.length}`;
  }
  if (req.query.location && req.query.location.trim()) {
    params.push(`%${req.query.location.trim()}%`);
    where += ` AND location_label ILIKE $${params.length}`;
  }

  try {
    const listParams = [...params, limit, offset];
    const [{ rows }, countResult] = await Promise.all([
      pool.query(
        `SELECT id, image_path, location_label, date_known, date_year, photo_type
         FROM photos WHERE ${where}
         ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        listParams
      ),
      pool.query(`SELECT COUNT(*)::int AS count FROM photos WHERE ${where}`, params),
    ]);
    const total = countResult.rows[0].count;

    res.json({
      photos: rows,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fotoğraflar alınırken bir hata oluştu." });
  }
});

// GET /api/photos/featured
// Ana sayfadaki "Öne Çıkan Fotoğraflar" bölümü için — şimdilik en son onaylanan
// fotoğrafları döndürüyor. (İleride "en çok tıklanan" için ayrı bir görüntülenme
// sayacı eklemek gerekir — bkz. proje notları.)
router.get("/featured", async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  try {
    const { rows } = await pool.query(
      `SELECT id, image_path, location_label, date_known, date_year
       FROM photos WHERE status = 'onaylandi'
       ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    res.json({ photos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Öne çıkan fotoğraflar alınırken bir hata oluştu." });
  }
});

// GET /api/photos/:id
// Fotoğraf detay sayfası için. Eğer eşleşen (geçmiş/güncel) fotoğrafı varsa onu da döner.
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, location_lat, location_lng, location_label, date_known, date_year,
              photo_type, paired_photo_id, description, image_path, status, created_at
       FROM photos WHERE id = $1 AND status = 'onaylandi'`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Fotoğraf bulunamadı." });
    }

    const photo = rows[0];
    let paired = null;

    if (photo.paired_photo_id) {
      const pairedResult = await pool.query(
        `SELECT id, location_lat, location_lng, location_label, date_known, date_year,
                photo_type, image_path
         FROM photos WHERE id = $1`,
        [photo.paired_photo_id]
      );
      paired = pairedResult.rows[0] || null;
    }

    res.json({ photo, paired });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fotoğraf alınırken bir hata oluştu." });
  }
});

// Ortak alanları request body'den ayıklayan yardımcı fonksiyon
function parseCommonFields(body) {
  const dateKnown = body.date_known === "true" || body.date_known === true;
  return {
    lat: parseFloat(body.lat),
    lng: parseFloat(body.lng),
    locationLabel: body.location_label || null,
    dateKnown,
    dateYear: dateKnown && body.date_year ? parseInt(body.date_year, 10) : null,
    description: body.description || null,
    uploaderName: body.uploader_name,
    uploaderPhone: body.uploader_phone || null,
    uploaderTc: body.uploader_tc || null,
  };
}

function isValidImageUrl(value) {
  return typeof value === "string" && /^https?:\/\/.+/i.test(value.trim());
}

// Koordinatın gerçekten sayı ve makul bir enlem/boylam aralığında olup
// olmadığını kontrol eder. NaN, boş, veya dünya dışı değerleri reddeder.
function isValidCoord(lat, lng) {
  return (
    Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
    Number.isFinite(lng) && lng >= -180 && lng <= 180
  );
}

// Bir dosya yüklemesi veya bir link ile gönderilen fotoğraftan saklanacak
// image_path değerini üretir. Dosya varsa (işletim sisteminden bağımsız)
// sadece dosya adı, yoksa (geçerliyse) link doğrudan saklanır.
function resolveImagePath(file, urlValue) {
  if (file) return path.basename(file.path);
  if (isValidImageUrl(urlValue)) return urlValue.trim();
  return null;
}

// POST /api/photos/single
// Tek fotoğraf yükleme: ya sadece "eski" fotoğraf, ya da bir eski fotoğrafa
// cevap olarak gönderilen "guncel" fotoğraf ("Bugünkü Halini Ekle" akışı).
router.post("/single", uploadLimiter, upload.single("photo"), async (req, res) => {
  try {
    const f = parseCommonFields(req.body);
    const photoType = req.body.photo_type; // 'eski' | 'guncel'
    const replyingTo = req.body.replying_to_photo_id || null;

    const imagePath = resolveImagePath(req.file, req.body.photo_url);
    if (!imagePath) {
      return res.status(400).json({ error: "Fotoğraf dosyası veya geçerli bir görsel linki zorunludur." });
    }
    if (req.file && !verifyImageSignature(req.file.path)) {
      return res.status(400).json({ error: "Dosya geçerli bir görsel değil (bozuk veya sahte uzantılı)." });
    }
    if (!f.uploaderName) {
      return res.status(400).json({ error: "Ad soyad zorunludur." });
    }
    if (!["eski", "guncel"].includes(photoType)) {
      return res.status(400).json({ error: "Geçersiz fotoğraf türü." });
    }

    // "Bugünkü Halini Ekle" akışında konum, kullanıcıdan tekrar istenmiyor —
    // eşleştirileceği eski fotoğrafın konumu otomatik olarak kullanılıyor.
    // Güvenlik: replyingTo ID'sinin gerçekten ONAYLANMIŞ bir ESKİ fotoğrafa
    // ait olduğunu ve henüz eşleşmediğini doğruluyoruz.
    if (photoType === "guncel" && replyingTo) {
      const original = await pool.query(
        `SELECT location_lat, location_lng, location_label, paired_photo_id
         FROM photos
         WHERE id = $1 AND status = 'onaylandi' AND photo_type = 'eski'`,
        [replyingTo]
      );
      if (original.rows.length === 0) {
        return res.status(404).json({ error: "Eşleştirilecek onaylı eski fotoğraf bulunamadı." });
      }
      if (original.rows[0].paired_photo_id) {
        return res.status(409).json({ error: "Bu fotoğrafın bugünkü hali zaten eklenmiş." });
      }
      f.lat = original.rows[0].location_lat;
      f.lng = original.rows[0].location_lng;
      f.locationLabel = original.rows[0].location_label;
    }

    if (!isValidCoord(f.lat, f.lng)) {
      return res.status(400).json({ error: "Geçersiz konum koordinatı." });
    }

    const { rows } = await pool.query(
      `INSERT INTO photos
        (location_lat, location_lng, location_label, date_known, date_year,
         photo_type, replying_to_photo_id, description, image_path, uploader_name, uploader_phone, uploader_tc)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id`,
      [
        f.lat, f.lng, f.locationLabel, f.dateKnown, f.dateYear,
        photoType, replyingTo, f.description, imagePath, f.uploaderName, f.uploaderPhone, f.uploaderTc,
      ]
    );

    res.status(201).json({ id: rows[0].id, status: "bekliyor" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fotoğraf yüklenirken bir hata oluştu." });
  }
});

// POST /api/photos/pair
// Aynı anda hem eski hem güncel fotoğrafın birlikte yüklenmesi (Durum 1).
router.post(
  "/pair",
  uploadLimiter,
  upload.fields([{ name: "eskiFoto", maxCount: 1 }, { name: "guncelFoto", maxCount: 1 }]),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const f = parseCommonFields(req.body);

      if (!f.uploaderName) {
        return res.status(400).json({ error: "Ad soyad zorunludur." });
      }

      const eskiImagePath = resolveImagePath(req.files?.eskiFoto?.[0], req.body.eski_photo_url);
      const guncelImagePath = resolveImagePath(req.files?.guncelFoto?.[0], req.body.guncel_photo_url);

      if (!eskiImagePath || !guncelImagePath) {
        return res.status(400).json({ error: "Hem eski hem güncel fotoğraf (dosya ya da link) zorunludur." });
      }
      if (!isValidCoord(f.lat, f.lng)) {
        return res.status(400).json({ error: "Geçersiz konum koordinatı." });
      }
      if (req.files?.eskiFoto?.[0] && !verifyImageSignature(req.files.eskiFoto[0].path)) {
        return res.status(400).json({ error: "Eski fotoğraf dosyası geçerli bir görsel değil." });
      }
      if (req.files?.guncelFoto?.[0] && !verifyImageSignature(req.files.guncelFoto[0].path)) {
        return res.status(400).json({ error: "Güncel fotoğraf dosyası geçerli bir görsel değil." });
      }

      await client.query("BEGIN");

      const eskiResult = await client.query(
        `INSERT INTO photos
          (location_lat, location_lng, location_label, date_known, date_year,
           photo_type, description, image_path, uploader_name, uploader_phone, uploader_tc)
         VALUES ($1,$2,$3,$4,$5,'eski',$6,$7,$8,$9,$10) RETURNING id`,
        [f.lat, f.lng, f.locationLabel, f.dateKnown, f.dateYear,
         f.description, eskiImagePath, f.uploaderName, f.uploaderPhone, f.uploaderTc]
      );
      const eskiId = eskiResult.rows[0].id;

      const guncelResult = await client.query(
        `INSERT INTO photos
          (location_lat, location_lng, location_label, date_known, date_year,
           photo_type, image_path, uploader_name, uploader_phone, uploader_tc, replying_to_photo_id)
         VALUES ($1,$2,$3,false,null,'guncel',$4,$5,$6,$7,$8) RETURNING id`,
        [f.lat, f.lng, f.locationLabel, guncelImagePath, f.uploaderName, f.uploaderPhone, f.uploaderTc, eskiId]
      );

      await client.query("COMMIT");
      res.status(201).json({ eskiId, guncelId: guncelResult.rows[0].id, status: "bekliyor" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      res.status(500).json({ error: "Fotoğraflar yüklenirken bir hata oluştu." });
    } finally {
      client.release();
    }
  }
);

export default router;
