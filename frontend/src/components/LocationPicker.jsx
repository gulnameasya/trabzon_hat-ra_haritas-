"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { createPinIcon } from "./mapIcons.js";

const TRABZON_CENTER = [41.0027, 39.7168];
const pinIcon = createPinIcon("#17324D");

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  return (
    <div style={{ height: 260, borderRadius: 3, overflow: "hidden", border: "1px solid var(--color-line)" }}>
      <MapContainer center={TRABZON_CENTER} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={(latlng) => onChange({ lat: latlng.lat, lng: latlng.lng })} />
        {value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
      </MapContainer>
    </div>
  );
}
