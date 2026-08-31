"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useRouter } from "next/navigation";
import { createPinIcon } from "./mapIcons.js";
import { fileUrl } from "../fileUrl.js";
import "leaflet/dist/leaflet.css";

const TRABZON_CENTER = [41.0027, 39.7168];
const pinIcon = createPinIcon("#B66A3C");
// Tek fotoğraf modunda (galeriden/detaydan "Haritada Göster" ile
// gelindiğinde) pin belirgin şekilde farklı bir renkte gösterilir —
// kullanıcı bunu diğer pinlerle karıştırmasın diye.
const highlightIcon = createPinIcon("#315C4C", { pulse: true });

function ClusterMarker({ cluster, icon, autoOpen, onPhotoClick }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (autoOpen && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [autoOpen]);

  return (
    <Marker ref={markerRef} position={[cluster.lat, cluster.lng]} icon={icon}>
      <Popup>
        <div className="pin-popup">
          <h4>{cluster.label || "Konum belirtilmemiş"}</h4>
          <div className="pin-popup__thumbs">
            {cluster.photos.map((photo) => (
              <button
                type="button"
                key={photo.id}
                className="pin-popup__thumb"
                onClick={(event) => {
                  event.stopPropagation();
                  onPhotoClick(photo.id);
                }}
              >
                <div className="pin-popup__thumb-frame">
                  <img src={fileUrl(photo.image_path)} alt="" />
                  <span className="pin-popup__thumb-date">
                    {photo.date_known ? photo.date_year : "Bilinmiyor"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapView({ clusters, center, zoom }) {
  const router = useRouter();
  // Tek fotoğraf modu: sadece tek bir cluster (=tek konum) gönderildiğinde
  // devreye girer — pin rengi değişir ve popup otomatik açılır.
  const singleMode = clusters.length === 1;

  return (
    <MapContainer center={center || TRABZON_CENTER} zoom={zoom || 13} className="leaflet-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clusters.map((cluster, i) => (
        <ClusterMarker
          key={i}
          cluster={cluster}
          icon={singleMode ? highlightIcon : pinIcon}
          autoOpen={singleMode}
          onPhotoClick={(id) => router.push(`/fotograf/${id}`)}
        />
      ))}
    </MapContainer>
  );
}
