const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const router = express.Router();

// ---------------------- SETUP UPLOAD FOLDER ----------------------
const uploadFolder = path.join(__dirname, '../uploads/videos');

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
  console.log("✅ Video upload folder created");
}

// ---------------------- MULTER CONFIG ----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      'video/mp4',
      'video/mkv',
      'video/webm',
      'video/avi',
      'video/mov',
      'video/wmv'
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Invalid video file type'));
    }
    cb(null, true);
  }
});

// ---------------------- UPLOAD VIDEO ----------------------
router.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No video uploaded" });

  const { title, description } = req.body;

  const filename = req.file.filename;
  const original = req.file.originalname;
  const file_path = `/uploads/videos/${filename}`;
  const file_size = req.file.size;

  const sql = `
    INSERT INTO videos 
    (title, description, filename, original_name, file_path, file_size) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, filename, original, file_path, file_size],
    (err, result) => {
      if (err) {
        console.log("❌ Upload DB Error:", err);
        return res.status(500).json({ message: "Failed to upload", error: err });
      }

      res.json({
        message: "✅ Video uploaded successfully",
        id: result.insertId,
        video: { title, description, filename, file_path }
      });
    }
  );
});

// ---------------------- GET ALL VIDEOS ----------------------
router.get('/', (req, res) => {
  const sql = "SELECT * FROM videos ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.log("❌ Fetch videos error:", err);
      return res.status(500).json({ message: "Failed to fetch videos" });
    }
    res.json(results);
  });
});

// ---------------------- STREAM VIDEO ----------------------
router.get('/stream/:filename', (req, res) => {
  const filePath = path.join(uploadFolder, req.params.filename);

  if (!fs.existsSync(filePath)) return res.status(404).send("Video not found");

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1]) : fileSize - 1;

    const chunkSize = end - start + 1;

    const stream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4"
    });

    stream.pipe(res);
  }
});

// ---------------------- DELETE VIDEO ----------------------
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  db.query("SELECT file_path FROM videos WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.log("❌ Fetch file error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length === 0) return res.status(404).json({ message: "Video not found" });

    const file = path.join(__dirname, "..", rows[0].file_path);

    if (fs.existsSync(file)) fs.unlinkSync(file);

    db.query("DELETE FROM videos WHERE id = ?", [id], (err) => {
      if (err) {
        console.log("❌ Delete DB error:", err);
        return res.status(500).json({ message: "Failed to delete video" });
      }
      res.json({ message: "✅ Video deleted successfully" });
    });
  });
});

module.exports = router;
