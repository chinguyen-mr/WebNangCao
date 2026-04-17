const express = require("express");
const router = express.Router();

// utils
const CryptoUtil = require("../utils/CryptoUtil");
const EmailUtil = require("../utils/EmailUtil");
const JwtUtil = require('../utils/JwtUtil');
// daos
const CategoryDAO = require("../models/CategoryDAO");
const ProductDAO = require("../models/ProductDAO");
const OrderDAO = require('../models/OrderDAO');

const CustomerDAO = require("../models/CustomerDAO");

// category
router.get("/categories", async function (req, res) {
  try {
    const categories = await CategoryDAO.selectAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
});

// product
router.get("/products", async function (req, res) {
  try {
    const products = await ProductDAO.selectAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
});

router.get("/products/new", async function (req, res) {
  try {
    const products = await ProductDAO.selectTopNew(3);
    res.json(products);
  } catch (error) {
    console.error('Error fetching new products:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load new products' });
  }
});

router.get("/products/hot", async function (req, res) {
  try {
    const products = await ProductDAO.selectTopHot(3);
    res.json(products);
  } catch (error) {
    console.error('Error fetching hot products:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load hot products' });
  }
});

router.get("/products/category/:cid", async function (req, res) {
  try {
    const _cid = req.params.cid;
    const products = await ProductDAO.selectByCatID(_cid);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
});

router.get("/products/search/:keyword", async function (req, res) {
  try {
    const keyword = req.params.keyword;
    const products = await ProductDAO.selectByKeyword(keyword);
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error.message);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

router.get("/products/:id", async function (req, res) {
  try {
    const _id = req.params.id;
    const product = await ProductDAO.selectByID(_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load product' });
  }
});

// customer
router.post('/signup', async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;

    // input validation
    if (!username || !password || !name || !phone || !email) {
      return res.json({ success: false, message: 'Please fill in all required fields' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ success: false, message: 'Invalid email format' });
    }
    if (password.length < 3) {
      return res.json({ success: false, message: 'Password must be at least 3 characters' });
    }

    const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);
    if (dbCust) {
      return res.json({ success: false, message: 'Exists username or email' });
    }

    const now = new Date().getTime();
    const token = CryptoUtil.md5(now.toString());
    const newCust = { username, password, name, phone, email, active: 0, token };

    const result = await CustomerDAO.insert(newCust);
    if (!result) {
      return res.json({ success: false, message: 'Insert failure' });
    }

    try {
      await EmailUtil.send(email, result._id, token);
      res.json({ success: true, message: 'Please check email' });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Account was created — still report success but warn about email
      res.json({ success: true, message: 'Account created but email could not be sent. Contact support.' });
    }
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ success: false, message: 'Signup failed' });
  }
});

router.post("/active", async function (req, res) {
  try {
    const _id = req.body.id;
    const token = req.body.token;

    if (!_id || !token) {
      return res.json({ success: false, message: 'Missing id or token' });
    }

    const result = await CustomerDAO.active(_id, token, 1);
    if (result) {
      res.json({ success: true, message: 'Account activated', customer: result });
    } else {
      res.json({ success: false, message: 'Invalid activation credentials' });
    }
  } catch (error) {
    console.error('Error during activation:', error.message);
    res.status(500).json({ success: false, message: 'Activation failed' });
  }
});

router.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const customer = await CustomerDAO.selectByUsernameAndPassword(
      username,
      password,
    );

    if (customer) {
      if (customer.active === 1) {
        const token = JwtUtil.genToken(username, password);

        res.json({
          success: true,
          message: "Authentication successful",
          token: token,
          customer: customer,
        });
      } else {
        res.json({ success: false, message: "Account is deactive" });
      }
    } else {
      res.json({ success: false, message: "Incorrect username or password" });
    }
  } else {
    res.json({ success: false, message: "Please input username and password" });
  }
});

router.get("/token", JwtUtil.checkToken, function (req, res) {
  const token = req.headers["x-access-token"] || req.headers["authorization"];

  res.json({
    success: true,
    message: "Token is valid",
    token: token,
  });
});

// myprofile
router.put('/customers/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;

    const customer = {
      _id: _id,
      username: username,
      password: password,
      name: name,
      phone: phone,
      email: email
    };

    const result = await CustomerDAO.update(customer);
    if (result) {
      res.json({ success: true, message: 'Profile updated', customer: result });
    } else {
      res.status(400).json({ success: false, message: 'Update failed' });
    }
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// mycart sync
router.put('/cart/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const cart = req.body.cart;

    if (!Array.isArray(cart)) {
      return res.status(400).json({ success: false, message: 'Invalid cart format' });
    }

    const result = await CustomerDAO.updateCart(_id, cart);
    if (result) {
      res.json({ success: true, message: 'Cart synced', cart: result.cart });
    } else {
      res.status(400).json({ success: false, message: 'Cart sync failed' });
    }
  } catch (error) {
    console.error('Error syncing cart:', error.message);
    res.status(500).json({ success: false, message: 'Failed to sync cart' });
  }
});

// checkout
router.post('/checkout', JwtUtil.checkToken, async function (req, res) {
  try {
    const now = new Date().getTime();
    const total = req.body.total;
    const items = req.body.items;
    const customer = req.body.customer;

    if (!total || !items || !customer) {
      return res.status(400).json({ success: false, message: 'Missing checkout data' });
    }

    const order = {
      cdate: now,
      total: total,
      status: 'PENDING',
      customer: customer,
      items: items
    };

    const result = await OrderDAO.insert(order);
    if (result) {
      res.json({ success: true, message: 'Order created', order: result });
    } else {
      res.status(400).json({ success: false, message: 'Checkout failed' });
    }
  } catch (error) {
    console.error('Error during checkout:', error.message);
    res.status(500).json({ success: false, message: 'Checkout failed' });
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
module.exports = router;
