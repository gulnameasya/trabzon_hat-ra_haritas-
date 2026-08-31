import "../index.css";
import "../styles/ArchiveSystem.css";
import { MotionConfig } from "framer-motion";
import SiteShell from "../components/SiteShell.jsx";

export const metadata = {
  title: { default: "Trabzon Hatıra Haritası", template: "%s | Trabzon Hatıra Haritası" },
  description: "Trabzon'un görsel şehir hafızası.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        {/* reducedMotion="user" -> işletim sistemi/tarayıcı düzeyinde
            "hareketi azalt" tercihi açık olan kullanıcılar için tüm
            Framer Motion animasyonları otomatik olarak sadeleşir. */}
        <MotionConfig reducedMotion="user">
          <SiteShell>{children}</SiteShell>
        </MotionConfig>
      </body>
    </html>
  );
}
