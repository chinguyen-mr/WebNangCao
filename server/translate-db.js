require('./utils/MongooseUtil');
const Models = require('./models/Models');

// Translation mappings
const categoryTranslations = {
  'Premium Agarwood': 'Trầm Hương Cao Cấp',
  'Agarwood Incense': 'Trầm Hương Hương',
  'Agarwood Oil': 'Dầu Trầm Hương',
  'Agarwood Jewelry': 'Trang Sức Trầm Hương',
  'Agarwood Carvings': 'Điêu Khắc Trầm Hương',
  'Agarwood Tea': 'Trà Trầm Hương'
};

const productTranslations = {
  'Vietnamese Super Grade Agarwood': 'Trầm Hương Việt Nam Siêu Cao Cấp',
  'Malaysian Wild Agarwood Chunk': 'Khối Trầm Hương Rừng Malaysia',
  'Indonesian Grade A Agarwood': 'Trầm Hương Indonesia Hạng A',
  'Pure Agarwood Incense Sticks': 'Que Hương Trầm Hương Nguyên Chất',
  'Agarwood Incense Cones': 'Nón Hương Trầm Hương',
  'Agarwood Powder for Burning': 'Bột Trầm Hương Để Đốt',
  'Pure Agarwood Essential Oil': 'Dầu Trầm Hương Nguyên Chất',
  'Agarwood Hydrosol': 'Nước Hoa Trầm Hương',
  'Agarwood Bead Bracelet': 'Vòng Tay Hạt Trầm Hương',
  'Agarwood Pendant Necklace': 'Dây Chuyền Trầm Hương',
  'Agarwood Buddha Statue': 'Tượng Phật Trầm Hương',
  'Agarwood Name Seal': 'Con Dấu Tên Trầm Hương',
  'Premium Agarwood Tea Blend': 'Trà Trầm Hương Cao Cấp',
  'Agarwood Tea Sampler Set': 'Bộ Mẫu Trà Trầm Hương'
};

