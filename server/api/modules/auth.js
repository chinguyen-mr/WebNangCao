const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../../utils/JwtUtil');
const EmailUtil = require('../../utils/EmailUtil');
const CryptoUtil = require('../../utils/CryptoUtil');
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

    if (!username || !password || !name || !phone || !email) {
      return res.json({ success: false, message: 'Vui lòng nhập đủ thông tin' });
    }

    const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);
    if (dbCust) {
      return res.json({ success: false, message: 'Tên đăng nhập hoặc email đã tồn tại' });
    }

    const now = new Date().getTime();
    // Tạo token kích hoạt ngắn bằng MD5 (giống các acc cũ)
    const activationToken = CryptoUtil.md5(username + email + now);

    // 1. Insert với active: 0, điền sẵn token kích hoạt
    const newCust = { username, password, name, phone, email, active: 0, token: activationToken, cdate: now };
    const result = await CustomerDAO.insert(newCust);

    if (result) {
      // 2. Gửi email kích hoạt với ID + token ngắn
      try {
        await EmailUtil.send(email, result._id, activationToken);
        res.json({ success: true, message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.' });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
        res.json({ success: true, message: 'Đăng ký thành công! Không thể gửi email, vui lòng liên hệ admin để kích hoạt.' });
      }
    } else {
      res.json({ success: false, message: 'Đăng ký thất bại' });
    }
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ success: false, message: 'Đăng ký thất bại: ' + error.message });
  }
});

// Kích hoạt tài khoản bằng ID + Token từ email
router.post('/customer/active', async function (req, res) {
  try {
    const { id, token } = req.body;
    if (!id || !token) {
      return res.json({ success: false, message: 'Vui lòng nhập ID và Token' });
    }
    // Tìm theo _id và token, rồi set active = 1
    const result = await CustomerDAO.active(id, token, 1);
    if (result) {
      res.json({ success: true, message: 'Kích hoạt tài khoản thành công! Bạn có thể đăng nhập.' });
    } else {
      res.json({ success: false, message: 'ID hoặc Token không đúng. Vui lòng kiểm tra lại.' });
    }
  } catch (error) {
    console.error('Activation error:', error.message);
    res.status(500).json({ success: false, message: 'Kích hoạt thất bại' });
  }
});

// ─── TOKEN CHECK ─────────────────────────────────────────────────────────────

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token is valid', token: token });
});

module.exports = router;
