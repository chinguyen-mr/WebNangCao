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

const CategoryDAO = {
  async selectAll() {
    const categories = await Models.Category.find({}).lean().exec();
    
    // Aggregation to count products per category
    const counts = await Models.Product.aggregate([
      { $group: { _id: "$category._id", count: { $sum: 1 } } }
    ]);
    
    // Create a map for quick lookup
    const countMap = {};
    counts.forEach(c => {
      if (c._id) {
        countMap[c._id.toString()] = c.count;
      }
    });

    return categories.map(cat => ({
      ...cat,
      productCount: countMap[cat._id.toString()] || 0
    }));
  },
  async insert(category) {
    const mongoose = require("mongoose");
    category._id = new mongoose.Types.ObjectId();
    category.cdate = category.cdate || Date.now();
    if (!category.slug) {
        category.slug = slugifyVietnamese(category.name);
    }
    const result = await Models.Category.create(category);
    return result;
  },
  async update(category) {
    const newvalues = {
        name: category.name,
        slug: slugifyVietnamese(category.name)
    };
    if (category.image) {
      newvalues.image = category.image;
    }
    const result = await Models.Category.findByIdAndUpdate(
      category._id,
      newvalues,
      { new: true },
    );
    return result;
  },
  async delete(_id) {
	    const result = await Models.Category.findByIdAndDelete(_id);
	    return result;
	  },
    async selectByID(_id) {
	    const category = await Models.Category.findById(_id).exec();
	    return category;
	  },
    async selectBySlug(slug) {
	    const category = await Models.Category.findOne({ slug: slug }).exec();
	    return category;
	  },
};

module.exports = CategoryDAO;
