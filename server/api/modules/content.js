const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// models
const Models = require('../../models/Models');
// utils
const JwtUtil = require('../../utils/JwtUtil');

// ─── CUSTOMER ROUTES ────────────────────────────────────────────────────────

// Get content by slug (e.g., /about, /contact-info)
router.get('/page/:slug', async function (req, res) {
  try {
    const slug = req.params.slug;
    const content = await Models.SiteContent.findOne({ slug: slug, type: 'page' }).exec();
    res.json(content || { title: '', body: '' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Submit contact form (Enquiry)
router.post('/enquiry', async function (req, res) {
  try {
    const enquiry = req.body;
    enquiry._id = new mongoose.Types.ObjectId();
    enquiry.cdate = Date.now();
    enquiry.status = 'new';
    const result = await Models.Enquiry.create(enquiry);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────

// Get all pages for admin
router.get('/admin/list', JwtUtil.checkToken, async function (_req, res) {
  try {
    const content = await Models.SiteContent.find().exec();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Update or create site content
router.post('/admin/update', JwtUtil.checkToken, async function (req, res) {
  try {
    const { slug, title, body, type } = req.body;
    const result = await Models.SiteContent.findOneAndUpdate(
      { slug: slug },
      { title, body, type },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// List all enquiries
router.get('/admin/enquiries', JwtUtil.checkToken, async function (_req, res) {
  try {
    const enquiries = await Models.Enquiry.find().sort({ cdate: -1 }).exec();
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
