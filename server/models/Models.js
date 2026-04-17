const mongoose = require('mongoose');

// Schemas
const AdminSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
  },
  { versionKey: false }
);

const CategorySchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    slug: { type: String, unique: true },
    image: String,
    cdate: Number,
  },
  { versionKey: false }
);

const CustomerSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, unique: true },
    password: String,
    name: String,
    phone: String,
    email: { type: String, unique: true },
    active: Number,
    token: String,
    cart: { type: Array, default: [] },
  },
  { versionKey: false }
);

const ProductSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    image: String,
    images: { type: [String], default: [] },
    description: String,
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    status: { type: String, enum: ['IN_STOCK', 'OUT_OF_STOCK'], default: 'IN_STOCK' },
    cdate: Number,
    category: CategorySchema,
    slug: { type: String, unique: true },
  },
  { versionKey: false }
);

const ItemSchema = mongoose.Schema(
  {
    product: ProductSchema,
    quantity: Number,
  },
  {
    versionKey: false,
    _id: false,
  }
);

const OrderSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    cdate: Number,
    total: Number,
    status: String,
    customer: CustomerSchema,
    items: [ItemSchema],
    paymentMethod: String,
    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      city: String,
      district: String,
      address: String,
      note: String
    }
  },
  { versionKey: false }
);

// --- CMS SCHEMAS ---

const BannerSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    subtitle: String,
    label: String,
    image: String, // Base64 for now, will change to path in Step 11
    link: String,
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { versionKey: false }
);

const SiteContentSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    slug: { type: String, unique: true },
    body: String,
    type: { type: String, enum: ['page', 'block'], default: 'page' },
  },
  { versionKey: false }
);

const SettingsSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    key: { type: String, unique: true },
    value: mongoose.Schema.Types.Mixed,
    group: { type: String, default: 'general' },
  },
  { versionKey: false }
);

const BlogSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    slug: { type: String, unique: true },
    excerpt: String,
    content: String,
    author: String,
    image: String,
    cdate: Number,
    active: { type: Boolean, default: true },
  },
  { versionKey: false }
);

const EnquirySchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    phone: String,
    subject: String,
    message: String,
    cdate: Number,
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  },
  { versionKey: false }
);

const TestimonialSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    text: String,
    author: String,
    role: String,
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { versionKey: false }
);

// Models
const Admin = mongoose.model('Admin', AdminSchema);
const Category = mongoose.model('Category', CategorySchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// CMS Models
const Banner = mongoose.model('Banner', BannerSchema);
const SiteContent = mongoose.model('SiteContent', SiteContentSchema);
const Settings = mongoose.model('Settings', SettingsSchema);
const Blog = mongoose.model('Blog', BlogSchema);
const Enquiry = mongoose.model('Enquiry', EnquirySchema);
const Testimonial = mongoose.model('Testimonial', TestimonialSchema);

module.exports = {
  Admin,
  Category,
  Customer,
  Product,
  Order,
  Banner,
  SiteContent,
  Settings,
  Blog,
  Enquiry,
  Testimonial,
};


 