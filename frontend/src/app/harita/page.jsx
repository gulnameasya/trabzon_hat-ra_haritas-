import { Suspense } from "react";
import MapPage from "../../screens/MapPage.jsx";

export const metadata = {
  title: "Harita",
  description: "Trabzon'un eski ve güncel fotoğraflarını konumlarıyla birlikte harita üzerinde keşfedin.",
};

export default function Page() {
  return (
    <Suspense fallback={<p className="map-loading">Harita yükleniyor…</p>}>
      <MapPage />
    </Suspense>
  );
}
