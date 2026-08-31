import Link from "next/link";
import { getStats, getExamplePair } from "../lib/serverApi.js";
import HeroVisual from "../components/HeroVisual.jsx";
import FeaturedCarousel from "../components/FeaturedCarousel.jsx";
import Reveal from "../components/Reveal.jsx";
import ParallaxLayer from "../components/ParallaxLayer.jsx";
import { CameraIcon, PinIcon, CheckIcon, PeopleIcon, HeartIcon } from "../components/StepIcons.jsx";
import "../styles/HomePage.css";

export const metadata = {
  title: "Ana Sayfa",
  description:
    "Trabzon'un geçmişten bugüne değişen yüzünü; konumlar, hikâyeler ve fotoğraflar üzerinden birlikte kayda alıyoruz.",
};

// Hero'daki dekoratif fotoğraf albümü için gösterilecek kareler
// (gerçek bir eski/güncel eşleşmesi yoksa buna geri düşülür).
const DECORATIVE_PHOTOS = [
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

// Bu sayfa artık gerçek bir Server Component: metadata, istatistikler ve
// örnek eski/güncel eşleşmesi sunucuda, istek anında (no-store) çekiliyor.
// Sadece gerçekten etkileşimli parçalar (fotoğraf albümü/karşılaştırma
// önizlemesi, öne çıkanlar carousel'i, scroll-reveal animasyonları)
// ayrı "use client" bileşenlerine devrediliyor.
export default async function HomePage() {
  const [stats, pair] = await Promise.all([getStats(), getExamplePair()]);

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
        <ParallaxLayer range={-30} className="hero__left">
          <span className="hero__badge">
            Ortahisar Belediyesi • Dijital Kent Arşivi
          </span>

          <h1>Bir şehrin hafızası, fotoğraflarda yaşar.</h1>
          <span className="hero__accent-line" aria-hidden="true" />

          <p className="hero__description">
            Trabzon'un geçmişten bugüne değişen yüzünü; konumlar,
            hikâyeler ve fotoğraflar üzerinden birlikte kayda alıyoruz.
          </p>

          <div className="hero__actions" aria-label="Ana işlemler">
            <Link href="/harita" className="btn btn--copper">
              <span>Haritayı Keşfet</span><span aria-hidden="true">→</span>
            </Link>

            <Link href="/yukle" className="btn btn--ghost">
              <span aria-hidden="true" className="btn__plus">+</span> Hatıra Ekle
            </Link>
          </div>

          <div className="hero__stats" aria-label="Arşiv istatistikleri">
            {displayStats.map((item) => (
              <div key={item.label} className="hero__stat">
                <item.icon className="hero__stat-icon" aria-hidden="true" />
                <div><strong>{item.value}</strong><span>{item.label}</span></div>
              </div>
            ))}
          </div>
        </ParallaxLayer>

        <ParallaxLayer range={100} className="hero__right">
          <HeroVisual pair={pair} decorativePhotos={DECORATIVE_PHOTOS} />
        </ParallaxLayer>
      </section>

      <div className="ornamental-rule" aria-hidden="true" />

      <Reveal as="section" className="home-section home-section--featured">
        <div className="section-title">
          <span>SON EKLENENLER</span>

          <h2>Son Eklenen Hatıralar</h2>

          <p>
            Trabzon'un farklı dönemlerinden yüklenen fotoğrafları
            inceleyin.
          </p>
        </div>

        <FeaturedCarousel />
      </Reveal>

      <div className="ornamental-rule" aria-hidden="true" />

      <Reveal as="section" className="home-section home-section--howworks">
        <div className="process-heading"><span className="eyebrow">KATKI SÜRECİ</span><h2>Nasıl çalışır?</h2><p>Dört kısa adımda şehrin hafızasına bir kayıt bırakın.</p></div>
        <div className="steps">
          {STEPS.map((step) => (
            <div key={step.number} className="step-card">
              <span className="step-card__number"><step.icon /></span>
              <div><span className="step-card__index">{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="cta">
        <div className="cta__content">
          <div className="cta__seal" aria-hidden="true">TH<br /><small>ARŞİV</small></div>
          <div><span>TRABZON HATIRA HARİTASI · AÇIK ÇAĞRI</span><h2>Elinizdeki bir kare, şehrin hikâyesini tamamlayabilir.</h2><p>Eski bir Trabzon fotoğrafını konumuyla birlikte ekleyin; belediye onayı ardından kent arşivinde kalıcı yerini alsın.</p></div>
          <Link href="/yukle" className="btn btn--copper">Hatıra Ekle <span aria-hidden="true">→</span></Link>
        </div>
      </Reveal>
    </>
  );
}
