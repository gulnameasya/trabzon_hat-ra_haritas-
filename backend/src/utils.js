// İki nokta arası mesafeyi metre cinsinden hesaplar (haversine formülü)
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Birbirine yakın (varsayılan: 30 metre) fotoğrafları aynı "pin" altında gruplar.
// NOT: Bu bir tasarım varsayımıdır — farklı vatandaşlar aynı yeri birebir aynı
// koordinatla işaretlemeyeceği için gruplamayı mesafeye göre yapıyoruz.
export function clusterPhotosByLocation(photos, thresholdMeters = 30) {
  const clusters = [];

  for (const photo of photos) {
    let target = clusters.find(
      (c) => distanceMeters(c.lat, c.lng, photo.location_lat, photo.location_lng) <= thresholdMeters
    );

    if (!target) {
      target = {
        lat: photo.location_lat,
        lng: photo.location_lng,
        label: photo.location_label || null,
        photos: [],
      };
      clusters.push(target);
    }

    target.photos.push(photo);
    // Pin'in konum etiketi yoksa, gruptaki ilk etiketli fotoğraftan alınır
    if (!target.label && photo.location_label) {
      target.label = photo.location_label;
    }
  }

  return clusters;
}
