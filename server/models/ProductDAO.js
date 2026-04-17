const Models = require("./Models");

function slugifyVietnamese(str) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  return str.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const ProductDAO = {
  async selectByCount() {
    const query = {};
    const noProducts = await Models.Product.countDocuments(query).exec();
    return noProducts;
  },

  async selectAll() {
    const products = await Models.Product.find({}).exec();
    return products;
  },

  async selectBySkipLimit(skip, limit) {
    const products = await Models.Product.find({})
      .skip(skip)
      .limit(limit)
      .exec();
    return products;
  },

  async insert(product) {
    const mongoose = require("mongoose");
    product._id = new mongoose.Types.ObjectId();
    if (!product.slug) {
      product.slug = slugifyVietnamese(product.name);
    }
    if (!product.image && Array.isArray(product.images) && product.images.length > 0) {
      product.image = product.images[0];
    }
    if (product.stock === undefined || product.stock === null) {
      product.stock = 0;
    }
    if (!product.status) {
      product.status = product.stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
    }
    const result = await Models.Product.create(product);
    return result;
  },

  async selectByID(_id) {
    const product = await Models.Product.findById(_id).exec();
    return product;
  },
  async selectBySlug(slug) {
    const product = await Models.Product.findOne({ slug: slug }).exec();
    return product;
  },

  async update(product) {
    const newvalues = {
      name: product.name,
      price: product.price,
      category: product.category,
      slug: slugifyVietnamese(product.name),
      description: product.description || '',
      discount: Number(product.discount) || 0,
    };

    if (product.images !== undefined) {
      newvalues.images = Array.isArray(product.images) ? product.images : [];
      if (!product.image && newvalues.images.length > 0) {
        newvalues.image = newvalues.images[0];
      }
    }

    if (product.image !== undefined) {
      newvalues.image = product.image;
    }

    if (product.stock !== undefined) {
      newvalues.stock = Number(product.stock) || 0;
    }

    if (product.status !== undefined) {
      newvalues.status = product.status;
      if (product.status === 'OUT_OF_STOCK') {
        newvalues.stock = 0;
      }
    }

    const result = await Models.Product.findByIdAndUpdate(
      product._id,
      newvalues,
      { new: true },
    );

    return result;
  },

  async delete(_id) {
    const result = await Models.Product.findByIdAndDelete(_id);
    return result;
  },

  async selectTopNew(top) {
    const query = {};
    const mysort = { cdate: -1 }; // descending
    const products = await Models.Product.find(query).sort(mysort).limit(top).exec();
    return products;
  },

  async selectTopHot(top) {
    const items = await Models.Order.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
      { $sort: { sum: -1 } }, // descending
      { $limit: top }
    ]).exec();

    var products = [];
    for (const item of items) {
      const product = await ProductDAO.selectByID(item._id);
      if (product) products.push(product);
    }
    return products;
  },
   async selectByCatID(_cid) {
    const query = { 'category._id': _cid };
    const products = await Models.Product.find(query).exec();
    return products;
  },
  async selectByKeyword(keyword) {
    const query = { name: { $regex: new RegExp(keyword, 'i') } };
    const products = await Models.Product.find(query).exec();
    return products;
  }
};

module.exports = ProductDAO;
