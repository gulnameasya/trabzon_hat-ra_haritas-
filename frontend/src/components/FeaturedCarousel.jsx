"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../api.js";
import { fileUrl } from "../fileUrl.js";

const VISIBLE_COUNT = 5;
const ROTATE_MS = 4000;

export default function FeaturedCarousel() {
  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    api.getFeatured(10).then((data) => setPhotos(data.photos)).catch(() => setPhotos([]));
  }, []);

  useEffect(() => {
    if (photos.length <= VISIBLE_COUNT) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [photos]);

  if (photos.length === 0) {
    return (
      <p className="helper-text">
        Henüz öne çıkarılacak onaylı fotoğraf yok. İlk fotoğrafı siz yükleyin!
      </p>
    );
  }

  const visible = Array.from(
    { length: Math.min(VISIBLE_COUNT, photos.length) },
    (_, i) => photos[(index + i) % photos.length]
  );

  const goTo = (delta) => {
    setIndex((i) => (i + delta + photos.length) % photos.length);
  };

  return (
    <div className="carousel">
      {photos.length > VISIBLE_COUNT && (
        <button className="carousel__arrow carousel__arrow--left" onClick={() => goTo(-1)} aria-label="Önceki">
          ‹
        </button>
      )}
      <div className="carousel__track">
        {visible.map((photo) => (
          <div
            key={photo.id}
            className="carousel__item"
            onClick={() => router.push(`/fotograf/${photo.id}`)}
          >
            <img src={fileUrl(photo.image_path)} alt={photo.location_label || "Trabzon"} />
            <div className="carousel__caption">
              <span>{photo.location_label || "Konum belirtilmemiş"}</span>
              <span className="carousel__date">{photo.date_known ? photo.date_year : "?"}</span>
            </div>
          </div>
        ))}
      </div>
      {photos.length > VISIBLE_COUNT && (
        <button className="carousel__arrow carousel__arrow--right" onClick={() => goTo(1)} aria-label="Sonraki">
          ›
        </button>
      )}
    </div>
  );
}
