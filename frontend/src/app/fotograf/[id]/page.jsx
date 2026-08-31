import { notFound } from "next/navigation";
import Link from "next/link";
import { getPhotoDetail, fileUrlServer } from "../../../lib/serverApi.js";
import CompareSlider from "../../../components/CompareSlider.jsx";
import BackButton from "../../../components/BackButton.jsx";
import Reveal from "../../../components/Reveal.jsx";

// Dinamik metadata: her fotoğraf kaydı kendi konum/tarih bilgisiyle
// paylaşılabilir bir başlık+açıklama taşır (ör. sosyal medyada paylaşımda
// veya arama sonuçlarında anlamlı görünsün diye).
export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getPhotoDetail(id);
  if (!data) return { title: "Fotoğraf" };

  const { photo } = data;
  const yer = photo.location_label || "Trabzon";
  const yil = photo.date_known ? photo.date_year : "tarih bilinmiyor";
  return {
    title: `${yer} — ${yil}`,
    description: photo.description || `${yer}, Trabzon Hatıra Haritası arşiv kaydı.`,
  };
}

// Fotoğraf detay sayfası — projenin "yıldız" sayfası. Statik/SEO'ya değer
// katan kısımlar (arşiv kaydı, metadata, konum/tarih bilgisi) sunucuda;
// sadece kaydırmalı karşılaştırma (CompareSlider) client tarafında.
export default async function PhotoDetailPage({ params }) {
  const { id } = await params;
  const data = await getPhotoDetail(id);
  if (!data) notFound();

  const { photo, paired } = data;
  const eski = photo.photo_type === "eski" ? photo : paired;
  const guncel = photo.photo_type === "guncel" ? photo : paired;
  const hasComparison = Boolean(eski && guncel);
  const archiveId = `TH-${String(photo.id).padStart(5, "0")}`;

  return (
    <div className="page">
      <BackButton />

      <span className="archive-record-id">ARŞİV KAYDI · {archiveId}</span>
      <p className="eyebrow">{photo.location_label || "Konum belirtilmemiş"}</p>
      <h1>{photo.date_known ? photo.date_year : "Tarih bilinmiyor"}</h1>

      <div className="detail-grid">
        <Reveal>
          {hasComparison ? (
            <CompareSlider
              beforeSrc={fileUrlServer(eski.image_path)}
              afterSrc={fileUrlServer(guncel.image_path)}
              beforeLabel={eski.date_known ? String(eski.date_year) : "Eski"}
              afterLabel={guncel.date_known ? String(guncel.date_year) : "Bugün"}
            />
          ) : (
            <img
              src={fileUrlServer(photo.image_path)}
              alt={photo.location_label || "Trabzon"}
              style={{ width: "100%", borderRadius: 3, boxShadow: "0 18px 40px rgba(22,59,63,0.2)" }}
            />
          )}
        </Reveal>

        <div>
          <dl className="archive-meta">
            <div className="archive-meta__row">
              <dt>Konum</dt>
              <dd>{photo.location_label || `${photo.location_lat.toFixed(5)}, ${photo.location_lng.toFixed(5)}`}</dd>
            </div>
            <div className="archive-meta__row">
              <dt>Tarih</dt>
              <dd>{photo.date_known ? photo.date_year : "Bilinmiyor"}</dd>
            </div>
            <div className="archive-meta__row">
              <dt>Fotoğraf Türü</dt>
              <dd>{photo.photo_type === "eski" ? "Eski" : "Güncel"}{hasComparison ? " · Eşleşmiş çift" : ""}</dd>
            </div>
            <div className="archive-meta__row">
              <dt>Koordinat</dt>
              <dd className="mono">{photo.location_lat.toFixed(5)}, {photo.location_lng.toFixed(5)}</dd>
            </div>
            {photo.description && (
              <div className="archive-meta__row">
                <dt>Açıklama / Anı</dt>
                <dd>{photo.description}</dd>
              </div>
            )}
          </dl>

          <div className="detail-actions" style={{ marginTop: 20 }}>
            <Link href={`/harita?photoId=${photo.id}`} className="btn btn--ghost">
              📍 Haritada Göster
            </Link>

            {!hasComparison && photo.photo_type === "eski" && (
              <Link
                href={`/yukle?tamamla=${photo.id}`}
                className="btn btn--copper"
              >
                Bugünkü Halini Ekle
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
