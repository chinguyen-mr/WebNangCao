const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../../utils/JwtUtil');
// daos
const ProductDAO = require('../../models/ProductDAO');
const CategoryDAO = require('../../models/CategoryDAO');
const upload = require('../../utils/UploadUtil');

// ─── CUSTOMER ROUTES ────────────────────────────────────────────────────────

router.get('/list/new', async function (_req, res) {
  try {
    const products = await ProductDAO.selectTopNew(3);
    res.json(products);
  } catch (error) {
    console.error('Error fetching new products:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
});

router.get('/list/hot', async function (_req, res) {
  try {
    const products = await ProductDAO.selectTopHot(3);
    res.json(products);
  } catch (error) {
    console.error('Error fetching hot products:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
});

router.get('/list/category/:cid', async function (req, res) {
  try {
    const cid = req.params.cid;
    let products;
    
    // Check if cid is a valid MongoDB ObjectId
    if (cid.match(/^[0-9a-fA-F]{24}$/)) {
      products = await ProductDAO.selectByCatID(cid);
    } else {
      // Treat as slug
      const category = await CategoryDAO.selectBySlug(cid);
      if (category) {
        products = await ProductDAO.selectByCatID(category._id);
      } else {
        products = [];
      }
    }
    res.json(products);
  } catch (error) {
    console.error('Error fetching category products:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
});

router.get('/list/search/:keyword', async function (req, res) {
  try {
    const keyword = req.params.keyword;
    const products = await ProductDAO.selectByKeyword(keyword);
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error.message);
    res.status(500).json({ success: false, message: 'Failed to search products' });
  }
});

router.get('/detail/:id', async function (req, res) {
  try {
    const id = req.params.id;
    let product;
    
    // Check if id is a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await ProductDAO.selectByID(id);
    } else {
      // Treat as slug
      product = await ProductDAO.selectBySlug(id);
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product detail:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load product' });
  }
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────

router.get('/admin/list', JwtUtil.checkToken, async function (req, res) {
  try {
    const noProducts = await ProductDAO.selectByCount();
    const sizePage = 4;
    const noPages = Math.ceil(noProducts / sizePage);
    let curPage = req.query.page ? parseInt(req.query.page) : 1;
    const skip = (curPage - 1) * sizePage;
    const products = await ProductDAO.selectBySkipLimit(skip, sizePage);
    res.json({ products: products, noPages: noPages, curPage: curPage });
  } catch (error) {
    console.error('Admin product fetch error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
});

router.post('/admin/add', JwtUtil.checkToken, upload.array('images', 8), async function (req, res) {
  try {
    const { name, price, category: cid, description, discount, stock, status } = req.body;
    const images = req.files && req.files.length > 0
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    if (!name || name.trim().length < 3) return res.json({ success: false, message: 'Invalid name' });
    if (!price || isNaN(price) || price <= 0) return res.json({ success: false, message: 'Invalid price' });
    if (!cid) return res.json({ success: false, message: 'Category required' });
    if (images.length === 0) return res.json({ success: false, message: 'At least one image is required' });

    const category = await CategoryDAO.selectByID(cid);
    if (!category) return res.json({ success: false, message: 'Category not found' });

    const now = new Date().getTime();
    const product = {
      name: name.trim(),
      price: Number(price),
      images,
      image: images[0],
      cdate: now,
      category,
      description: description || '',
      discount: Number(discount) || 0,
      stock: Number(stock) || 0,
      status: status === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK'
    };
    if (product.status === 'OUT_OF_STOCK') {
      product.stock = 0;
    }
    const result = await ProductDAO.insert(product);
    res.json(result);
  } catch (error) {
    console.error('Admin product add error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to add product' });
  }
});

router.put('/admin/update/:id', JwtUtil.checkToken, upload.array('images', 8), async function (req, res) {
  try {
    const _id = req.params.id;
    const { name, price, category: cid, description, discount, stock, status, keepImageIndices } = req.body;
    
    // Handle images
    let images = undefined;
    
    if (req.files && req.files.length > 0) {
      // New images uploaded - replace all old images
      images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (keepImageIndices) {
      // No new images, but keeping some existing ones
      // keepImageIndices is a comma-separated string like "0,2,3"
      const existingProduct = await ProductDAO.selectByID(_id);
      if (existingProduct && existingProduct.images) {
        const indicesToKeep = keepImageIndices.split(',').map(i => parseInt(i));
        images = existingProduct.images.filter((_, idx) => indicesToKeep.includes(idx));
      }
    }

    const category = await CategoryDAO.selectByID(cid);
    if (!category) return res.json({ success: false, message: 'Category not found' });

    const product = {
      _id,
      name: name.trim(),
      price: Number(price),
      category,
      description: description || '',
      discount: Number(discount) || 0,
      stock: Number(stock) || 0,
      status: status === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK'
    };

    if (product.status === 'OUT_OF_STOCK') {
      product.stock = 0;
    }

    if (images !== undefined) {
      product.images = images;
      if (images.length > 0) {
        product.image = images[0];
      }
    }

    const result = await ProductDAO.update(product);
    if (result) {
      res.json(result);
    } else {
      res.json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error('Admin product update error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

router.delete('/admin/delete/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const result = await ProductDAO.delete(_id);
    if (result) {
      res.json(result);
    } else {
      res.json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error('Admin product delete error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

module.exports = router;
