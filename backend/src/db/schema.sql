-- Trabzon Hatıra Haritası — Veritabanı Şeması
-- Üyelik sistemi YOK. Tek tablo üzerinden ilerliyoruz: photos.
-- Admin, ayrı bir tabloya ihtiyaç duymadan .env üzerinden giriş yapıyor.

CREATE TABLE IF NOT EXISTS photos (
    id              SERIAL PRIMARY KEY,

    -- Konum (zorunlu) — kullanıcı haritadan seçiyor
    location_lat    DOUBLE PRECISION NOT NULL,
    location_lng    DOUBLE PRECISION NOT NULL,
    location_label  VARCHAR(255),               -- örn: "Trabzon Meydan" (isteğe bağlı, kullanıcı yazabilir)

    -- Tarih (bir seçim yapılması zorunlu, ama tarih bilinmeyebilir)
    -- NOT: Dokümandaki tüm örnekler (1967, 1988, 2002...) yıl bazlı olduğu için
    -- tarihi tam gün/ay hassasiyetinde değil, YIL olarak tutuyoruz. İleride tam
    -- tarih gerekirse bu alan genişletilebilir.
    date_known      BOOLEAN NOT NULL DEFAULT false,
    date_year       INTEGER,                     -- date_known = true ise dolu, örn. 1988

    -- Fotoğrafın türü: eski mi güncel mi
    photo_type      VARCHAR(10) NOT NULL CHECK (photo_type IN ('eski', 'guncel')),

    -- Eski/güncel eşleştirmesi (karşılaştırma sistemi için)
    -- Bir 'eski' fotoğrafın 'guncel' eşi onaylandığında bu alan doldurulur (iki yönlü mantığı backend'de yönetiyoruz)
    paired_photo_id INTEGER REFERENCES photos(id) ON DELETE SET NULL,

    -- "Bugünkü Halini Ekle" akışında, hangi eski fotoğrafa cevap olarak gönderildiği
    -- (henüz admin onayı almamış güncel fotoğraflar için bu dolu, onay sonrası paired_photo_id'ye taşınır)
    replying_to_photo_id INTEGER REFERENCES photos(id) ON DELETE SET NULL,

    -- Açıklama / Anı (isteğe bağlı, fotoğrafa bağlı)
    description     TEXT,

    -- Dosya
    image_path      VARCHAR(500) NOT NULL,

    -- Moderasyon
    status          VARCHAR(10) NOT NULL DEFAULT 'bekliyor' CHECK (status IN ('bekliyor', 'onaylandi', 'reddedildi')),

    -- Yükleyen kişinin bilgileri (ASLA diğer vatandaşlara gösterilmez, sadece admin görür)
    uploader_name     VARCHAR(255) NOT NULL,
    uploader_phone    VARCHAR(50),
    uploader_tc       VARCHAR(11),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at     TIMESTAMPTZ
);

-- Red sebebi (admin panelinde reddederken kısa bir not bırakılabilir).
-- ALTER ... IF NOT EXISTS kullanıyoruz ki bu şema daha önce kurulmuş
-- veritabanlarında da `npm run migrate` tekrar çalıştırılınca sorunsuz uygulansın.
ALTER TABLE photos ADD COLUMN IF NOT EXISTS reject_reason TEXT;

-- Yükleyen kişiye gönderilecek bildirimler (şimdilik sadece SMS için,
-- örn. "fotoğrafınız reddedildi çünkü ..."). Gerçek bir SMS sağlayıcı
-- (Netgsm, Twilio vb.) entegre edilene kadar bu tablo bir KUYRUK/LOG
-- görevi görür — src/services/notifications.js bu tabloya yazıyor.
CREATE TABLE IF NOT EXISTS notifications (
    id              SERIAL PRIMARY KEY,
    photo_id        INTEGER REFERENCES photos(id) ON DELETE SET NULL,
    phone           VARCHAR(50) NOT NULL,
    message         TEXT NOT NULL,
    status          VARCHAR(12) NOT NULL DEFAULT 'bekliyor'
                    CHECK (status IN ('bekliyor', 'gonderildi', 'basarisiz')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at         TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);
CREATE INDEX IF NOT EXISTS idx_photos_location ON photos(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_photos_date ON photos(date_year);
