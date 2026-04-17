const express = require('express');
const router = express.Router();
const Models = require('../../models/Models');

// Dynamic Sitemap Generator
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Base URLs
    const baseUrl = 'https://tramtinh.vn'; // In production, this should be the real domain
    const staticPages = [
      '',
      '/product',
      '/about',
      '/blog',
      '/contact',
      '/login',
      '/signup'
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 1. Static Pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // 2. Categories
    const categories = await Models.Category.find({}).exec();
    categories.forEach(cat => {
      const identifier = cat.slug || cat._id;
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/product/category/${identifier}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    // 3. Products
    const products = await Models.Product.find({}).exec();
    products.forEach(prod => {
      const identifier = prod.slug || prod._id;
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/product/${identifier}</loc>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.9</priority>\n';
      xml += '  </url>\n';
    });

    // 4. Blogs
    const blogs = await Models.Blog.find({ active: true }).exec();
    blogs.forEach(blog => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${blog.slug || blog._id}</loc>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).end();
  }
});

module.exports = router;
