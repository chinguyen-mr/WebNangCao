const express = require('express');
const router = express.Router();
const JwtUtil = require('../../utils/JwtUtil');
const TestimonialDAO = require('../../models/TestimonialDAO');

// Customer Route
router.get('/customer/list', async function (req, res) {
  try {
    const testimonials = await TestimonialDAO.selectActive();
    res.json(testimonials);
  } catch (error) {
    console.error('Customer testimonial error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load testimonials' });
  }
});

// Admin Routes
router.get('/admin/list', JwtUtil.checkToken, async function (req, res) {
  try {
    const list = await TestimonialDAO.selectAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load list' });
  }
});

router.post('/admin/add', JwtUtil.checkToken, async function (req, res) {
  try {
    const item = req.body;
    const result = await TestimonialDAO.insert(item);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding testimonial' });
  }
});

router.put('/admin/update/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const item = req.body;
    item._id = req.params.id;
    const result = await TestimonialDAO.update(item);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating testimonial' });
  }
});

router.delete('/admin/delete/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const result = await TestimonialDAO.delete(_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting testimonial' });
  }
});

module.exports = router;
