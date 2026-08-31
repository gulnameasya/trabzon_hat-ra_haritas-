import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import FeaturedCarousel from "../components/FeaturedCarousel";
import PhotoStack from "../components/PhotoStack.jsx";
import { CameraIcon, PinIcon, CheckIcon, PeopleIcon, HeartIcon } from "../components/StepIcons.jsx";
import usePageTitle from "../usePageTitle";
import "../styles/HomePage.css";

// Hero'daki fotoğraf albümü için gösterilecek kareler.
// Görselleri /public klasörüne şu isimlerle ekleyin, kod tarafında başka
// bir değişiklik gerekmez (eksik dosya sadece kırık görsel olarak kalır,
// sayfanın geri kalanını bozmaz):
//   public/hero-photo-1.jpg ... public/hero-photo-5.jpg
const HERO_PHOTOS = [
  { src: "/hero-photo-1.jpg", alt: "Trabzon'dan eski bir kare" },
  { src: "/hero-photo-2.jpg", alt: "Trabzon'dan eski bir kare" },
  { src: "/hero-photo-5.jpg", alt: "Trabzon'dan eski bir kare" },
  { src: "/hero-photo-4.jpg", alt: "Trabzon'dan eski bir kare" },
  { src: "/hero-photo-3.jpg", alt: "Trabzon'dan eski bir kare" },
];

const STEPS = [
  {
    number: "01",
    icon: CameraIcon,
    title: "Fotoğrafını Yükle",
    text: "Eski Trabzon fotoğrafını sisteme yükle. Güncel fotoğrafın varsa birlikte ekleyebilirsin.",
  },
  {
    number: "02",
    icon: PinIcon,
    title: "Konumu İşaretle",
    text: "Fotoğrafın çekildiği noktayı harita üzerinde seç.",
  },
  {
    number: "03",
    icon: CheckIcon,
    title: "Belediye Onayı",
    text: "Fotoğraf moderasyon sürecinden geçer ve güvenli şekilde yayınlanır.",
  },
  {
    number: "04",
    icon: PeopleIcon,
    title: "Geçmişi Keşfet",
    text: "Şehrin farklı dönemlerini karşılaştırmalı olarak incele.",
  },
];

export default function HomePage() {
  usePageTitle(null);

  const [howOpen, setHowOpen] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => setStats(null));
  }, []);

  // Ana sayfadaki istatistik kartları — gerçek verilerden hesaplanıyor.
  // "Zaman Aralığı" gibi uydurma bir istatistik yerine, kaç fotoğrafa
  // anı/açıklama eklendiğini gösteriyoruz.
  const displayStats = stats
    ? [
        { value: `${stats.totalPhotos}`, label: "Arşiv Fotoğrafı", icon: CameraIcon },
        { value: `${stats.totalLocations}`, label: "Konum", icon: PinIcon },
        { value: `${stats.withMemory}/${stats.totalPhotos}`, label: "Anı Paylaşılan Fotoğraf", icon: HeartIcon },
      ]
    : [];

  return (
    <>
      <section className="hero">
        <div className="hero__left">
          <span className="hero__badge">
            Ortahisar Belediyesi • Dijital Kent Arşivi
          </span>

          <h1>Trabzon'un Hafızasını Birlikte Koruyalım.</h1>
          <span className="hero__accent-line" aria-hidden="true" />

          <p className="hero__description">
            Eski Trabzon fotoğraflarını harita üzerine yerleştirerek
            şehrimizin kültürel hafızasını dijital ortamda gelecek
            nesillere aktarın.
          </p>

          <div className="hero__actions">
            <Link to="/harita" className="btn btn--copper">
              🗺️ Haritayı Keşfet
            </Link>

            <Link to="/yukle" className="btn btn--ghost">
              📷 Hatıra Ekle
            </Link>
          </div>

          <div className="hero__stats">
            {displayStats.map((item) => (
              <div key={item.label} className="hero__stat">
                <item.icon className="hero__stat-icon" />
                <h3>{item.value}</h3>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__right">
          <PhotoStack images={HERO_PHOTOS} />
        </div>
      </section>

      <section className="home-section home-section--featured">
        <div className="section-title">
          <span>ÖNE ÇIKANLAR</span>

          <h2>Son Eklenen Hatıralar</h2>

          <p>
            Trabzon'un farklı dönemlerinden yüklenen fotoğrafları
            inceleyin.
          </p>
        </div>

        <FeaturedCarousel />
      </section>

      <section className="home-section home-section--howworks">
        <button
          className="accordion-toggle"
          onClick={() => setHowOpen(!howOpen)}
        >
          <span>Nasıl Çalışır?</span>

          <span
            className={`accordion-toggle__icon ${
              howOpen ? "open" : ""
            }`}
          >
            ⌄
          </span>
        </button>

        {howOpen && (
          <div className="steps">
            {STEPS.map((step) => (
              <div key={step.number} className="step-card">
                <span className="step-card__number">
                  <step.icon />
                </span>

                <h3>{step.title}</h3>

                <p>{step.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="cta">
        <div className="cta__content">
          <span>TRABZON HATIRA HARİTASI</span>

          <h2>
            Siz de Şehrin Hafızasına
            <br />
            Katkıda Bulunun
          </h2>

          <p>
            Elinizde bulunan eski Trabzon fotoğraflarını paylaşarak
            gelecek nesillere dijital bir kent arşivi bırakabilirsiniz.
          </p>

          <Link
            to="/yukle"
            className="btn btn--copper"
          >
            📷 Hatıra Ekle
          </Link>
        </div>
      </section>
    </>
  );
}