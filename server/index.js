const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Use environment variable for frontend URL in CORS
const CLIENT_URL = process.env.CLIENT_URL || '*';
const PORT = process.env.PORT || 5000;

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Multer setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// === Upload Endpoint ===
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const roomId = req.body.roomId || req.query.roomId;
  const fileInfo = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: `/uploads/${req.file.filename}`
  };

  if (roomId) {
    io.to(roomId).emit('file-shared', fileInfo);
    console.log(`📁 File shared in room: ${roomId}`);
  }

  res.json({
    message: 'File uploaded successfully',
    ...fileInfo,
  });
});

// === WebSocket Events ===
io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`👥 User ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', offer);
  });

  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', answer);
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log(`⚠️ User disconnected: ${socket.id}`);
  });
});

// === Start Server ===
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
