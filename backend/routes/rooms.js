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
    let roomData = { ...req.body };
    
    // Clean up the room data to handle null/empty values
    Object.keys(roomData).forEach(key => {
      if (roomData[key] === 'null' || roomData[key] === '' || roomData[key] === null) {
        delete roomData[key]; // Remove null/empty values
      }
    });
    
    // Convert suitableFor to number if it exists and is not empty
    if (roomData.suitableFor && roomData.suitableFor !== 'null' && roomData.suitableFor !== '') {
      roomData.suitableFor = Number(roomData.suitableFor);
    } else {
      delete roomData.suitableFor; // Remove if null/empty
    }
    
    // Convert rent to number if it exists
    if (roomData.rent) {
      roomData.rent = Number(roomData.rent);
    }
    
    // Convert price to number if it exists
    if (roomData.price) {
      roomData.price = Number(roomData.price);
    }
    
    // Ensure the correct field is provided based on property type
    if (roomData.propertyType === 'sale') {
      if (!roomData.price) {
        return res.status(400).json({ message: 'Price is required for sale properties' });
      }
      // Remove rent field for sale properties
      delete roomData.rent;
    } else if (roomData.propertyType === 'rent') {
      if (!roomData.rent) {
        return res.status(400).json({ message: 'Rent is required for rental properties' });
      }
      // Remove price field for rent properties
      delete roomData.price;
    }
    
    // Handle location coordinates
    if (roomData['locationCoordinates.latitude'] && roomData['locationCoordinates.longitude']) {
      roomData.locationCoordinates = {
        latitude: Number(roomData['locationCoordinates.latitude']),
        longitude: Number(roomData['locationCoordinates.longitude'])
      };
      delete roomData['locationCoordinates.latitude'];
      delete roomData['locationCoordinates.longitude'];
    }
    
    const images = req.files ? req.files.map(file => file.path) : [];
    const room = new Room({ ...roomData, images });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    console.error('Error creating room:', err);
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
    let update = { ...req.body };
    
    // Clean up the update object to handle null/empty values
    Object.keys(update).forEach(key => {
      if (update[key] === 'null' || update[key] === '' || update[key] === null) {
        delete update[key]; // Remove null/empty values
      }
    });
    
    // Convert suitableFor to number if it exists and is not empty
    if (update.suitableFor && update.suitableFor !== 'null' && update.suitableFor !== '') {
      update.suitableFor = Number(update.suitableFor);
    } else {
      delete update.suitableFor; // Remove if null/empty
    }
    
    // Convert rent to number if it exists
    if (update.rent) {
      update.rent = Number(update.rent);
    }
    
    // Convert price to number if it exists
    if (update.price) {
      update.price = Number(update.price);
    }
    
    // Ensure the correct field is provided based on property type
    if (update.propertyType === 'sale') {
      if (!update.price) {
        return res.status(400).json({ message: 'Price is required for sale properties' });
      }
      // Remove rent field for sale properties
      delete update.rent;
    } else if (update.propertyType === 'rent') {
      if (!update.rent) {
        return res.status(400).json({ message: 'Rent is required for rental properties' });
      }
      // Remove price field for rent properties
      delete update.price;
    }
    
    // Handle location coordinates
    if (update['locationCoordinates.latitude'] && update['locationCoordinates.longitude']) {
      update.locationCoordinates = {
        latitude: Number(update['locationCoordinates.latitude']),
        longitude: Number(update['locationCoordinates.longitude'])
      };
      delete update['locationCoordinates.latitude'];
      delete update['locationCoordinates.longitude'];
    }
    
    // Only update images if new files are uploaded
    if (req.files && req.files.length > 0) {
      update.images = req.files.map(file => file.path);
    }
    
    const room = await Room.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    console.error('Error updating room:', err);
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