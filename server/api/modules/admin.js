const express = require('express');
const router = express.Router();
const Models = require('../../models/Models');
const ProductDAO = require('../../models/ProductDAO');
const JwtUtil = require('../../utils/JwtUtil');

// Helper to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (token) {
    const decoded = JwtUtil.verifyToken(token);
    if (decoded && decoded.username) {
      next();
    } else {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } else {
    res.json({ success: false, message: 'No token provided' });
  }
};

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', verifyAdmin, async (req, res) => {
  try {
    const [products, categories, customers, orders] = await Promise.all([
      ProductDAO.selectByCount(),
      Models.Category.countDocuments({}),
      Models.Customer.countDocuments({}),
      Models.Order.find({}).populate('customer').exec()
    ]);

    // Calculate Total Revenue from APPROVED orders
    const totalRevenue = orders
      .filter(order => order.status === 'APPROVED')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    // Get Top 5 Recent Orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.cdate) - new Date(a.cdate))
      .slice(0, 5);

    res.json({
      success: true,
      counts: {
        products,
        categories,
        customers,
        orders: orders.length
      },
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
