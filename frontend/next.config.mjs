/** @type {import('next').NextConfig} */
const nextConfig = {
  // React 18 StrictMode, geliştirme modunda bileşenleri kasıtlı olarak iki
  // kez mount eder (hata ayıklamaya yardımcı olsun diye). Leaflet ise aynı
  // DOM elemanına ikinci kez mount edilmeye çalışıldığında
  // "Map container is already initialized" hatası veriyor — bu react-leaflet
  // + StrictMode arasında bilinen bir uyumsuzluk. Production derlemesini
  // etkilemiyor, sadece dev sunucusundaki bu çift-mount davranışını kapatıyor.
  reactStrictMode: false,

  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://localhost:4000/api/:path*" },
      { source: "/uploads/:path*", destination: "http://localhost:4000/uploads/:path*" },
    ];
  },
};

export default nextConfig;