const descriptionTranslations = {
  'Exceptional Vietnamese agarwood with intense, complex aroma. This cao cấp grade features deep resin saturation and a fragrance that evolves beautifully over time. Perfect for connoisseurs seeking the ultimate agarwood experience.': 'Trầm hương Việt Nam đặc biệt với hương thơm mạnh mẽ, phức tạp. Hạng cao cấp này có độ bão hòa nhựa sâu và hương thơm phát triển đẹp theo thời gian. Hoàn hảo cho những người sành seeking trải nghiệm trầm hương tối thượng.',
  'Rare Malaysian wild agarwood harvested from ancient trees. Known for its sweet, woody aroma with hints of dark chocolate and spice. A true collector\'s piece with exceptional quality.': 'Trầm hương rừng Malaysia quý hiếm thu hoạch từ cây cổ thụ. Nổi tiếng với hương thơm ngọt ngào, gỗ với gợi ý sô cô la đen và gia vị. Một món đồ sưu tầm thực sự với chất lượng đặc biệt.',
  'Premium Indonesian agarwood with unparalleled purity and fragrance intensity. This Grade A selection offers a sophisticated blend of sweet, woody, and balsamic notes that deepen with age.': 'Trầm hương Indonesia cao cấp với độ tinh khiết và cường độ hương thơm vô song. Lựa chọn Hạng A này cung cấp sự pha trộn tinh tế của các nốt ngọt ngào, gỗ và balsamic sâu sắc theo tuổi tác.',
  'Handcrafted incense sticks made from 100% pure agarwood powder. Each stick burns for 45-60 minutes, releasing a serene, meditative aroma that promotes relaxation and spiritual well-being.': 'Que hương thủ công làm từ bột trầm hương nguyên chất 100%. Mỗi que cháy trong 45-60 phút, giải phóng hương thơm thanh bình, thiền định thúc đẩy sự thư giãn và sức khỏe tinh thần.',
  'Traditional incense cones crafted from cao cấp agarwood resin. These cones produce a clean, lingering smoke with therapeutic properties. Perfect for meditation and aromatherapy practices.': 'Nón hương truyền thống được chế tác từ nhựa trầm hương cao cấp. Những nón này tạo ra khói sạch, kéo dài với các đặc tính trị liệu. Hoàn hảo cho thiền và thực hành aromatherapy.',
  'Finely ground cao cấp agarwood powder for traditional burning ceremonies. This authentic powder releases the purest essence of agarwood, creating an atmosphere of tranquility and spiritual connection.': 'Bột trầm hương cao cấp được xay nhuyễn cho các nghi lễ đốt truyền thống. Bột authentic này giải phóng tinh chất tinh khiết nhất của trầm hương, tạo ra bầu không khí yên bình và kết nối tinh thần.',
  'Distilled from the finest agarwood resin, this essential oil captures the complete aromatic profile. Use for aromatherapy, perfumery, or as a base for custom fragrances. Highly concentrated and therapeutic.': 'Chưng cất từ nhựa trầm hương tinh nhất, dầu essential này nắm bắt hồ sơ hương thơm hoàn chỉnh. Sử dụng cho aromatherapy, perfumery, hoặc làm cơ sở cho hương thơm tùy chỉnh. Cao tập trung và trị liệu.',
  'Gentle agarwood hydrosol, perfect for daily use. This floral water captures the subtle, refined notes of agarwood without the intensity of essential oil. Ideal for skin care and light aromatherapy.': 'Nước hoa trầm hương nhẹ nhàng, hoàn hảo cho sử dụng hàng ngày. Nước hoa này nắm bắt các nốt tinh tế, tinh tế của trầm hương mà không có cường độ của dầu essential. Lý tưởng cho chăm sóc da và aromatherapy nhẹ.',
  'Handcrafted bracelet featuring genuine agarwood beads. Each bead is individually selected for its fragrance and polished to perfection. A sophisticated accessory that combines beauty with natural aromatherapy.': 'Vòng tay thủ công với hạt trầm hương genuine. Mỗi hạt được chọn riêng cho hương thơm và đánh bóng đến hoàn hảo. Một phụ kiện tinh tế kết hợp vẻ đẹp với aromatherapy tự nhiên.',
  'Elegant pendant necklace with a solid agarwood centerpiece. The natural grain patterns and subtle fragrance make this piece both a fashion statement and a personal wellness accessory.': 'Dây chuyền pendant thanh lịch với centerpiece trầm hương solid. Các mẫu hạt tự nhiên và hương thơm tinh tế làm cho món đồ này cả một tuyên bố thời trang và phụ kiện sức khỏe cá nhân.',
  'Intricately carved Buddha statue from cao cấp agarwood. This sacred piece combines spiritual significance with the therapeutic benefits of agarwood fragrance. A centerpiece for meditation spaces.': 'Tượng Phật được điêu khắc tinh xảo từ trầm hương cao cấp. Món đồ thiêng liêng này kết hợp ý nghĩa tinh thần với lợi ích trị liệu của hương trầm hương. Một centerpiece cho không gian thiền.',
  'Traditional Chinese name seal carved from high-grade agarwood. Custom engraved with your name in both English and Chinese characters. A unique, fragrant personal artifact.': 'Con dấu tên Trung Quốc truyền thống được khắc từ trầm hương cao cấp. Khắc tùy chỉnh với tên của bạn bằng cả ký tự tiếng Anh và Trung Quốc. Một artifact cá nhân độc đáo, thơm.',
  'Exquisite blend of agarwood-infused tea leaves. This cao cấp tea combines the subtle, woody notes of agarwood with traditional tea varieties for a unique and sophisticated drinking experience.': 'Sự pha trộn tinh tế của lá trà được truyền hương trầm hương. Trà cao cấp này kết hợp các nốt gỗ tinh tế của trầm hương với các loại trà truyền thống cho trải nghiệm uống độc đáo và tinh tế.',
  'Curated collection of three distinct agarwood tea blends. Each tea showcases different aspects of agarwood\'s complex flavor profile. Perfect for exploring the culinary dimensions of this precious wood.': 'Bộ sưu tập curated của ba loại trà trầm hương riêng biệt. Mỗi trà giới thiệu các khía cạnh khác nhau của hồ sơ hương vị phức tạp của trầm hương. Hoàn hảo để khám phá các chiều culinary của gỗ quý này.'
};

const statusTranslations = {
  'PENDING': 'Đang xử lý',
  'APPROVED': 'Đã duyệt',
  'COMPLETED': 'Hoàn thành',
  'CANCELLED': 'Đã hủy',
  'CANCELED': 'Đã hủy' // Handle both spellings
};

async function translateCategories() {
  console.log('Translating categories...');
  const categories = await Models.Category.find({});

  for (const category of categories) {
    const translatedName = categoryTranslations[category.name] || category.name;
    if (translatedName !== category.name) {
      await Models.Category.findByIdAndUpdate(category._id, { name: translatedName });
      console.log(`Translated category: ${category.name} -> ${translatedName}`);
    }
  }
}

async function translateProducts() {
  console.log('Translating products...');
  const products = await Models.Product.find({});

  for (const product of products) {
    const translatedName = productTranslations[product.name] || product.name;
    const translatedDescription = product.description ?
      (descriptionTranslations[product.description] || product.description) : product.description;

    if (translatedName !== product.name || translatedDescription !== product.description) {
      await Models.Product.findByIdAndUpdate(product._id, {
        name: translatedName,
        description: translatedDescription
      });
      console.log(`Translated product: ${product.name} -> ${translatedName}`);
    }
  }
}

async function translateOrderStatuses() {
  console.log('Translating order statuses...');
  const orders = await Models.Order.find({});

  for (const order of orders) {
    const translatedStatus = statusTranslations[order.status] || order.status;
    if (translatedStatus !== order.status) {
      await Models.Order.findByIdAndUpdate(order._id, { status: translatedStatus });
      console.log(`Translated order status: ${order.status} -> ${translatedStatus}`);
    }
  }
}

async function runMigration() {
  try {
    console.log('Starting Vietnamese translation migration...');

    await translateCategories();
    await translateProducts();
    await translateOrderStatuses();

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

runMigration();