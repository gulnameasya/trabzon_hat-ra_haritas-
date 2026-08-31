import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { fileUrl } from "../fileUrl.js";
import usePageTitle from "../usePageTitle.js";
import BackButton from "../components/BackButton.jsx";

export default function GalleryPage() {
  usePageTitle("Tüm Fotoğraflar");

  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .getPhotoList(page, 24)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="page">
      <BackButton />
      <p className="eyebrow">Arşiv</p>
      <h1>Tüm Fotoğraflar</h1>

      {error && <p className="alert alert--error">{error}</p>}
      {loading && <p>Yükleniyor…</p>}

      {!loading && data && data.photos.length === 0 && (
        <div className="empty-state">
          <p>Henüz onaylanmış fotoğraf yok. İlk fotoğrafı siz yükleyin!</p>
        </div>
      )}

      {!loading && data && data.photos.length > 0 && (
        <>
          <p className="helper-text" style={{ marginBottom: 20 }}>
            Toplam {data.total} fotoğraf — sayfa {data.page}/{data.totalPages}
          </p>

          <div className="gallery-grid">
            {data.photos.map((photo) => (
              <Link to={`/fotograf/${photo.id}`} className="gallery-card" key={photo.id}>
                <div className="gallery-card__frame">
                  <img src={fileUrl(photo.image_path)} alt={photo.location_label || "Trabzon"} />
                  <span className="gallery-card__badge">
                    {photo.date_known ? photo.date_year : "Bilinmiyor"}
                  </span>
                </div>
                <p className="gallery-card__label">
                  {photo.location_label || "Konum belirtilmemiş"}
                </p>
              </Link>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn--ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Önceki
              </button>
              <span className="pagination__status">
                Sayfa {data.page} / {data.totalPages}
              </span>
              <button
                className="btn btn--ghost"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              >
                Sonraki →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
