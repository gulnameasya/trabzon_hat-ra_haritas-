import pool from "../db.js";
import "dotenv/config";

// Yükleyen kişiye SMS bildirimi göndermek için soyutlama katmanı.
//
// Gerçek gönderim NETGSM üzerinden yapılır (Türkiye'de en yaygın SMS
// sağlayıcılarından biri, kurumsal/bireysel hesap açılabiliyor).
// .env dosyasında NETGSM_USERCODE, NETGSM_PASSWORD ve NETGSM_HEADER
// (onaylı SMS başlığınız) tanımlı DEĞİLSE, sistem otomatik olarak
// "simülasyon" moduna düşer — yani mesaj veritabanına yazılır ama
// gerçekten gönderilmez (böylece Netgsm hesabınız olmadan da sistemin
// geri kalanını test edebilirsiniz).
//
// Netgsm hesabı açmak için: https://www.netgsm.com.tr
// (Ücretli bir servistir — kontör satın almanız gerekir.)

const NETGSM_CONFIGURED = Boolean(
  process.env.NETGSM_USERCODE && process.env.NETGSM_PASSWORD && process.env.NETGSM_HEADER
);

export async function queueRejectionNotice({ photoId, phone, reason }) {
  if (!phone) return null; // telefon yoksa bildirim gönderilmez

  const message = reason
    ? `Trabzon Hatira Haritasi: Gonderdiginiz #${photoId} numarali fotograf onaylanmadi. Sebep: ${reason}`
    : `Trabzon Hatira Haritasi: Gonderdiginiz #${photoId} numarali fotograf onaylanmadi.`;

  const { rows } = await pool.query(
    `INSERT INTO notifications (photo_id, phone, message, status)
     VALUES ($1, $2, $3, 'bekliyor') RETURNING id`,
    [photoId, phone, message]
  );

  const notificationId = rows[0].id;
  await dispatch(notificationId, phone, message);
  return notificationId;
}

async function dispatch(notificationId, phone, message) {
  if (!NETGSM_CONFIGURED) {
    console.log(`[notifications] (SİMÜLASYON — Netgsm bilgileri .env'de yok) SMS gönderilmedi -> ${phone}: ${message}`);
    await updateStatus(notificationId, "basarisiz");
    return;
  }

  try {
    const normalizedPhone = normalizePhone(phone);

    const res = await fetch("https://api.netgsm.com.tr/sms/send/get", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        usercode: process.env.NETGSM_USERCODE,
        password: process.env.NETGSM_PASSWORD,
        gsmno: normalizedPhone,
        message,
        msgheader: process.env.NETGSM_HEADER,
      }),
    });

    const resultText = (await res.text()).trim();
    // Netgsm başarılı gönderimlerde "00" veya "01" ile başlayan bir kod
    // döner (referans numarasının ilk iki hanesi). Diğer kodlar hata
    // anlamına gelir — bkz. Netgsm API dokümantasyonu.
    const success = res.ok && (resultText.startsWith("00") || resultText.startsWith("01"));

    if (success) {
      console.log(`[notifications] SMS gönderildi -> ${phone} (Netgsm yanıtı: ${resultText})`);
      await updateStatus(notificationId, "gonderildi");
    } else {
      console.error(`[notifications] Netgsm gönderim hatası -> ${phone}: ${resultText}`);
      await updateStatus(notificationId, "basarisiz");
    }
  } catch (err) {
    console.error("[notifications] SMS gönderilirken bir hata oluştu:", err);
    await updateStatus(notificationId, "basarisiz");
  }
}

// Netgsm, numaraları başında 0 olmadan (5xxxxxxxxx, 10 hane) bekler.
function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);
  return digits;
}

async function updateStatus(notificationId, status) {
  try {
    await pool.query(
      `UPDATE notifications SET status = $2, sent_at = now() WHERE id = $1`,
      [notificationId, status]
    );
  } catch (err) {
    console.error("[notifications] Durum güncellenemedi:", err);
  }
}
