const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../../utils/JwtUtil');
const EmailUtil = require('../../utils/EmailUtil');
// daos
const CustomerDAO = require('../../models/CustomerDAO');

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────

router.get('/admin/list', JwtUtil.checkToken, async function (_req, res) {
  try {
    const customers = await CustomerDAO.selectAll();
    res.json(customers);
  } catch (error) {
    console.error('Admin customer fetch error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load customers' });
  }
});

router.put('/admin/deactive/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const id = req.params.id;
    const result = await CustomerDAO.deactivateByID(id);
    if (result) {
      res.json({ success: true, message: 'Customer deactivated', customer: result });
    } else {
      res.json({ success: false, message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Admin customer deactivation error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to deactivate customer' });
  }
});

// ─── CUSTOMER CART SYNC ──────────────────────────────────────────────────────

// Đồng bộ giỏ hàng lên MongoDB (gọi từ MyProvider.syncCartWithServer)
router.put('/cart/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const id = req.params.id;
    const { cart } = req.body;

    if (!Array.isArray(cart)) {
      return res.status(400).json({ success: false, message: 'Cart phải là mảng' });
    }

    const result = await CustomerDAO.updateCart(id, cart);
    if (result) {
      res.json({ success: true, message: 'Đồng bộ giỏ hàng thành công' });
    } else {
      res.json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
  } catch (error) {
    console.error('Cart sync error:', error.message);
    res.status(500).json({ success: false, message: 'Đồng bộ giỏ hàng thất bại' });
  }
});


router.get('/admin/sendmail/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const id = req.params.id;
    const cust = await CustomerDAO.selectByID(id);
    if (!cust) return res.json({ success: false, message: 'Customer not found' });

    try {
      await EmailUtil.send(cust.email, cust._id, cust.token);
      res.json({ success: true, message: 'Email sent' });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      res.json({ success: false, message: 'Email failure' });
    }
  } catch (error) {
    console.error('Admin sendmail error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send activation email' });
  }
});

module.exports = router;
