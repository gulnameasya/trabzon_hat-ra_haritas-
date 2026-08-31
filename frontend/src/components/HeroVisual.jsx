"use client";

import PhotoStack from "./PhotoStack.jsx";

// NOT: Daha önce burada, onaylı bir eski↔güncel eşleşmesi varsa albüm
// yerine gerçek bir karşılaştırma önizlemesi gösteren bir mantık vardı.
// Kullanıcı isteğiyle bu davranış kaldırıldı — albüm artık her zaman
// gösteriliyor. `pair` prop'u hâlâ page.jsx'ten geliyor ama kullanılmıyor;
// ileride tekrar istenirse kolayca geri eklenebilir.
export default function HeroVisual({ decorativePhotos }) {
  return <PhotoStack images={decorativePhotos} />;
}
