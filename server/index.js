const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3007;

const rateLimit = require('express-rate-limit');
const logger = require('./utils/LoggerUtil');
const mongoose = require('mongoose');
const MyConstants = require('./utils/MyConstants');

// MongoDB connection
require('./utils/MongooseUtil');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased from 100 to 10000 to fix '429 Too Many Requests'
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Middlewares
app.use(limiter);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.resolve(__dirname, './uploads')));

// Log requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// APIs
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from server!' });
});
// Modular APIs
app.use('/api/auth', require('./api/modules/auth'));
app.use('/api/category', require('./api/modules/category'));
app.use('/api/product', require('./api/modules/product'));
app.use('/api/order', require('./api/modules/order'));
app.use('/api/customer', require('./api/modules/customer'));
app.use('/api/content', require('./api/modules/content'));
app.use('/api/settings', require('./api/modules/settings'));
app.use('/api/banner', require('./api/modules/banner'));
app.use('/api/blog', require('./api/modules/blog'));
app.use('/api/admin', require('./api/modules/admin'));
app.use('/api/seo', require('./api/modules/seo'));
app.use('/api/testimonial', require('./api/modules/testimonial'));

app.use('/admin', express.static(path.resolve(__dirname, '../client-admin/build')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client-admin/build', 'index.html'));
});
app.use('/', express.static(path.resolve(__dirname, '../client-customer/build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client-customer/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
  // Kiểm tra kết nối Gmail SMTP ngay khi khởi động
  const EmailUtil = require('./utils/EmailUtil');
  EmailUtil.verify();
});


