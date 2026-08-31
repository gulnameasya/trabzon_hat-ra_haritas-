import { useEffect, useState } from "react";
import { api } from "../api.js";
import usePageTitle from "../usePageTitle.js";
import { fileUrl } from "../fileUrl.js";
import BackButton from "../components/BackButton.jsx";

export default function AdminPage() {
  usePageTitle("Belediye Paneli");
  const [token, setToken] = useState(sessionStorage.getItem("admin_token") || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  async function loadPending(activeToken) {
    setLoading(true);
    setActionError(null);
    try {
      const data = await api.getPending(activeToken);
      setPending(data.pending);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadPending(token);
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    try {
      const data = await api.adminLogin(username, password);
      sessionStorage.setItem("admin_token", data.token);
      setToken(data.token);
    } catch (err) {
      setLoginError(err.message);
    }
  }

  async function handleApprove(id) {
    try {
      await api.approve(token, id);
      loadPending(token);
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleReject(id) {
    try {
      await api.reject(token, id);
      loadPending(token);
    } catch (err) {
      setActionError(err.message);
    }
  }

  function logout() {
    sessionStorage.removeItem("admin_token");
    setToken("");
  }

  if (!token) {
    return (
      <div className="page">
        <BackButton />
        <div className="admin-login form-card">
          <p className="eyebrow">Belediye Girişi</p>
          <h2>Moderasyon Paneli</h2>
          {loginError && <p className="alert alert--error">{loginError}</p>}
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Kullanıcı Adı</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn btn--copper" type="submit">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <BackButton />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="eyebrow">Belediye Moderasyon Paneli</p>
          <h1>İncelemesi Bekleyen İçerikler</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {!loading && (
            <span className="pending-count-badge">
              {pending.length} bekliyor
            </span>
          )}
          <button className="btn btn--ghost" onClick={logout}>Çıkış Yap</button>
        </div>
      </div>

      {actionError && <p className="alert alert--error">{actionError}</p>}
      {loading && <p>Yükleniyor…</p>}

      {!loading && pending.length === 0 && (
        <div className="empty-state">
          <p>Şu anda incelemesi bekleyen içerik yok. Yeni bir gönderi geldiğinde burada görünecek.</p>
        </div>
      )}

      {!loading && pending.length > 0 && (
        <div className="review-list">
          {pending.map((p) => (
            <div className="review-card" key={p.id}>
              <img className="review-card__thumb" src={fileUrl(p.image_path)} alt="" />

              <div className="review-card__body">
                <div className="review-card__badges">
                  <span className={`badge ${p.photo_type === "eski" ? "badge--eski" : "badge--guncel"}`}>
                    {p.photo_type === "eski" ? "Eski Fotoğraf" : "Güncel Fotoğraf"}
                  </span>
                  {p.replying_to_photo_id && (
                    <span className="badge badge--reply">#{p.replying_to_photo_id} için tamamlama</span>
                  )}
                  <span className="badge badge--date">
                    {p.date_known ? p.date_year : "Tarih bilinmiyor"}
                  </span>
                </div>

                <p className="review-card__location">
                  {p.location_label || `${p.location_lat.toFixed(4)}, ${p.location_lng.toFixed(4)}`}
                </p>

                {p.description && <p className="review-card__description">"{p.description}"</p>}

                <p className="uploader-info">
                  {p.uploader_name}
                  {p.uploader_phone ? ` · ${p.uploader_phone}` : ""}
                  {p.uploader_tc ? ` · ${p.uploader_tc}` : ""}
                </p>
              </div>

              <div className="review-card__actions">
                <button className="btn btn--copper" onClick={() => handleApprove(p.id)}>Onayla</button>
                <button className="btn btn--ghost" onClick={() => handleReject(p.id)}>Reddet</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
