import axios from 'axios';
import { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';

class FeaturedProducts extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: true,
      error: null,
      addedId: null   // tracks which product was just added (brief highlight)
    };
  }

  componentDidMount() {
    this.apiGetProducts();
  }

  // Same resolution logic as HeroBanner — raw base64 needs the prefix
  resolveImage(image) {
    if (!image) return null;
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `data:image/jpeg;base64,${image}`;
  }

  stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  apiGetProducts = () => {
    axios.get('/api/product/list/new')
      .then((res) => {
        const featured = Array.isArray(res.data) ? res.data.slice(0, 8) : [];
        this.setState({ products: featured, loading: false });
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        this.setState({ error: error.message, loading: false });
      });
  };

  handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!this.context.customer) {
      window.location.href = '/login';
      return;
    }

    CartUtil.addToCart(this.context, product, 1);

    // Brief visual feedback without alert()
    this.setState({ addedId: product._id });
    setTimeout(() => this.setState({ addedId: null }), 1500);
  };

  formatPrice(price) {
    return price.toLocaleString('vi-VN') + ' ₫';
  }

  render() {
    const { products, loading, error, addedId } = this.state;

    if (loading) {
      return (
        <div className="featured-products" id="featured-products">
          <div className="loading">Đang tải bộ sưu tập...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="featured-products" id="featured-products">
          <div className="error">Không thể tải sản phẩm nổi bật</div>
        </div>
      );
    }

    return (
      <div className="featured-products" id="featured-products">
        <h2>Bộ Sưu Tập Nổi Bật</h2>

        <div className="products-grid">
          {products.map((product) => {
            const imgSrc = this.resolveImage(product.image);
            const isAdded = addedId === product._id;

            return (
              <div key={product._id} className="product-card">
                {/* Image */}
                <div className="product-image">
                  <Link to={`/product/${product.slug || product._id}`}>
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={product.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                  </Link>

                  {product.discount > 0 && (
                    <span className="product-badge">{product.discount}% OFF</span>
                  )}
                </div>

                {/* Info */}
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">
                    {this.stripHtml(product.description ||
                      `Trầm hương ${product.category?.name?.toLowerCase() || 'cao cấp'} — được tuyển chọn kỹ lưỡng`)}
                  </p>

                  <div className="product-footer">
                    <div className="product-price">
                      {this.formatPrice(product.price)}
                    </div>
                    {(() => {
                      const productStatus = product.status || 'IN_STOCK';
                      const inStock = productStatus === 'IN_STOCK' || (product.stock || 0) > 0;
                      return (
                        <button
                          className={`product-btn ${!inStock ? 'disabled-btn' : ''}`}
                          onClick={(e) => inStock && this.handleAddToCart(product, e)}
                          title={!inStock ? 'Hết hàng' : (!this.context.customer ? 'Đăng nhập để mua hàng' : 'Thêm vào giỏ')}
                          disabled={!inStock}
                          style={!inStock ? { cursor: 'not-allowed', opacity: 0.5, background: 'var(--border-color)', color: 'white' } : (isAdded ? { background: 'var(--accent-color)', color: 'var(--primary-color)' } : {})}
                        >
                          {!inStock ? 'Hết hàng' : (isAdded ? '✓ Đã thêm' : 'Thêm vào giỏ')}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="view-all-container">
          <Link to="/product" className="btn-view-all">
            Xem Tất Cả Sản Phẩm →
          </Link>
        </div>
      </div>
    );
  }
}

export default FeaturedProducts;
