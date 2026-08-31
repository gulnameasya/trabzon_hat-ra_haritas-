"use client";

import { useRef, useState, useCallback } from "react";

// Geçmiş/bugün karşılaştırma kaydırıcısı. Fare/dokunma ile sürüklenebildiği
// gibi, klavye ile de kullanılabilir: odaklanıp ← → (veya Home/End) ile
// pozisyon değiştirilebilir. Bir "slider" ARIA rolü taşır.
export default function CompareSlider({ beforeSrc, afterSrc, beforeLabel, afterLabel }) {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e) => {
    dragging.current = true;
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    if (dragging.current) updateFromClientX(e.clientX);
  };
  const stopDragging = () => (dragging.current = false);

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === "ArrowLeft") {
      setPos((p) => Math.max(0, p - step));
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      setPos((p) => Math.min(100, p + step));
      e.preventDefault();
    } else if (e.key === "Home") {
      setPos(0);
      e.preventDefault();
    } else if (e.key === "End") {
      setPos(100);
      e.preventDefault();
    }
  };

  return (
    <div
      className="compare-slider"
      ref={containerRef}
      style={{ "--pos": `${pos}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
      onKeyDown={onKeyDown}
      role="slider"
      tabIndex={0}
      aria-label={`${beforeLabel} ile ${afterLabel} arasında karşılaştırma kaydırıcısı`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      aria-valuetext={`%${Math.round(pos)} — sol taraf ${beforeLabel}, sağ taraf ${afterLabel}`}
    >
      <img src={beforeSrc} alt={beforeLabel} />
      <img src={afterSrc} alt={afterLabel} className="compare-slider__after" />
      <div className="compare-slider__handle" />
      <span className="compare-slider__label compare-slider__label--before">{beforeLabel}</span>
      <span className="compare-slider__label compare-slider__label--after">{afterLabel}</span>
    </div>
  );
}
