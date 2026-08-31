"use client";

export default function DateFilter({ value, onChange }) {
  const { filter, start, end, date } = value;

  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div>
      <div className="filter-group">
        <label className="filter-option">
          <input
            type="radio"
            checked={filter === "all"}
            onChange={() => set({ filter: "all" })}
          />
          Tümü <span style={{ opacity: 0.6 }}>(tarihi bilinmeyenler dahil)</span>
        </label>

        <label className="filter-option">
          <input
            type="radio"
            checked={filter === "range"}
            onChange={() => set({ filter: "range" })}
          />
          Şu tarihler arası
        </label>
        {filter === "range" && (
          <div className="filter-inputs">
            <input
              type="number"
              inputMode="numeric"
              min="1800"
              max="2100"
              placeholder="Başlangıç (örn. 1980)"
              value={start}
              onChange={(e) => set({ start: e.target.value })}
            />
            <input
              type="number"
              inputMode="numeric"
              min="1800"
              max="2100"
              placeholder="Bitiş (örn. 1990)"
              value={end}
              onChange={(e) => set({ end: e.target.value })}
            />
          </div>
        )}

        <label className="filter-option">
          <input
            type="radio"
            checked={filter === "exact"}
            onChange={() => set({ filter: "exact" })}
          />
          Net şu tarih
        </label>
        {filter === "exact" && (
          <div className="filter-inputs">
            <input
              type="number"
              inputMode="numeric"
              min="1800"
              max="2100"
              placeholder="örn. 1988"
              value={date}
              onChange={(e) => set({ date: e.target.value })}
            />
          </div>
        )}

        <label className="filter-option">
          <input
            type="radio"
            checked={filter === "unknown"}
            onChange={() => set({ filter: "unknown" })}
          />
          Tarihi bilinmeyenler
        </label>
      </div>
    </div>
  );
}
