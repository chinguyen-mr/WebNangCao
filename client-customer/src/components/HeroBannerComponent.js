import axios from 'axios';
import { Component } from 'react';
import { Link } from 'react-router-dom';
import CmsService from '../services/CmsService';

class HeroBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      banners: [],
      featuredProduct: null,
      loading: true,
      imgError: false
    };
  }

  componentDidMount() {
    this.loadHeroData();
  }

  async loadHeroData() {
    this.setState({ loading: true });
    try {
      const banners = await CmsService.getBanners();
      if (Array.isArray(banners) && banners.length > 0) {
        this.setState({ banners, loading: false });
      } else {
        // Fallback to newest product if no banners
        this.apiGetNewestProducts();
      }
    } catch (error) {
      this.apiGetNewestProducts();
    }
  }

  // Resolve any stored image value to a usable src string.
  resolveImage(image) {
    if (!image) return null;
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `data:image/jpeg;base64,${image}`;
  }

  apiGetNewestProducts = () => {
    axios.get('/api/customer/products/new')
      .then((res) => {
        const products = res.data;
        if (Array.isArray(products) && products.length > 0) {
          this.setState({ featuredProduct: products[0], loading: false });
        } else {
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { banners, featuredProduct, loading, imgError } = this.state;
    
    // Determine content source
    let displayData = null;
    if (banners.length > 0) {
      displayData = {
        label: banners[0].label || 'BỘ SƯU TẬP MỚI',
        title: banners[0].title,
        subtitle: banners[0].subtitle,
        link: banners[0].link || '/product',
        image: banners[0].image
      };
    } else if (featuredProduct) {
      displayData = {
        label: 'SẢN PHẨM MỚI NHẤT',
        title: featuredProduct.name,
        subtitle: 'Khám phá tuyệt tác trầm hương vừa ra mắt trong bộ sưu tập thượng hạng của chúng tôi.',
        link: `/product/${featuredProduct._id}`,
        image: featuredProduct.image
      };
    }

    const imgSrc = !loading && !imgError && displayData
      ? this.resolveImage(displayData.image)
      : null;

    if (loading && !displayData) return <div className="hero-banner loading"></div>;

    return (
      <div className="hero-banner">
        <div className="hero-wrapper">
          {/* Left: text content */}
          <div className="hero-content">
            <span className="hero-label">{displayData?.label || 'Trầm Tịnh Premium'}</span>
            <h1>{displayData?.title || 'Khám Phá Trầm Hương Thượng Hạng'}</h1>
            <p>
              {displayData?.subtitle || 'Đắm chìm trong những sản phẩm trầm hương được tuyển chọn kỹ lưỡng. Trải nghiệm nghệ thuật xa hoa trong từng hơi thở.'}
            </p>
            <div className="hero-buttons">
              <Link to={displayData?.link || "/product"} style={{ textDecoration: 'none' }}>
                <button className="hero-btn">Khám Phá Ngay</button>
              </Link>
              <a href="#featured-products" style={{ textDecoration: 'none' }}>
                <button className="hero-btn outline">Sản Phẩm Nổi Bật</button>
              </a>
            </div>
          </div>

          {/* Right: image panel */}
          <div className="hero-image">
            <div className="hero-image-wrapper">
              <div className="hero-img-brand">
                <span>Trầm Tịnh</span>
                <small>Premium Agarwood</small>
              </div>

              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={displayData?.title}
                  onError={() => this.setState({ imgError: true })}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HeroBanner;
