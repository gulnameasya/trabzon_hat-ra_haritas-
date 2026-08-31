import { Router } from "express";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import "dotenv/config";
import pool from "../db.js";
import adminAuth from "../middleware/adminAuth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { queueRejectionNotice } from "../services/notifications.js";

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || "uploads";

// Girişte kaba kuvvet denemelerine karşı: 15 dakikada en fazla 10 deneme.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Çok fazla giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.",
});

// POST /api/admin/login
router.post("/login", loginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin", username }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });
    return res.json({ token });
  }

  res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı." });
});

// Admin panelinde gösterilecek alanlar — bilinçli olarak sınırlı tutuluyor.
// `SELECT *` yerine bunu kullanmak, ileride tabloya eklenecek hassas bir
// alanın farkında olmadan admin ekranına sızmasını önler. T.C. kimlik no
// şu an formdan hiç toplanmıyor ama şema esnekliği için sütun duruyor —
// admin ekranına yine de taşımıyoruz.
const ADMIN_SAFE_COLUMNS = `
  id, location_lat, location_lng, location_label,
  date_known, date_year, photo_type, paired_photo_id, replying_to_photo_id,
  description, image_path, status, uploader_name, uploader_phone,
  created_at, reviewed_at, reject_reason
`;

// GET /api/admin/pending
router.get("/pending", adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${ADMIN_SAFE_COLUMNS} FROM photos WHERE status = 'bekliyor' ORDER BY created_at ASC`
    );
    res.json({ pending: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bekleyen içerikler alınırken bir hata oluştu." });
  }
});

// POST /api/admin/:id/approve
router.post("/:id/approve", adminAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(`SELECT * FROM photos WHERE id = $1`, [req.params.id]);
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Fotoğraf bulunamadı." });
    }
    const photo = rows[0];

    await client.query(
      `UPDATE photos SET status = 'onaylandi', reviewed_at = now() WHERE id = $1`,
      [photo.id]
    );

    if (photo.replying_to_photo_id) {
      await client.query(`UPDATE photos SET paired_photo_id = $1 WHERE id = $2`, [
        photo.id,
        photo.replying_to_photo_id,
      ]);
      await client.query(`UPDATE photos SET paired_photo_id = $1 WHERE id = $2`, [
        photo.replying_to_photo_id,
        photo.id,
      ]);
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Onaylama sırasında bir hata oluştu." });
  } finally {
    client.release();
  }
});

// POST /api/admin/:id/reject
router.post("/:id/reject", adminAuth, async (req, res) => {
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 500) : null;

  try {
    const { rows } = await pool.query(
      `SELECT image_path, uploader_phone FROM photos WHERE id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Fotoğraf bulunamadı." });
    }

    await pool.query(
      `UPDATE photos SET status = 'reddedildi', reviewed_at = now(), reject_reason = $2 WHERE id = $1`,
      [req.params.id, reason]
    );

    const imagePath = rows[0].image_path;
    const isLocalFile = imagePath && !/^https?:\/\//i.test(imagePath);
    if (isLocalFile) {
      const fullPath = path.join(uploadDir, path.basename(imagePath));
      fs.unlink(fullPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Reddedilen dosya silinemedi:", err);
        }
      });
    }

    // Yükleyen kişi telefon numarası bıraktıysa, red sebebini içeren bir
    // SMS bildirimi kuyruğa alınır (gerçek gönderim henüz bağlı değil —
    // bkz. services/notifications.js).
    if (rows[0].uploader_phone) {
      queueRejectionNotice({
        photoId: req.params.id,
        phone: rows[0].uploader_phone,
        reason,
      }).catch((err) => console.error("Bildirim kuyruğa alınamadı:", err));
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reddetme sırasında bir hata oluştu." });
  }
});

// GET /api/admin/notifications
// Bildirim kuyruğunu görmek için (gerçek SMS sağlayıcısı bağlanana kadar
// admin, hangi bildirimlerin "gönderilmesi gerektiğini" buradan takip
// edebilir).
router.get("/notifications", adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, photo_id, phone, message, status, created_at, sent_at
       FROM notifications ORDER BY created_at DESC LIMIT 100`
    );
    res.json({ notifications: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bildirimler alınırken bir hata oluştu." });
  }
});

export default router;
