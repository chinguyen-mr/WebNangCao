const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// models
const Models = require('../../models/Models');
// utils
const JwtUtil = require('../../utils/JwtUtil');
const upload = require('../../utils/UploadUtil');

function slugifyVietnamese(str) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  return str.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// ─── CUSTOMER ROUTES ────────────────────────────────────────────────────────

// Get all active blog articles
router.get('/list', async function (_req, res) {
  try {
    const articles = await Models.Blog.find({ active: true }).sort({ cdate: -1 }).exec();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get article detail by slug
router.get('/detail/:slug', async function (req, res) {
  try {
    const slug = req.params.slug;
    const article = await Models.Blog.findOne({ slug: slug, active: true }).exec();
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────

// Get all articles for admin
router.get('/admin/list', JwtUtil.checkToken, async function (_req, res) {
  try {
    const articles = await Models.Blog.find().sort({ cdate: -1 }).exec();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Add new article
router.post('/admin/add', JwtUtil.checkToken, upload.single('image'), async function (req, res) {
  try {
    const { title, excerpt, content, author, active } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const article = {
      _id: new mongoose.Types.ObjectId(),
      title,
      slug: slugifyVietnamese(title),
      excerpt,
      content,
      author,
      active: active === 'true' || active === true,
      image,
      cdate: Date.now()
    };

    const result = await Models.Blog.create(article);
    res.json(result);
  } catch (error) {
    console.error('Blog add error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Update article
router.put('/admin/update/:id', JwtUtil.checkToken, upload.single('image'), async function (req, res) {
  try {
    const _id = req.params.id;
    const { title, excerpt, content, author, active } = req.body;
    
    const article = {
      title,
      slug: slugifyVietnamese(title),
      excerpt,
      content,
      author,
      active: active === 'true' || active === true
    };

    if (req.file) {
      article.image = `/uploads/${req.file.filename}`;
    }

    const result = await Models.Blog.findByIdAndUpdate(_id, article, { new: true });
    res.json(result);
  } catch (error) {
    console.error('Blog update error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Delete article
router.delete('/admin/delete/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const result = await Models.Blog.findByIdAndDelete(_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
