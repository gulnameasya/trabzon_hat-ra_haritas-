import multer from "multer";
import path from "path";
import fs from "fs";
import "dotenv/config";

const uploadDir = process.env.UPLOAD_DIR || "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
  const allowedMime = ["image/jpeg", "image/png", "image/webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  // Hem uzantı hem tarayıcının bildirdiği MIME tipi kontrol ediliyor.
  // Asıl doğrulama, dosya diske yazıldıktan sonra gerçek dosya imzasına
  // (magic bytes) bakan verifyImageSignature ile yapılır.
  if (allowedExt.includes(ext) && allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Yalnızca JPG, PNG veya WEBP formatında fotoğraf yükleyebilirsiniz."));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// Yüklenen dosyanın uzantısı/MIME'ı doğru görünse bile, gerçekten bir
// JPG/PNG/WEBP dosyası olup olmadığını ilk baytlarına (magic bytes)
// bakarak doğrular. Sahte uzantılı zararlı dosyalara karşı ek koruma.
// Geçersizse dosyayı diskten siler ve false döner.
export function verifyImageSignature(filePath) {
  const buffer = Buffer.alloc(12);
  const fd = fs.openSync(filePath, "r");
  fs.readSync(fd, buffer, 0, 12, 0);
  fs.closeSync(fd);

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isWebp =
    buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";

  if (isJpeg || isPng || isWebp) return true;

  fs.unlinkSync(filePath);
  return false;
}

export default upload;
