require('./utils/MongooseUtil');
const Models = require('./models/Models');

async function listData() {
  try {
    console.log('Listing current database data...');

    const categories = await Models.Category.find({});
    console.log('\nCategories:');
    categories.forEach(cat => console.log(`- ${cat.name}`));

    const products = await Models.Product.find({});
    console.log('\nProducts:');
    products.forEach(prod => console.log(`- ${prod.name}: ${prod.description || 'No description'}`));

    const orders = await Models.Order.find({});
    console.log('\nOrders:');
    orders.forEach(order => console.log(`- Status: ${order.status}`));

  } catch (error) {
    console.error('Error listing data:', error);
  } finally {
    process.exit();
  }
}

listData();