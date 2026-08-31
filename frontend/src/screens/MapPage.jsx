"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "../api.js";
import DateFilter from "../components/DateFilter.jsx";
import BackButton from "../components/BackButton.jsx";
import usePageTitle from "../usePageTitle.js";

const MapView = dynamic(() => import("../components/MapView.jsx"), { ssr: false, loading: () => <p className="map-loading">Harita yükleniyor…</p> });

export default function MapPage() {
  usePageTitle("Harita");
  const searchParams = useSearchParams();
  // Galeriden "Haritada Göster" ile gelindiğinde ?photoId=123 dolu olur.
  // Bu modda karışıklık olmasın diye SADECE o fotoğrafın pini gösterilir,
  // tarih filtresi devre dışı kalır.
  const photoId = searchParams.get("photoId");

  const [filterState, setFilterState] = useState({
    filter: "all",
    start: "",
    end: "",
    date: "",
  });
  const [clusters, setClusters] = useState([]);
  const [focus, setFocus] = useState(null); // { center, zoom } — tek fotoğraf modunda
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tek fotoğraf modu: photoId varsa sadece o fotoğrafı çek, tek pinlik
  // bir "cluster" oluştur ve haritayı o noktaya odakla.
  useEffect(() => {
    if (!photoId) return;

    setLoading(true);
    setError(null);
    api
      .getPhoto(photoId)
      .then((data) => {
        const p = data.photo;
        setClusters([
          {
            lat: p.location_lat,
            lng: p.location_lng,
            label: p.location_label,
            photos: [
              {
                id: p.id,
                image_path: p.image_path,
                date_known: p.date_known,
                date_year: p.date_year,
              },
            ],
          },
        ]);
        setFocus({ center: [p.location_lat, p.location_lng], zoom: 16 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [photoId]);

  // Normal mod (tüm harita + tarih filtresi) — photoId yoksa çalışır.
  useEffect(() => {
    if (photoId) return;

    if (filterState.filter === "range" && (!filterState.start || !filterState.end)) {
      setError(null);
      return;
    }
    if (filterState.filter === "exact" && !filterState.date) {
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const params = { filter: filterState.filter };
    if (filterState.filter === "range") {
      params.start = filterState.start;
      params.end = filterState.end;
    }
    if (filterState.filter === "exact") {
      params.date = filterState.date;
    }

    api
      .getLocations(params)
      .then((data) => setClusters(data.clusters))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filterState, photoId]);

  // Leaflet, center/zoom'u sadece ilk mount'ta kullanır — bu yüzden tek
  // fotoğraf modunda doğru odak noktası belirlenene kadar haritayı hiç
  // mount etmiyoruz (aksi halde önce Trabzon geneli açılıp sonra
  // "zıplayarak" odaklanmaya çalışırdı, kötü bir deneyim olurdu).
  const readyToRenderMap = photoId ? Boolean(focus) : true;

  return (
    <div className="map-page">
      <aside className="map-sidebar">
        <BackButton />

        {photoId ? (
          <>
            <h2>Tek Fotoğraf</h2>
            <div className="map-stat">
              {loading
                ? "Yükleniyor…"
                : error
                  ? "Fotoğraf bulunamadı."
                  : "Haritada sadece bu fotoğrafın konumu gösteriliyor."}
            </div>
            <Link href="/harita" className="btn btn--ghost" style={{ marginTop: 14 }}>
              ← Tüm Haritayı Göster
            </Link>
          </>
        ) : (
          <>
            <h2>Tarihe Göre Filtrele</h2>
            <DateFilter value={filterState} onChange={setFilterState} />
            <div className="map-stat">
              {loading
                ? "Yükleniyor…"
                : (
                  <>
                    <strong>{clusters.reduce((sum, c) => sum + c.photos.length, 0)}</strong> onaylanmış fotoğraf,{" "}
                    <strong>{clusters.length}</strong> konumda gösteriliyor.
                  </>
                )}
            </div>
          </>
        )}

        {error && <p className="alert alert--error" style={{ marginTop: 16 }}>{error}</p>}
      </aside>
      <div className="map-container">
        {readyToRenderMap && (
          <MapView clusters={clusters} center={focus?.center} zoom={focus?.zoom} />
        )}
      </div>
    </div>
  );
}
