const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../../utils/JwtUtil');
// daos
const AdminDAO = require('../../models/AdminDAO');
const CustomerDAO = require('../../models/CustomerDAO');

// ─── ADMIN AUTH ─────────────────────────────────────────────────────────────

router.post('/admin/login', async function (req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ success: false, message: 'Please input username and password' });
    }
    const admin = await AdminDAO.selectByUsernameAndPassword(username, password);
    if (admin) {
      const token = JwtUtil.genToken(admin);
      res.json({ success: true, message: 'Authentication successful', token: token });
    } else {
      res.json({ success: false, message: 'Incorrect username or password' });
    }
  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ─── CUSTOMER AUTH ────────────────────────────────────────────────────────────

router.post('/customer/login', async function (req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ success: false, message: 'Please input username and password' });
    }
    const customer = await CustomerDAO.selectByUsernameAndPassword(username, password);
    if (customer) {
      if (customer.active === 1) {
        const token = JwtUtil.genToken(customer);
        res.json({ success: true, message: 'Authentication successful', token: token, customer: customer });
      } else {
        res.json({ success: false, message: 'Account is not active' });
      }
    } else {
      res.json({ success: false, message: 'Incorrect username or password' });
    }
  } catch (error) {
    console.error('Customer login error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/customer/signup', async function (req, res) {
  try {
    const { username, password, name, phone, email } = req.body;
    const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);
    if (dbCust) {
      res.json({ success: false, message: 'Exists username or email' });
    } else {
      const now = new Date().getTime();
      const newCust = { username, password, name, phone, email, active: 0, cdate: now };
      // Insert first to get _id
      const result = await CustomerDAO.insert(newCust);
      if (result) {
        const token = JwtUtil.genToken(result);
        await CustomerDAO.active(result._id, token, 0); // Update token in DB
        // Here we could send email if configured
        res.json({ success: true, message: 'Signup successful! Please check email to activate.' });
      } else {
        res.json({ success: false, message: 'Signup failed' });
      }
    }
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ success: false, message: 'Signup failed' });
  }
});

router.post('/customer/active', async function (req, res) {
  try {
    const { id, token } = req.body;
    const result = await CustomerDAO.active(id, token, 1);
    res.json(result);
  } catch (error) {
    console.error('Activation error:', error.message);
    res.status(500).json({ success: false, message: 'Activation failed' });
  }
});

// ─── TOKEN CHECK ─────────────────────────────────────────────────────────────

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token is valid', token: token });
});

module.exports = router;
