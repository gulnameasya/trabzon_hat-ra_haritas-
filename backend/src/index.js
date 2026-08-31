import express from "express";
import cors from "cors";
import path from "path";
import "dotenv/config";

import locationsRouter from "./routes/locations.js";
import photosRouter from "./routes/photos.js";
import adminRouter from "./routes/admin.js";

const app = express();

// Geliştirme ortamında (FRONTEND_URL tanımlı değilse) tüm originlere izin
// verilir. Production'da .env'de FRONTEND_URL tanımlanınca CORS sadece o
// adrese izin verecek şekilde daralır.
const corsOptions = process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL }
  : {};
app.use(cors(corsOptions));
app.use(express.json());

// Yüklenen fotoğrafları statik olarak servis ediyoruz
const uploadDir = process.env.UPLOAD_DIR || "uploads";
app.use("/uploads", express.static(path.resolve(uploadDir)));

app.use("/api/locations", locationsRouter);
app.use("/api/photos", photosRouter);
app.use("/api/admin", adminRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Trabzon Hatıra Haritası API çalışıyor: http://localhost:${PORT}`);
});
