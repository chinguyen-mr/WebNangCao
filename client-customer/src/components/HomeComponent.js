import React, { Component } from 'react';
import HeroBanner from './HeroBannerComponent';
import FeaturedCategories from './FeaturedCategoriesComponent';
import FeaturedProducts from './FeaturedProductsComponent';
import CraftsmanshipComponent from './CraftsmanshipComponent';
import BrandStory from './BrandStoryComponent';
import TestimonialsComponent from './TestimonialsComponent';
import SeoUtil from '../utils/SeoUtil';

/**
 * HomeComponent - Main landing page orchestrator
 * Displays: Hero Banner, Featured Categories, Featured Products, Craftsmanship, Brand Story, Testimonials
 * Follows luxury agarwood theme with responsive layout - 8 section editorial design
 */
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    SeoUtil.updatePageMeta({
      title: 'Trầm Tịnh - Trang chủ',
      description: 'Khám phá trầm hương cao cấp, sản phẩm thủ công và dịch vụ tư vấn từ Trầm Tịnh. Trang chủ giới thiệu bộ sưu tập, danh mục và sản phẩm nổi bật.',
    });
  }

  render() {
    return (
      <div className="home-page">
        {/* Hero Banner Section */}
        <HeroBanner />

        {/* Featured Categories Section */}
        <FeaturedCategories />

        {/* Featured Products Section */}
        <FeaturedProducts />

        {/* Craftsmanship Section (NEW) */}
        <CraftsmanshipComponent />

        {/* Brand Story Section */}
        <BrandStory />

        {/* Testimonials Section (NEW) */}
        <TestimonialsComponent />
      </div>
    );
  }
}

export default Home;