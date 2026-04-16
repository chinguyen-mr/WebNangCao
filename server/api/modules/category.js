const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../../utils/JwtUtil');
const upload = require('../../utils/UploadUtil');
// daos
const CategoryDAO = require('../../models/CategoryDAO');

// ─── CUSTOMER ROUTES ────────────────────────────────────────────────────────

router.get('/list', async function (_req, res) {
  try {
    const categories = await CategoryDAO.selectAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching category list:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────

router.get('/admin/list', JwtUtil.checkToken, async function (_req, res) {
  try {
    const categories = await CategoryDAO.selectAll();
    res.json(categories);
  } catch (error) {
    console.error('Admin category fetch error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
});

router.post('/admin/add', JwtUtil.checkToken, upload.single('image'), async function (req, res) {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.json({ success: false, message: 'Category name must be at least 2 characters' });
    }
    const category = {
      name: name.trim(),
      image: req.file ? `/uploads/${req.file.filename}` : null,
      cdate: Date.now()
    };
    const result = await CategoryDAO.insert(category);
    res.json(result);
  } catch (error) {
    console.error('Admin category add error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

router.put('/admin/update/:id', JwtUtil.checkToken, upload.single('image'), async function (req, res) {
  try {
    const _id = req.params.id;
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.json({ success: false, message: 'Category name must be at least 2 characters' });
    }
    const category = { _id, name: name.trim() };
    if (req.file) {
      category.image = `/uploads/${req.file.filename}`;
    }
    const result = await CategoryDAO.update(category);
    if (result) {
      res.json(result);
    } else {
      res.json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    console.error('Admin category update error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

router.delete('/admin/delete/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const result = await CategoryDAO.delete(_id);
    if (result) {
      res.json(result);
    } else {
      res.json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    console.error('Admin category delete error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

module.exports = router;
