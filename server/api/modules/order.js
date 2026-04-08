const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../../utils/JwtUtil');
// daos
const OrderDAO = require('../../models/OrderDAO');

// ─── CUSTOMER ROUTES ────────────────────────────────────────────────────────

router.post('/checkout', JwtUtil.checkToken, async function (req, res) {
  try {
    const { total, items, customer, paymentMethod, shippingAddress } = req.body;
    const now = new Date().getTime();
    
    // Extract customer info from the decoded token (placed by JwtUtil.checkToken)
    const decoded = req.decoded;
    if (!decoded || !decoded._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const order = { 
      cdate: now, 
      total, 
      status: paymentMethod === 'cashOnDelivery' ? 'PENDING' : 'APPROVED', 
      customer: {
        _id: decoded._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }, 
      items,
      paymentMethod,
      shippingAddress
    };
    
    const result = await OrderDAO.insert(order);
    
    // TỰ ĐỘNG TRỪ SỐ LƯỢNG KHO (INVENTORY DEDUCTION)
    const Models = require('../../models/Models');
    for (const item of items) {
      if (item.product && item.product._id) {
        // Trừ stock
        const updatedProduct = await Models.Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: -item.quantity } },
          { new: true } // Return updated doc
        );
        // Tự động hết hàng nếu rớt xuống 0
        if (updatedProduct && updatedProduct.stock <= 0) {
           await Models.Product.findByIdAndUpdate(
             item.product._id, 
             { status: 'OUT_OF_STOCK', stock: 0 }
           );
        }
      }
    }

    res.json({ success: true, ...result._doc });
  } catch (error) {
    console.error('Checkout error:', error.message);
    res.status(500).json({ success: false, message: 'Checkout failed' });
  }
});

router.get('/customer/history/:cid', JwtUtil.checkToken, async function (req, res) {
  try {
    const cid = req.params.cid;
    const orders = await OrderDAO.selectByCustID(cid);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load order history' });
  }
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────

router.get('/admin/list', JwtUtil.checkToken, async function (_req, res) {
  try {
    const orders = await OrderDAO.selectAll();
    res.json(orders);
  } catch (error) {
    console.error('Admin order fetch error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
});

router.put('/admin/status/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const VALID_STATUSES = ['PENDING', 'APPROVED', 'CANCELED'];
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.json({ success: false, message: 'Invalid status' });
    }
    const result = await OrderDAO.update(id, status);
    if (result) {
      res.json(result);
    } else {
      res.json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    console.error('Admin order status update error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

router.get('/admin/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  try {
    const cid = req.params.cid;
    const orders = await OrderDAO.selectByCustID(cid);
    res.json(orders);
  } catch (error) {
    console.error('Admin fetching customer orders error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
});

module.exports = router;
