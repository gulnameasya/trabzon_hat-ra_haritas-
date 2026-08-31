"use client";

import Link from "next/link";
import BackButton from "../components/BackButton.jsx";
import usePageTitle from "../usePageTitle.js";

export default function NotFoundPage() {
  usePageTitle("Sayfa Bulunamadı");

  return (
    <div className="page not-found">
      <BackButton />
      <p className="eyebrow">404</p>
      <h1>Bu sayfa bulunamadı</h1>
      <p>
        Aradığınız sayfa taşınmış, silinmiş olabilir ya da hiç var olmamış
        olabilir. Adresi kontrol edin veya aşağıdan devam edin.
      </p>
      <div className="hero__actions" style={{ marginTop: 24 }}>
        <Link href="/" className="btn btn--copper">Ana Sayfaya Dön</Link>
        <Link href="/harita" className="btn btn--ghost">Haritayı Keşfet</Link>
      </div>
    </div>
  );
}
