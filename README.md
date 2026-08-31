# Trabzon Hatıra Haritası

Ortahisar Belediyesi için geliştirilmiş, vatandaşların eski Trabzon fotoğraflarını
harita üzerinde konumlarıyla birlikte paylaşabildiği, belediye moderasyonundan
geçtikten sonra yayınlanan dijital bir kent arşivi. Aynı konumun eski ve güncel
halini kaydırmalı olarak karşılaştırma özelliği projenin merkezinde yer alıyor.

## Teknoloji

- **Frontend:** Next.js (App Router) + React + Tailwind CSS + Framer Motion + Leaflet
- **Backend:** Node.js + Express + PostgreSQL
- **Dosya depolama:** Fotoğraflar sunucunun diskinde (`backend/uploads`) tutuluyor
  (veya bir görsel linki olarak eklenebiliyor)
- **SMS bildirimi:** Netgsm entegrasyonu (isteğe bağlı — yapılandırılmazsa
  sistem simülasyon modunda çalışır, bkz. aşağıdaki kurulum adımları)

## Klasör Yapısı

```
trabzon-hatira-haritasi/
├── backend/
│   ├── src/
│   │   ├── db/schema.sql        → veritabanı şeması
│   │   ├── routes/              → API uç noktaları (photos, locations, admin)
│   │   ├── services/            → SMS bildirim servisi (Netgsm)
│   │   ├── middleware/          → dosya yükleme, admin doğrulama, rate limit
│   │   └── index.js             → Express sunucusu
│   └── .env.example
└── frontend/
    └── src/
        ├── app/                  → Next.js sayfaları (App Router)
        ├── screens/              → sayfaların client-side mantığı
        ├── components/           → paylaşılan bileşenler (Harita, CompareSlider vb.)
        └── styles/               → tasarım sistemi (renk/font tokenları)
```

## Kurulum

### 1. PostgreSQL veritabanı

```bash
createdb trabzon_hatira
```

### 2. Backend

```bash
cd backend
cp .env.example .env       # .env içindeki bilgileri kendi ortamınıza göre düzenleyin
npm install
npm run migrate            # şemayı veritabanına uygular
npm run dev                # http://localhost:4000
```

`.env` dosyasında düzenlemeniz gerekenler:
- `DATABASE_URL` — kendi PostgreSQL şifreniz
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — admin paneli girişi (**mutlaka değiştirin**)
- `JWT_SECRET` — rastgele, uzun bir metin
- `NETGSM_USERCODE` / `NETGSM_PASSWORD` / `NETGSM_HEADER` — isteğe bağlı, reddedilen
  fotoğraflar için SMS bildirimi göndermek isterseniz (boş bırakılırsa sistem
  simülasyon modunda çalışır, gerçekten SMS göndermez)

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                # http://localhost:3000
```

## Uygulanan İş Mantığı Özeti

- **Üyelik yok:** Fotoğraf yüklemek için hesap gerekmiyor.
- **Üç yükleme akışı:** Sadece eski fotoğraf / Eski + güncel birlikte / Var olan
  eski fotoğrafın "bugünkü hali"ni ekleme.
- **Admin onayı:** Hiçbir içerik doğrudan yayınlanmıyor. Reddedilirse, yükleyen
  kişiye (telefon numarası varsa) sebep içeren bir SMS gönderiliyor.
- **Tarih filtresi:** Tümü (bilinmeyenler dahil) / Aralık / Net tarih / Bilinmeyenler.
- **Galeri filtreleri:** Eski/Güncel, tarih aralığı, konum arama.
- **Haritada tekil gösterim:** Galeri veya fotoğraf detay sayfasından "Haritada
  Göster" ile gidildiğinde harita sadece o fotoğrafın konumunu (farklı renkli,
  nabız efektli bir pinle) gösterir.
- **Kişisel bilgiler:** Ad soyad + telefon, yalnızca admin panelinde görünüyor,
  fotoğraf detayında asla gösterilmiyor.
- **Güvenlik:** Koordinat doğrulama, yüklenen dosyanın gerçek görsel olduğunu
  doğrulama (magic bytes kontrolü), admin girişi ve yükleme uçlarında rate
  limit, "bugünkü halini ekle" akışında sahte eşleştirme koruması.

## Bilinen Sınırlamalar / İleride Geliştirilebilecekler

- **SMS bildirimi** gerçek gönderim için Netgsm hesabı gerektirir (ücretli).
  Farklı bir sağlayıcı kullanmak isterseniz `backend/src/services/notifications.js`
  dosyasındaki `dispatch()` fonksiyonunu güncellemeniz yeterli.
- **T.C. kimlik no** alanı veritabanı şemasında duruyor ama formdan hiç
  toplanmıyor — kullanılıp kullanılmayacağına karar verilmeli.
- **"Son Eklenenler"** şu an gerçek "en popüler" değil, sadece en son
  yüklenenleri gösteriyor (görüntülenme sayacı yok).
- Admin oturumu `sessionStorage`'da tutuluyor; büyük ölçekli bir kuruluma
  taşınacaksa httpOnly cookie + CSRF koruması eklenmesi önerilir.
- Rate limit bellek içi çalışıyor (sunucu yeniden başlayınca sıfırlanır) —
  küçük ölçekli kullanım için yeterli.

## Production'a Taşırken

- `backend/.env` içinde `FRONTEND_URL`'i gerçek domaininize ayarlayın (CORS'u
  o adrese daraltır).
- `ADMIN_PASSWORD` ve `JWT_SECRET`'i mutlaka güçlü, benzersiz değerlerle değiştirin.
- `frontend/.env.local` içindeki `BACKEND_URL`'i production backend adresinize
  ayarlayın.
