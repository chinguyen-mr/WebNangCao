const Models = require('./Models');
const mongoose = require('mongoose');

const TestimonialDAO = {
  async selectAll() {
    const list = await Models.Testimonial.find().sort({ order: 1, _id: -1 }).exec();
    return list;
  },

  async selectActive() {
    const list = await Models.Testimonial.find({ active: true }).sort({ order: 1, _id: -1 }).exec();
    return list;
  },

  async insert(item) {
    item._id = new mongoose.Types.ObjectId();
    const result = await Models.Testimonial.create(item);
    return result;
  },

  async update(item) {
    const newvalues = {
      text: item.text,
      author: item.author,
      role: item.role,
      active: item.active,
      order: item.order
    };
    const result = await Models.Testimonial.findByIdAndUpdate(item._id, newvalues, { new: true });
    return result;
  },

  async delete(_id) {
    const result = await Models.Testimonial.findByIdAndDelete(_id);
    return result;
  }
};

module.exports = TestimonialDAO;
