import UploadPage from "../../screens/UploadPage.jsx";
import { Suspense } from "react";

export const metadata = {
  title: "Hatıra Ekle",
  description: "Elinizdeki eski Trabzon fotoğrafını konumu ve tarihiyle birlikte kent arşivine ekleyin.",
};

export default function Page() {
  return <Suspense fallback={<div className="page">Yükleniyor…</div>}><UploadPage /></Suspense>;
}
