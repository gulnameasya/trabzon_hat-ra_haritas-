import { useEffect, useState } from "react";
import { api } from "../api.js";
import DateFilter from "../components/DateFilter.jsx";
import MapView from "../components/MapView.jsx";
import BackButton from "../components/BackButton.jsx";
import usePageTitle from "../usePageTitle.js";

export default function MapPage() {
  usePageTitle("Harita");
  const [filterState, setFilterState] = useState({
    filter: "all",
    start: "",
    end: "",
    date: "",
  });
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = { filter: filterState.filter };
    if (filterState.filter === "range") {
      params.start = filterState.start;
      params.end = filterState.end;
    }
    if (filterState.filter === "exact") {
      params.date = filterState.date;
    }

    api
      .getLocations(params)
      .then((data) => setClusters(data.clusters))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filterState]);

  return (
    <div className="map-page">
      <aside className="map-sidebar">
        <BackButton />
        <h2>Tarihe Göre Filtrele</h2>
        <DateFilter value={filterState} onChange={setFilterState} />
        <div className="map-stat">
          {loading
            ? "Yükleniyor…"
            : (
              <>
                <strong>{clusters.reduce((sum, c) => sum + c.photos.length, 0)}</strong> onaylanmış fotoğraf,{" "}
                <strong>{clusters.length}</strong> konumda gösteriliyor.
              </>
            )}
        </div>
        {error && <p className="alert alert--error" style={{ marginTop: 16 }}>{error}</p>}
      </aside>
      <div className="map-container">
        <MapView clusters={clusters} />
      </div>
    </div>
  );
}
