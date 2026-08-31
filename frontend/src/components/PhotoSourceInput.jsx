"use client";

import { useEffect, useRef, useState } from "react";

// Kullanıcı fotoğrafı ya bilgisayarından dosya olarak yükleyebilir
// (sürükle-bırak destekli, seçilince küçük bir önizleme gösterir),
// ya da bir görsel linki yapıştırabilir. `onChange` her zaman
// { type: "file", file } ya da { type: "url", url } şeklinde bir değer alır.
export default function PhotoSourceInput({ label, onChange }) {
  const [mode, setMode] = useState("file");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState(null); // { url, name }
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  // Object URL'leri bellek sızıntısı olmaması için bileşen kapanınca /
  // yeni dosya seçilince serbest bırakıyoruz.
  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  function handleModeChange(nextMode) {
    setMode(nextMode);
    if (nextMode === "file") {
      onChange({ type: "file", file: null });
    } else {
      setPreview(null);
      onChange({ type: "url", url });
    }
  }

  function handleFile(file) {
    if (!file) return;
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview({ url: URL.createObjectURL(file), name: file.name });
    onChange({ type: "file", file });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearPreview() {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange({ type: "file", file: null });
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="mode-toggle mode-toggle--compact">
        <button type="button" className={mode === "file" ? "active" : ""} onClick={() => handleModeChange("file")}>
          Dosya Yükle
        </button>
        <button type="button" className={mode === "url" ? "active" : ""} onClick={() => handleModeChange("url")}>
          Link ile Ekle
        </button>
      </div>

      {mode === "file" ? (
        preview ? (
          <div className="photo-preview">
            <img src={preview.url} alt="Seçilen fotoğraf önizlemesi" />
            <div className="photo-preview__info">
              <span className="photo-preview__name">{preview.name}</span>
              <button type="button" className="btn btn--ghost" onClick={clearPreview}>
                Değiştir
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`file-drop ${dragOver ? "is-dragover" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <p>Fotoğrafı buraya sürükleyip bırakın</p>
            <p className="helper-text">veya tıklayıp bilgisayarınızdan seçin (JPG, PNG, WEBP — en fazla 15MB)</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
              style={{ display: "none" }}
            />
          </div>
        )
      ) : (
        <>
          <input
            type="text"
            placeholder="https://..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              onChange({ type: "url", url: e.target.value });
            }}
          />
          <p className="helper-text">Görselin doğrudan adresini (.jpg, .png vb.) yapıştırın.</p>
        </>
      )}
    </div>
  );
}
