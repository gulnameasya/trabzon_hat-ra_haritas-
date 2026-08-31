"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/harita", label: "Harita" },
  { href: "/fotograflar", label: "Fotoğraflar" },
  { href: "/yukle", label: "Hatıra Ekle" },
  { href: "/admin", label: "Belediye" },
];

export default function SiteShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return <div className="app-shell">
    <header className="nav">
      <div className="nav__container">
        <Link href="/" className="nav__brand" onClick={() => setMenuOpen(false)}>
          <img src="/ortahisar-logo.png" alt="Ortahisar Belediyesi" className="nav__logo" />
          <span className="nav__brand-text">
            <span className="nav__brand-org">Ortahisar Belediyesi</span>
            <span className="nav__brand-project">Trabzon Hatıra Haritası</span>
          </span>
        </Link>
        <button type="button" className={`nav__toggle ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen((open) => !open)} aria-label="Menüyü aç veya kapat" aria-expanded={menuOpen}>
          <span /><span /><span />
        </button>
        <nav className={`nav__links ${menuOpen ? "is-open" : ""}`}>
          {links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}
        </nav>
      </div>
    </header>
    <main>{children}</main>
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand"><img src="/ortahisar-logo.png" alt="Ortahisar Belediyesi" className="footer__logo" /><div><strong>Ortahisar Belediyesi</strong><p>Trabzon Hatıra Haritası — şehrin hafızasını birlikte koruyoruz.</p></div></div>
        <div className="footer__col"><h4>Arşiv</h4><Link href="/harita">Harita</Link><Link href="/fotograflar">Fotoğraflar</Link><Link href="/yukle">Hatıra Ekle</Link></div>
        <div className="footer__col"><h4>Kurumsal</h4><Link href="/admin">Belediye Girişi</Link><a href="https://www.ortahisar.bel.tr" target="_blank" rel="noreferrer">Ortahisar Belediyesi</a></div>
      </div>
      <div className="footer__bottom"><span>© {new Date().getFullYear()} Ortahisar Belediyesi</span><span>Trabzon Hatıra Haritası</span></div>
    </footer>
  </div>;
}
