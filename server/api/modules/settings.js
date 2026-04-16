const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// models
const Models = require('../../models/Models');
// utils
const JwtUtil = require('../../utils/JwtUtil');

// ─── CUSTOMER ROUTES ────────────────────────────────────────────────────────

// Get settings by group (e.g. 'general', 'contact', 'social')
router.get('/group/:group', async function (req, res) {
  try {
    const group = req.params.group;
    const settings = await Models.Settings.find({ group: group }).exec();
    // Convert array of [{key, value}] to object {key: value}
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────

// Update specific setting
router.post('/admin/update', JwtUtil.checkToken, async function (req, res) {
  try {
    const { key, value, group } = req.body;
    const result = await Models.Settings.findOneAndUpdate(
      { key: key },
      { value, group },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
