import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import CompareSlider from "../components/CompareSlider.jsx";
import usePageTitle from "../usePageTitle.js";
import { fileUrl } from "../fileUrl.js";
import BackButton from "../components/BackButton.jsx";

export default function PhotoDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  usePageTitle(data?.photo?.location_label || "Fotoğraf");

  useEffect(() => {
    setData(null);
    setError(null);
    api.getPhoto(id).then(setData).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="page"><BackButton /><p className="alert alert--error">{error}</p></div>;
  if (!data) return <div className="page"><BackButton /><p>Yükleniyor…</p></div>;

  const { photo, paired } = data;

  // Eski fotoğraf hangisi, güncel hangisi — karşılaştırma sıralaması için
  const eski = photo.photo_type === "eski" ? photo : paired;
  const guncel = photo.photo_type === "guncel" ? photo : paired;
  const hasComparison = Boolean(eski && guncel);

  return (
    <div className="page">
      <BackButton />
      <p className="eyebrow">{photo.location_label || "Konum belirtilmemiş"}</p>
      <h1>{photo.date_known ? photo.date_year : "Tarih bilinmiyor"}</h1>

      <div className="detail-grid">
        <div>
          {hasComparison ? (
            <CompareSlider
              beforeSrc={fileUrl(eski.image_path)}
              afterSrc={fileUrl(guncel.image_path)}
              beforeLabel={eski.date_known ? String(eski.date_year) : "Eski"}
              afterLabel={guncel.date_known ? String(guncel.date_year) : "Bugün"}
            />
          ) : (
            <img
              src={fileUrl(photo.image_path)}
              alt={photo.location_label || "Trabzon"}
              style={{ width: "100%", borderRadius: 3, boxShadow: "0 18px 40px rgba(22,59,63,0.2)" }}
            />
          )}
        </div>

        <div>
          <div className="info-block">
            <p className="eyebrow">Konum</p>
            <p>{photo.location_label || `${photo.location_lat.toFixed(5)}, ${photo.location_lng.toFixed(5)}`}</p>
          </div>
          <div className="info-block">
            <p className="eyebrow">Tarih</p>
            <p>{photo.date_known ? photo.date_year : "Bilinmiyor"}</p>
          </div>
          {photo.description && (
            <div className="info-block">
              <p className="eyebrow">Açıklama / Anı</p>
              <p>{photo.description}</p>
            </div>
          )}

          {!hasComparison && photo.photo_type === "eski" && (
            <Link
              to={`/yukle?tamamla=${photo.id}`}
              className="btn btn--copper"
              style={{ marginTop: 12 }}
            >
              Bugünkü Halini Ekle
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
