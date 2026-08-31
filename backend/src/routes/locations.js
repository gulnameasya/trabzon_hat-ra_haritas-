import { Router } from "express";
import pool from "../db.js";
import { clusterPhotosByLocation } from "../utils.js";

const router = Router();

// GET /api/locations
// Query parametreleri (haritadaki tarih filtresine karşılık gelir):
//   filter = all | range | exact | unknown
//   start, end  (filter=range iken, YYYY formatında ya da tam tarih)
//   date        (filter=exact iken)
router.get("/", async (req, res) => {
  const { filter = "all", start, end, date } = req.query;

  let where = "status = 'onaylandi'";
  const params = [];

  if (filter === "range") {
    const startYear = parseInt(start, 10);
    const endYear = parseInt(end, 10);
    if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
      return res.status(400).json({ error: "Başlangıç ve bitiş yılı sayısal ve dolu olmalıdır." });
    }
    if (startYear > endYear) {
      return res.status(400).json({ error: "Başlangıç yılı, bitiş yılından büyük olamaz." });
    }
    params.push(startYear, endYear);
    where += ` AND date_known = true AND date_year BETWEEN $${params.length - 1} AND $${params.length}`;
  } else if (filter === "exact") {
    const year = parseInt(date, 10);
    if (!Number.isFinite(year)) {
      return res.status(400).json({ error: "Geçerli bir yıl giriniz." });
    }
    params.push(year);
    where += ` AND date_known = true AND date_year = $${params.length}`;
  } else if (filter === "unknown") {
    where += " AND date_known = false";
  }
  // filter === "all" -> tarihi bilinmeyenler dahil hepsi (ek koşul yok)

  try {
    const { rows } = await pool.query(
      `SELECT id, location_lat, location_lng, location_label, date_known, date_year,
              photo_type, paired_photo_id, image_path
       FROM photos WHERE ${where}
       ORDER BY created_at ASC`,
      params
    );

    const clusters = clusterPhotosByLocation(rows);
    res.json({ clusters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Harita verileri alınırken bir hata oluştu." });
  }
});

export default router;
