const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// ROUTES
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');


const app = express();

// --------------------------- CORS ---------------------------
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// --------------------------- BODY PARSER ---------------------------
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

// --------------------------- UPLOADS FOLDER ---------------------------
const uploadsDir = path.join(__dirname, 'uploads/videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// --------------------------- STATIC FILES ---------------------------
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));

// --------------------------- ROUTES ---------------------------
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);

// ✅ FIXED — This must NOT be `/api/quiz`


// --------------------------- HEALTH CHECK ---------------------------
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Server running successfully!' });
});

// --------------------------- GLOBAL ERROR HANDLER ---------------------------
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// --------------------------- START SERVER ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
