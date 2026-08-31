import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MapPage from "./pages/MapPage.jsx";
import PhotoDetailPage from "./pages/PhotoDetailPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import ortahisarLogo from "./assets/images/ortahisar-logo.png";

function NavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Ana Sayfa" },
    { to: "/harita", label: "Harita" },
    { to: "/fotograflar", label: "Fotoğraflar" },
    { to: "/yukle", label: "Hatıra Ekle" },
    { to: "/admin", label: "Belediye" },
  ];

  return (
    <header className="nav">
      <div className="nav__container">
        <Link to="/" className="nav__brand" onClick={() => setMenuOpen(false)}>
          <img
            src={ortahisarLogo}
            alt="Ortahisar Belediyesi"
            className="nav__logo"
          />

          <div className="nav__brand-text">
            <span className="nav__brand-org">
              Ortahisar Belediyesi
            </span>

            <span className="nav__brand-project">
              Trabzon Hatıra Haritası
            </span>
          </div>
        </Link>

        <button
          type="button"
          className={`nav__toggle ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menüyü aç/kapat"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav__links ${menuOpen ? "is-open" : ""}`}>
          {links.map((link) => (
            <Link
              key={link.to}
              className={isActive(link.to) ? "active" : ""}
              to={link.to}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/harita" element={<MapPage />} />
          <Route path="/fotograflar" element={<GalleryPage />} />
          <Route path="/fotograf/:id" element={<PhotoDetailPage />} />
          <Route path="/yukle" element={<UploadPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer__grid">
          <div className="footer__brand">
            <img src={ortahisarLogo} alt="Ortahisar Belediyesi" className="footer__logo" />
            <div>
              <strong>Ortahisar Belediyesi</strong>
              <p>Trabzon Hatıra Haritası — şehrin hafızasını birlikte koruyoruz.</p>
            </div>
          </div>

          <div className="footer__col">
            <h4>Hızlı Bağlantılar</h4>
            <Link to="/">Ana Sayfa</Link>
            <Link to="/harita">Harita</Link>
            <Link to="/fotograflar">Fotoğraflar</Link>
            <Link to="/yukle">Hatıra Ekle</Link>
          </div>

          <div className="footer__col">
            <h4>Kurumsal</h4>
            <Link to="/admin">Belediye Girişi</Link>
            <a href="https://www.ortahisar.bel.tr" target="_blank" rel="noreferrer">
              Ortahisar Belediyesi
            </a>
          </div>

          <div className="footer__col">
            <h4>İletişim</h4>
            <span>Meydan, Ortahisar / Trabzon</span>
            <span>info@ortahisar.bel.tr</span>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Ortahisar Belediyesi</span>
          <span>Trabzon Hatıra Haritası</span>
          <span className="footer__credit">
            <img src="/developer-logo.svg" alt="" className="footer__credit-mark" />
            Geliştiren: Asya
          </span>
        </div>
      </footer>
    </div>
  );
}
