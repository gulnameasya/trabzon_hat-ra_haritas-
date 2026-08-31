import jwt from "jsonwebtoken";
import "dotenv/config";

export default function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Giriş yapmanız gerekiyor." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Bu işlem için yetkiniz yok." });
    }
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Oturum geçersiz veya süresi dolmuş." });
  }
}
