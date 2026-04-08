const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// models
const Models = require('../../models/Models');
// utils
const JwtUtil = require('../../utils/JwtUtil');
const upload = require('../../utils/UploadUtil');

// ─── CUSTOMER ROUTES ────────────────────────────────────────────────────────

// Get all active banners
router.get('/list', async function (_req, res) {
  try {
    const banners = await Models.Banner.find({ active: true }).sort({ order: 1 }).exec();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────

// Get all banners for admin
router.get('/admin/list', JwtUtil.checkToken, async function (_req, res) {
  try {
    const banners = await Models.Banner.find().sort({ order: 1 }).exec();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Add new banner
router.post('/admin/add', JwtUtil.checkToken, upload.single('image'), async function (req, res) {
  try {
    const { title, subtitle, label, link, order, active } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const banner = {
      _id: new mongoose.Types.ObjectId(),
      title,
      subtitle,
      label,
      link,
      order: Number(order) || 0,
      active: active === 'true' || active === true,
      image
    };

    const result = await Models.Banner.create(banner);
    res.json(result);
  } catch (error) {
    console.error('Banner add error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Update banner
router.put('/admin/update/:id', JwtUtil.checkToken, upload.single('image'), async function (req, res) {
  try {
    const _id = req.params.id;
    const { title, subtitle, label, link, order, active } = req.body;
    
    const banner = {
      title,
      subtitle,
      label,
      link,
      order: Number(order) || 0,
      active: active === 'true' || active === true
    };

    if (req.file) {
      banner.image = `/uploads/${req.file.filename}`;
    }

    const result = await Models.Banner.findByIdAndUpdate(_id, banner, { new: true });
    res.json(result);
  } catch (error) {
    console.error('Banner update error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Delete banner
router.delete('/admin/delete/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const result = await Models.Banner.findByIdAndDelete(_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
