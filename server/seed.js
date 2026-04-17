const mongoose = require('mongoose');
const Models = require('./models/Models');
require('./utils/MongooseUtil');

const seedData = async () => {
  try {
    // Clear existing data
    await Models.Product.deleteMany({});
    await Models.Category.deleteMany({});

    // Create categories
    const categories = [
      { _id: new mongoose.Types.ObjectId(), name: 'Premium Agarwood' },
      { _id: new mongoose.Types.ObjectId(), name: 'Agarwood Incense' },
      { _id: new mongoose.Types.ObjectId(), name: 'Agarwood Oil' },
      { _id: new mongoose.Types.ObjectId(), name: 'Agarwood Jewelry' },
      { _id: new mongoose.Types.ObjectId(), name: 'Agarwood Carvings' },
      { _id: new mongoose.Types.ObjectId(), name: 'Agarwood Tea' }
    ];

    await Models.Category.insertMany(categories);
    console.log('Categories created successfully');

    // Create products
    const products = [
      // Premium Agarwood
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Vietnamese Super Grade Agarwood',
        price: 25000000,
        image: '/images/agarwood-super-grade.jpg',
        description: 'Exceptional Vietnamese agarwood with intense, complex aroma. This premium grade features deep resin saturation and a fragrance that evolves beautifully over time. Perfect for connoisseurs seeking the ultimate agarwood experience.',
        discount: 0,
        cdate: Date.now(),
        category: categories[0]
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Malaysian Wild Agarwood Chunk',
        price: 18500000,
        image: '/images/agarwood-malaysian.jpg',
        description: 'Rare Malaysian wild agarwood harvested from ancient trees. Known for its sweet, woody aroma with hints of dark chocolate and spice. A true collector\'s piece with exceptional quality.',
        discount: 5,
        cdate: Date.now(),
        category: categories[0]
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Indonesian Grade A Agarwood',
        price: 32000000,
        image: '/images/agarwood-indonesian.jpg',
        description: 'Premium Indonesian agarwood with unparalleled purity and fragrance intensity. This Grade A selection offers a sophisticated blend of sweet, woody, and balsamic notes that deepen with age.',
        discount: 0,
        cdate: Date.now(),
        category: categories[0]
      },

      // Agarwood Incense
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Pure Agarwood Incense Sticks',
        price: 450000,
        image: '/images/incense-sticks.jpg',
        description: 'Handcrafted incense sticks made from 100% pure agarwood powder. Each stick burns for 45-60 minutes, releasing a serene, meditative aroma that promotes relaxation and spiritual well-being.',
        discount: 10,
        cdate: Date.now(),
        category: categories[1]
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Agarwood Incense Cones',
        price: 380000,
        image: '/images/incense-cones.jpg',
        description: 'Traditional incense cones crafted from premium agarwood resin. These cones produce a clean, lingering smoke with therapeutic properties. Perfect for meditation and aromatherapy practices.',
        discount: 0,
        cdate: Date.now(),
        category: categories[1]
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Agarwood Powder for Burning',
        price: 650000,
        image: '/images/agarwood-powder.jpg',
        description: 'Finely ground premium agarwood powder for traditional burning ceremonies. This authentic powder releases the purest essence of agarwood, creating an atmosphere of tranquility and spiritual connection.',
        discount: 15,
        cdate: Date.now(),
        category: categories[1]
      },

      // Agarwood Oil
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Pure Agarwood Essential Oil',
        price: 1250000,
        image: '/images/agarwood-oil.jpg',
        description: 'Distilled from the finest agarwood resin, this essential oil captures the complete aromatic profile. Use for aromatherapy, perfumery, or as a base for custom fragrances. Highly concentrated and therapeutic.',
        discount: 0,
        cdate: Date.now(),
        category: categories[2]
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Agarwood Hydrosol',
        price: 750000,
        image: '/images/agarwood-hydrosol.jpg',
        description: 'Gentle agarwood hydrosol, perfect for daily use. This floral water captures the subtle, refined notes of agarwood without the intensity of essential oil. Ideal for skin care and light aromatherapy.',
        discount: 8,
        cdate: Date.now(),
        category: categories[2]
      },

      // Agarwood Jewelry
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Agarwood Bead Bracelet',
        price: 2850000,
        image: '/images/agarwood-bracelet.jpg',
        description: 'Handcrafted bracelet featuring genuine agarwood beads. Each bead is individually selected for its fragrance and polished to perfection. A sophisticated accessory that combines beauty with natural aromatherapy.',
        discount: 0,
        cdate: Date.now(),
        category: categories[3]
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Agarwood Pendant Necklace',
        price: 4200000,
        image: '/images/agarwood-pendant.jpg',
        description: 'Elegant pendant necklace with a solid agarwood centerpiece. The natural grain patterns and subtle fragrance make this piece both a fashion statement and a personal wellness accessory.',
        discount: 12,
        cdate: Date.now(),
        category: categories[3]
      },

      // Agarwood Carvings
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Agarwood Buddha Statue',
        price: 8500000,
        image: '/images/agarwood-buddha.jpg',
        description: 'Intricately carved Buddha statue from premium agarwood. This sacred piece combines spiritual significance with the therapeutic benefits of agarwood fragrance. A centerpiece for meditation spaces.',
        discount: 0,
        cdate: Date.now(),
        category: categories[4]
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Agarwood Name Seal',
        price: 3200000,
        image: '/images/agarwood-seal.jpg',
        description: 'Traditional Chinese name seal carved from high-grade agarwood. Custom engraved with your name in both English and Chinese characters. A unique, fragrant personal artifact.',
        discount: 5,
        cdate: Date.now(),
        category: categories[4]
      },

      // Agarwood Tea
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Premium Agarwood Tea Blend',
        price: 280000,
        image: '/images/agarwood-tea.jpg',
        description: 'Exquisite blend of agarwood-infused tea leaves. This premium tea combines the subtle, woody notes of agarwood with traditional tea varieties for a unique and sophisticated drinking experience.',
        discount: 0,
        cdate: Date.now(),
        category: categories[5]
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Agarwood Tea Sampler Set',
        price: 650000,
        image: '/images/agarwood-tea-set.jpg',
        description: 'Curated collection of three distinct agarwood tea blends. Each tea showcases different aspects of agarwood\'s complex flavor profile. Perfect for exploring the culinary dimensions of this precious wood.',
        discount: 18,
        cdate: Date.now(),
        category: categories[5]
      }
    ];

    await Models.Product.insertMany(products);
    console.log('Products created successfully');

    console.log('Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();