"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../api.js";
import { fileUrl } from "../fileUrl.js";
import usePageTitle from "../usePageTitle.js";
import BackButton from "../components/BackButton.jsx";

const EMPTY_FILTERS = { type: "", start: "", end: "", location: "" };

export default function GalleryPage() {
  usePageTitle("Tüm Fotoğraflar");

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .getPhotoList(page, 24, filters)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, filters]);

  function updateFilter(key, value) {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="page">
      <BackButton />
      <p className="eyebrow">Arşiv</p>
      <h1 className="page-title--compact">Tüm Fotoğraflar</h1>

      <div className="gallery-filters">
        <div className="gallery-filters__types">
          {[
            { value: "", label: "Tümü" },
            { value: "eski", label: "Eski" },
            { value: "guncel", label: "Güncel" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={filters.type === opt.value ? "active" : ""}
              onClick={() => updateFilter("type", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <input
          type="number"
          placeholder="Başlangıç yılı"
          value={filters.start}
          onChange={(e) => updateFilter("start", e.target.value)}
        />
        <input
          type="number"
          placeholder="Bitiş yılı"
          value={filters.end}
          onChange={(e) => updateFilter("end", e.target.value)}
        />
        <input
          type="text"
          placeholder="Konum ara…"
          value={filters.location}
          onChange={(e) => updateFilter("location", e.target.value)}
        />

        {hasActiveFilters && (
          <button
            type="button"
            className="gallery-filters__clear"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setPage(1);
            }}
          >
            Filtreleri Temizle ✕
          </button>
        )}
      </div>

      {error && <p className="alert alert--error">{error}</p>}
      {loading && <p>Yükleniyor…</p>}

      {!loading && data && data.photos.length === 0 && (
        <div className="empty-state">
          <p>
            {hasActiveFilters
              ? "Bu filtrelere uyan fotoğraf bulunamadı."
              : "Henüz onaylanmış fotoğraf yok. İlk fotoğrafı siz yükleyin!"}
          </p>
        </div>
      )}

      {!loading && data && data.photos.length > 0 && (
        <>
          <p className="helper-text" style={{ marginBottom: 20 }}>
            Toplam {data.total} fotoğraf — sayfa {data.page}/{data.totalPages}
          </p>

          <div className="gallery-grid">
            {data.photos.map((photo) => (
              <div className="gallery-card" key={photo.id}>
                <Link href={`/fotograf/${photo.id}`} className="gallery-card__frame">
                  <img src={fileUrl(photo.image_path)} alt={photo.location_label || "Trabzon"} />
                  <span className="gallery-card__badge">
                    {photo.date_known ? photo.date_year : "Bilinmiyor"}
                  </span>
                </Link>
                <Link href={`/fotograf/${photo.id}`} className="gallery-card__label">
                  {photo.location_label || "Konum belirtilmemiş"}
                </Link>
                <Link href={`/harita?photoId=${photo.id}`} className="gallery-card__map-link">
                  📍 Haritada Göster
                </Link>
              </div>
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
