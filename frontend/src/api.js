const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `İstek başarısız oldu (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  getLocations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${BASE}/locations?${qs}`).then(handle);
  },

  getPhoto: (id) => fetch(`${BASE}/photos/${id}`).then(handle),

  getFeatured: (limit = 10) => fetch(`${BASE}/photos/featured?limit=${limit}`).then(handle),

  getStats: () => fetch(`${BASE}/photos/stats`).then(handle),

  getExamplePair: () => fetch(`${BASE}/photos/example-pair`).then(handle),

  getPhotoList: (page = 1, limit = 24, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (filters.type) params.set("type", filters.type);
    if (filters.start) params.set("start", filters.start);
    if (filters.end) params.set("end", filters.end);
    if (filters.location) params.set("location", filters.location);
    return fetch(`${BASE}/photos/list?${params.toString()}`).then(handle);
  },

  uploadSingle: (formData) =>
    fetch(`${BASE}/photos/single`, { method: "POST", body: formData }).then(handle),

  uploadPair: (formData) =>
    fetch(`${BASE}/photos/pair`, { method: "POST", body: formData }).then(handle),

  adminLogin: (username, password) =>
    fetch(`${BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(handle),

  getPending: (token) =>
    fetch(`${BASE}/admin/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(handle),

  approve: (token, id) =>
    fetch(`${BASE}/admin/${id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).then(handle),

  reject: (token, id, reason) =>
    fetch(`${BASE}/admin/${id}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }).then(handle),
};
