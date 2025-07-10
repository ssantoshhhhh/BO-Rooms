const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Create a room (admin only)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const images = req.files.map(file => file.path);
    const room = new Room({ ...req.body, images });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all rooms (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, area, flatType, minRent, maxRent, status, suitableFor } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (area) filter.area = area;
    if (flatType) filter.flatType = flatType;
    if (status) filter.status = status;
    if (minRent || maxRent) filter.rent = {};
    if (minRent) filter.rent.$gte = Number(minRent);
    if (maxRent) filter.rent.$lte = Number(maxRent);
    if (suitableFor) filter.suitableFor = Number(suitableFor);
    const rooms = await Room.find(filter).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a room (admin only)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    let update = req.body;
    if (req.files && req.files.length > 0) {
      update.images = req.files.map(file => file.path);
    }
    const room = await Room.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a room (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark as rented (public, but could be protected if needed)
router.patch('/:id/rented', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { status: 'rented' }, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 