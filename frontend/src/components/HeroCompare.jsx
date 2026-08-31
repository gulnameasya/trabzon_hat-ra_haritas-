// Ana sayfadaki hero görseli için sabit (interaktif olmayan) bir geçmiş/bugün
// birleşimi. Fotoğraf Detay sayfasındaki kaydırmalı CompareSlider ile aynı
// görsel dili kullanıyor ama sürüklenemiyor — sadece dekoratif.
//
// NOT: Buradaki görseller şimdilik örnek/placeholder. Belediyenin gerçek
// arşivinden örn. Atatürk Anıtı'nın eski/yeni halini gösteren onaylı bir
// fotoğraf çifti eklendiğinde, bu görseller onunla değiştirilmeli.
export default function HeroCompare({ beforeSrc, afterSrc, beforeLabel, afterLabel }) {
  return (
    <div className="compare-slider hero-compare" style={{ "--pos": "50%" }}>
      <img src={beforeSrc} alt={beforeLabel} />
      <img src={afterSrc} alt={afterLabel} className="compare-slider__after" />
      <div className="compare-slider__handle" style={{ cursor: "default" }} />
      <span className="compare-slider__label compare-slider__label--before">{beforeLabel}</span>
      <span className="compare-slider__label compare-slider__label--after">{afterLabel}</span>
    </div>
  );
}
