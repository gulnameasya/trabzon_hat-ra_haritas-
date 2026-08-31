import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import pool from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  try {
    await pool.query(sql);
    console.log("✅ Şema başarıyla uygulandı.");
  } catch (err) {
    console.error("❌ Şema uygulanırken hata oluştu:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
