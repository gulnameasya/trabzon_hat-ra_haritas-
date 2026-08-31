import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import LocationPicker from "../components/LocationPicker.jsx";
import PhotoSourceInput from "../components/PhotoSourceInput.jsx";
import usePageTitle from "../usePageTitle.js";
import BackButton from "../components/BackButton.jsx";

// Üç mod:
//  "eski"      -> yalnızca eski fotoğraf (Durum 2)
//  "cift"      -> eski + güncel birlikte (Durum 1)
//  "tamamla"   -> var olan bir eski fotoğrafın "bugünkü hali" (Bölüm 9)
export default function UploadPage() {
  usePageTitle("Fotoğraf Yükle");
  const [searchParams] = useSearchParams();
  const tamamlaId = searchParams.get("tamamla");
  const navigate = useNavigate();

  const [mode, setMode] = useState(tamamlaId ? "tamamla" : "eski");
  const [location, setLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [dateKnown, setDateKnown] = useState(true);
  const [dateYear, setDateYear] = useState("");
  const [description, setDescription] = useState("");
  const [uploaderName, setUploaderName] = useState("");
  const [uploaderPhone, setUploaderPhone] = useState("");
  const [eskiSource, setEskiSource] = useState({ type: "file", file: null });
  const [guncelSource, setGuncelSource] = useState({ type: "file", file: null });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const needsLocation = mode !== "tamamla"; // "bugünkü halini ekle" akışında konum zaten eski fotoğrafa ait

  function hasValue(source) {
    return source.type === "file" ? Boolean(source.file) : Boolean(source.url?.trim());
  }

  function appendSource(fd, source, fileField, urlField) {
    if (source.type === "file") {
      fd.append(fileField, source.file);
    } else {
      fd.append(urlField, source.url.trim());
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!uploaderName.trim()) return setError("Ad soyad zorunludur.");
    if (needsLocation && !location) return setError("Lütfen fotoğrafın çekildiği konumu haritadan işaretleyin.");

    setSubmitting(true);
    try {
      if (mode === "cift") {
        if (!hasValue(eskiSource) || !hasValue(guncelSource)) {
          throw new Error("Hem eski hem güncel fotoğrafı (dosya ya da link) eklemelisiniz.");
        }
        const fd = new FormData();
        appendSource(fd, eskiSource, "eskiFoto", "eski_photo_url");
        appendSource(fd, guncelSource, "guncelFoto", "guncel_photo_url");
        fd.append("lat", location.lat);
        fd.append("lng", location.lng);
        fd.append("location_label", locationLabel);
        fd.append("date_known", dateKnown);
        if (dateKnown) fd.append("date_year", dateYear);
        fd.append("description", description);
        fd.append("uploader_name", uploaderName);
        fd.append("uploader_phone", uploaderPhone);
        await api.uploadPair(fd);
      } else {
        const source = mode === "tamamla" ? guncelSource : eskiSource;
        if (!hasValue(source)) throw new Error("Lütfen bir fotoğraf dosyası seçin veya link ekleyin.");
        const fd = new FormData();
        appendSource(fd, source, "photo", "photo_url");
        fd.append("photo_type", mode === "tamamla" ? "guncel" : "eski");
        if (needsLocation) {
          fd.append("lat", location.lat);
          fd.append("lng", location.lng);
          fd.append("location_label", locationLabel);
        }
        // mode === "tamamla" iken konum gönderilmiyor; backend eski fotoğrafın
        // konumunu otomatik olarak kullanıyor.
        fd.append("date_known", mode === "tamamla" ? false : dateKnown);
        if (mode !== "tamamla" && dateKnown) fd.append("date_year", dateYear);
        fd.append("description", description);
        fd.append("uploader_name", uploaderName);
        fd.append("uploader_phone", uploaderPhone);
        if (mode === "tamamla") fd.append("replying_to_photo_id", tamamlaId);
        await api.uploadSingle(fd);
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="page">
        <BackButton />
        <p className="alert alert--success">
          Fotoğrafınız gönderildi. Belediye moderasyonundan onaylandıktan sonra haritada
          yayınlanacak. Teşekkür ederiz!
        </p>
        <button className="btn btn--ghost" onClick={() => navigate("/harita")}>Haritaya Dön</button>
      </div>
    );
  }

  return (
    <div className="page">
      <BackButton />
      <p className="eyebrow">Katkınız İçin Teşekkürler</p>
      <h1>Fotoğrafını Trabzon'un hafızasına ekle</h1>

      {mode !== "tamamla" && (
        <div className="mode-toggle">
          <button type="button" className={mode === "eski" ? "active" : ""} onClick={() => setMode("eski")}>
            Sadece Eski Fotoğraf
          </button>
          <button type="button" className={mode === "cift" ? "active" : ""} onClick={() => setMode("cift")}>
            Eski + Güncel Birlikte
          </button>
        </div>
      )}
      {mode === "tamamla" && (
        <p className="helper-text" style={{ marginBottom: 20 }}>
          #{tamamlaId} numaralı eski fotoğrafın bugünkü halini ekliyorsunuz.
        </p>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <p className="alert alert--error">{error}</p>}

        {mode === "eski" && (
          <PhotoSourceInput label="Eski Fotoğraf *" onChange={setEskiSource} />
        )}

        {mode === "cift" && (
          <>
            <PhotoSourceInput label="Eski Fotoğraf *" onChange={setEskiSource} />
            <PhotoSourceInput label="Güncel Fotoğraf *" onChange={setGuncelSource} />
          </>
        )}

        {mode === "tamamla" && (
          <PhotoSourceInput label="Bugünkü Fotoğraf *" onChange={setGuncelSource} />
        )}

        {needsLocation && (
          <div className="field">
            <label>Konum * (haritaya tıklayarak işaretleyin)</label>
            <LocationPicker value={location} onChange={setLocation} />
            {location && (
              <p className="helper-text">Seçilen konum: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
            )}
          </div>
        )}

        {needsLocation && (
          <div className="field">
            <label>Konum Adı (isteğe bağlı)</label>
            <input
              type="text"
              placeholder="örn. Trabzon Meydan"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
            />
          </div>
        )}

        {mode !== "tamamla" && (
          <div className="field">
            <label>Fotoğrafın Tarihi *</label>
            <label className="filter-option">
              <input type="radio" checked={dateKnown} onChange={() => setDateKnown(true)} />
              Tarihi biliyorum
            </label>
            {dateKnown && (
              <input
                type="text"
                placeholder="örn. 1988"
                value={dateYear}
                onChange={(e) => setDateYear(e.target.value)}
                style={{ marginLeft: 24, marginBottom: 8, maxWidth: 160 }}
              />
            )}
            <label className="filter-option">
              <input type="radio" checked={!dateKnown} onChange={() => setDateKnown(false)} />
              Tarihi bilinmiyor
            </label>
          </div>
        )}

        <div className="field">
          <label>Açıklama / Anı (isteğe bağlı)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <hr className="hairline" />

        <div className="field">
          <label>Ad Soyad *</label>
          <input type="text" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} />
        </div>
        <div className="field">
          <label>Telefon Numarası</label>
          <input type="tel" value={uploaderPhone} onChange={(e) => setUploaderPhone(e.target.value)} />
          <p className="helper-text">
            Bu bilgi diğer vatandaşlara asla gösterilmez, yalnızca belediye tarafından görülür.
          </p>
        </div>

        <button className="btn btn--copper" type="submit" disabled={submitting}>
          {submitting ? "Gönderiliyor…" : "Gönder"}
        </button>
      </form>
    </div>
  );
}
