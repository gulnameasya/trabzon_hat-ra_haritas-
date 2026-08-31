import L from "leaflet";

// Damla (teardrop) şeklinde, içinde küçük bir kamera ikonu olan harita pini.
// `color` parametresiyle farklı bağlamlarda farklı renk kullanılabilir:
//   - Haritadaki onaylı fotoğraf pinleri: bakır (#B66A3C)
//   - Konum seçme ekranındaki seçim işareti: lacivert (#17324D)
//   - Tek fotoğraf modu (Haritada Göster): yeşil + nabız efekti
// `pulse: true` verilirse, pinin ucunda (yere değdiği nokta) sürekli
// büyüyüp solan bir halka efekti belirir — kalabalık bir haritada bile
// gözden kaçmaması için.
export function createPinIcon(color = "#B66A3C", { pulse = false } = {}) {
  const svg = `
    <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg" style="display:block; position:relative; z-index:1;">
      <path d="M15 0C7 0 0 6.5 0 14.5C0 25 15 42 15 42S30 25 30 14.5C30 6.5 23 0 15 0Z"
            fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>
      <circle cx="15" cy="14.5" r="9.5" fill="#FFFFFF"/>
      <g transform="translate(8,8)">
        <path d="M4 2.5 L5.3 0.8 H8.7 L10 2.5" fill="none" stroke="${color}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
        <rect x="0" y="2.5" width="14" height="9.5" rx="2" fill="none" stroke="${color}" stroke-width="1.4"/>
        <circle cx="7" cy="7.3" r="2.5" fill="none" stroke="${color}" stroke-width="1.4"/>
      </g>
    </svg>`;

  const html = pulse
    ? `<div style="position:relative; width:30px; height:42px;">
         <span class="map-pin-pulse-ring" style="background:${color};"></span>
         <span class="map-pin-pulse-ring map-pin-pulse-ring--delay" style="background:${color};"></span>
         ${svg}
       </div>`
    : svg;

  return L.divIcon({
    className: "map-pin-icon",
    html,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
}
