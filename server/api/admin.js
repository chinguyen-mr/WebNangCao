const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../utils/JwtUtil');
const EmailUtil = require('../utils/EmailUtil');
// daos
const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const OrderDAO = require('../models/OrderDAO');
const CustomerDAO = require('../models/CustomerDAO');

const VALID_ORDER_STATUSES = ['PENDING', 'APPROVED', 'CANCELED'];

// login
router.post('/login', async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
      return res.json({ success: false, message: 'Please input username and password' });
    }

    const admin = await AdminDAO.selectByUsernameAndPassword(username, password);
    if (admin) {
      const token = JwtUtil.genToken(username, password);
      res.json({ success: true, message: 'Authentication successful', token: token });
    } else {
      res.json({ success: false, message: 'Incorrect username or password' });
    }
  } catch (error) {
    console.error('Error during admin login:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// check token
router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token is valid', token: token });
});

// ─── CUSTOMER ────────────────────────────────────────────────────────────────

router.get('/customers', JwtUtil.checkToken, async function (_req, res) {
  try {
    const customers = await CustomerDAO.selectAll();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load customers' });
  }
});

router.get('/customers/sendmail/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const cust = await CustomerDAO.selectByID(_id);

    if (!cust) {
      return res.json({ success: false, message: 'Customer not found' });
    }

    try {
      await EmailUtil.send(cust.email, cust._id, cust.token);
      res.json({ success: true, message: 'Email sent' });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      res.json({ success: false, message: 'Email failure' });
    }
  } catch (error) {
    console.error('Error in sendmail:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

// FIX: was using req.body.token (never sent by client) → now deactivates by ID only
router.put('/customers/deactive/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const result = await CustomerDAO.deactivateByID(_id);
    if (result) {
      res.json({ success: true, message: 'Customer deactivated', customer: result });
    } else {
      res.json({ success: false, message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error deactivating customer:', error.message);
    res.status(500).json({ success: false, message: 'Failed to deactivate customer' });
  }
});

// ─── ORDER ───────────────────────────────────────────────────────────────────

router.get('/orders', JwtUtil.checkToken, async function (_req, res) {
  try {
    const orders = await OrderDAO.selectAll();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
});

router.put('/orders/status/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const newStatus = req.body.status;

    if (!newStatus || !VALID_ORDER_STATUSES.includes(newStatus)) {
      return res.json({ success: false, message: 'Invalid status. Allowed: PENDING, APPROVED, CANCELED' });
    }

    const result = await OrderDAO.update(_id, newStatus);
    if (result) {
      res.json(result);
    } else {
      res.json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  try {
    const _cid = req.params.cid;
    const orders = await OrderDAO.selectByCustID(_cid);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
});

// ─── CATEGORY ────────────────────────────────────────────────────────────────

router.get('/categories', JwtUtil.checkToken, async function (_req, res) {
  try {
    const categories = await CategoryDAO.selectAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
});

router.post('/categories', JwtUtil.checkToken, async function (req, res) {
  try {
    const name = req.body.name;
    if (!name || name.trim().length < 2) {
      return res.json({ success: false, message: 'Category name must be at least 2 characters' });
    }
    const category = { name: name.trim() };
    const result = await CategoryDAO.insert(category);
    res.json(result);
  } catch (error) {
    console.error('Error creating category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

router.put('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const name = req.body.name;
    if (!name || name.trim().length < 2) {
      return res.json({ success: false, message: 'Category name must be at least 2 characters' });
    }
    const category = { _id: _id, name: name.trim() };
    const result = await CategoryDAO.update(category);
    if (result) {
      res.json(result);
    } else {
      res.json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    console.error('Error updating category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

router.delete('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const result = await CategoryDAO.delete(_id);
    if (result) {
      res.json(result);
    } else {
      res.json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    console.error('Error deleting category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

// ─── PRODUCT ─────────────────────────────────────────────────────────────────

router.get('/products', JwtUtil.checkToken, async function (req, res) {
  try {
    const noProducts = await ProductDAO.selectByCount();
    const sizePage = 4;
    const noPages = Math.ceil(noProducts / sizePage);
    let curPage = 1;
    if (req.query.page) curPage = parseInt(req.query.page);
    const skip = (curPage - 1) * sizePage;
    const products = await ProductDAO.selectBySkipLimit(skip, sizePage);
    res.json({ products: products, noPages: noPages, curPage: curPage });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
});

router.post('/products', JwtUtil.checkToken, async function (req, res) {
  try {
    const name = req.body.name;
    const price = req.body.price;
    const cid = req.body.category;
    const image = req.body.image;

    if (!name || name.trim().length < 3) {
      return res.json({ success: false, message: 'Product name must be at least 3 characters' });
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      return res.json({ success: false, message: 'Price must be a positive number' });
    }
    if (!cid) {
      return res.json({ success: false, message: 'Category is required' });
    }
    if (!image) {
      return res.json({ success: false, message: 'Product image is required' });
    }

    const category = await CategoryDAO.selectByID(cid);
    if (!category) {
      return res.json({ success: false, message: 'Category not found' });
    }

    const now = new Date().getTime();
    const product = { name: name.trim(), price: Number(price), image: image, cdate: now, category: category };
    const result = await ProductDAO.insert(product);
    res.json(result);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

router.put('/products/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const name = req.body.name;
    const price = req.body.price;
    const cid = req.body.category;
    const image = req.body.image;

    if (!name || name.trim().length < 3) {
      return res.json({ success: false, message: 'Product name must be at least 3 characters' });
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      return res.json({ success: false, message: 'Price must be a positive number' });
    }
    if (!cid) {
      return res.json({ success: false, message: 'Category is required' });
    }

    const category = await CategoryDAO.selectByID(cid);
    if (!category) {
      return res.json({ success: false, message: 'Category not found' });
    }

    const now = new Date().getTime();
    const product = { _id: _id, name: name.trim(), price: Number(price), image: image, cdate: now, category: category };
    const result = await ProductDAO.update(product);
    if (result) {
      res.json(result);
    } else {
      res.json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

router.delete('/products/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const result = await ProductDAO.delete(_id);
    if (result) {
      res.json(result);
    } else {
      res.json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

module.exports = router;
