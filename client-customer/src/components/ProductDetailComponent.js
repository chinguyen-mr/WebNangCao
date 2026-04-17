import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import vi from '../lang/vi';
import SeoUtil from '../utils/SeoUtil';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      product: null,
      loading: true,
      error: null,
      txtQuantity: 1,
      relatedProducts: [],
      activeImageIndex: 0,
      addToCartSuccess: false,
      addToCartMessage: ''
    };
  }

  componentDidMount() {
    this.apiGetProduct();
    SeoUtil.updatePageMeta({
      title: vi.productAgarwoodTitle,
      description: vi.productDetailMetaDesc,
    });
  }

  componentDidUpdate(prevProps) {
    const params = this.props.params;
    const prevParams = prevProps.params;

    if (params.id !== prevParams.id) {
      this.apiGetProduct();
    }
  }

  updatePageSeo = (product) => {
    const title = product
      ? `${this.safeValue(product, 'name', 'Sản phẩm')} | Trầm Tịnh`
      : vi.productAgarwoodTitle;
    const description = product
      ? this.safeValue(product, 'description', 'Khám phá chi tiết sản phẩm trầm hương cao cấp với chất lượng và nguồn gốc rõ ràng.')
      : vi.productDetailMetaDesc;

    SeoUtil.updatePageMeta({ title, description });
  };

  // Safe data access helpers
  safeValue = (obj, path, defaultValue = '') => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  formatVND = (price) => {
    if (!price || isNaN(price)) return vi.contactForPrice;
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
  };

  resolveImage = (image) => {
    if (!image) return null;
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/')) {
      return `${process.env.REACT_APP_API_URL || ''}${image}`;
    }
    if (image.length > 100 && /^[A-Za-z0-9+/=]+$/.test(image)) {
      return `data:image/jpeg;base64,${image}`;
    }
    return null;
  };

  apiGetProduct = () => {
    const id = this.props.params.id;
    this.setState({ loading: true, error: null });

    axios.get(`/api/product/detail/${id}`)
      .then((res) => {
        const product = res.data;
        if (!product) {
          throw new Error('Product not found');
        }
        this.setState({ product, loading: false, activeImageIndex: 0 }, () => {
          this.updatePageSeo(product);
        });
        this.apiGetRelatedProducts(this.safeValue(product, 'category._id'), id);
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
        this.setState({
          error: error.message || 'Failed to load product',
          loading: false
        });
      });
  };

  apiGetRelatedProducts = (categoryId, productId) => {
    if (!categoryId) return;

    axios.get('/api/product/list/new')
      .then((res) => {
        const products = Array.isArray(res.data) ? res.data : [];
        const related = products
          .filter(p => this.safeValue(p, 'category._id') === categoryId && p._id !== productId)
          .slice(0, 4);
        this.setState({ relatedProducts: related });
      })
      .catch((error) => {
        console.error('Error fetching related products:', error);
      });
  };

  handleQuantityChange = (delta) => {
    this.setState(prevState => {
      const maxStock = prevState.product?.stock || 99;
      const newQty = prevState.txtQuantity + delta;
      return {
        txtQuantity: Math.min(maxStock, Math.max(1, newQty))
      };
    });
  };

  handleQuantityInputChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const maxStock = this.state.product?.stock || 99;
    const validValue = Math.min(maxStock, Math.max(1, value));
    this.setState({ txtQuantity: validValue });
  };

  lnkAddClick = () => {
    const { product, txtQuantity } = this.state;

    if (!product) {
      this.showMessage(vi.addToCartError, false);
      return;
    }

    if (!this.context.customer) {
      this.props.navigate('/login');
      return;
    }

    try {
      CartUtil.addToCart(this.context, product, parseInt(txtQuantity));
      this.showMessage(vi.addedToCart.replace('{count}', txtQuantity), true);
      this.setState({ txtQuantity: 1 });
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showMessage(vi.addToCartError, false);
    }
  };

  btnBuyNowClick = () => {
    const { product, txtQuantity } = this.state;

    if (!product) {
      this.showMessage(vi.addToCartError, false);
      return;
    }

    if (!this.context.customer) {
      this.props.navigate('/login');
      return;
    }

    try {
      CartUtil.addToCart(this.context, product, parseInt(txtQuantity));
      this.props.navigate('/mycart');
    } catch (error) {
      console.error('Error buying now:', error);
      this.showMessage(vi.addToCartError, false);
    }
  };

  showMessage = (message, isSuccess) => {
    this.setState({
      addToCartSuccess: isSuccess,
      addToCartMessage: message
    });

    setTimeout(() => {
      this.setState({ addToCartMessage: '' });
    }, 3000);
  };

  render() {
    const {
      product,
      loading,
      error,
      txtQuantity,
      relatedProducts,
      addToCartMessage,
      addToCartSuccess
    } = this.state;

    if (loading) {
      return (
        <div className="product-detail-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{vi.loadingProducts}</p>
          </div>
        </div>
      );
    }

    if (error || !product) {
      return (
        <div className="product-detail-container">
          <div className="error-message">
            <h2>⚠️ {error || vi.productNotFound}</h2>
            <p>{vi.productNotFound}</p>
            <Link to="/product" className="btn-back-home">
              {vi.backToHome}
            </Link>
          </div>
        </div>
      );
    }

    const galleryImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
    const imgSrc = this.resolveImage(galleryImages[this.state.activeImageIndex] || galleryImages[0]);
    const discount = product.discount || 0;
    const originalPrice = product.price || 0;
    const finalPrice = originalPrice * (1 - discount / 100);
    const categoryName = this.safeValue(product, 'category.name', 'Uncategorized');
    const productStatus = this.safeValue(product, 'status', 'IN_STOCK');
    const stockAvailable = product.stock || 0;
    const inStock = productStatus === 'IN_STOCK' && stockAvailable > 0;

    return (
      <div className="product-detail-container">
        {addToCartMessage && (
          <div className={`cart-message ${addToCartSuccess ? 'success' : 'error'}`}>
            <span className="message-icon">{addToCartSuccess ? '✓' : '⚠️'}</span>
            <span className="message-text">{addToCartMessage}</span>
            <button
              className="message-close"
              onClick={() => this.setState({ addToCartMessage: '' })}
            >
              ×
            </button>
          </div>
        )}

        <div className="product-detail-wrapper">
          <div className="product-gallery">
            <div className="gallery-main">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={this.safeValue(product, 'name', 'Product')}
                  className="main-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="product-placeholder"
                style={{
                  display: imgSrc ? 'none' : 'flex',
                  background: 'linear-gradient(135deg, #4B3621 0%, #8B7355 50%, #C6A769 100%)',
                  color: 'rgba(249,246,241,0.7)',
                  fontSize: '1.2rem',
                  fontWeight: '300',
                  letterSpacing: '2px'
                }}
              >
                Trầm Hương
              </div>

              {discount > 0 && (
                <div className="gallery-badge">
                  -{discount}% OFF
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="gallery-thumbs">
                {galleryImages.map((src, index) => {
                  const thumbSrc = this.resolveImage(src);
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`thumb-item ${this.state.activeImageIndex === index ? 'active' : ''}`}
                      onClick={() => this.setState({ activeImageIndex: index })}
                    >
                      <img src={thumbSrc} alt={`${product.name} ${index + 1}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="product-info-detail">
            <h1 className="product-title">
              {this.safeValue(product, 'name', 'Unnamed Product')}
            </h1>

            <div className="product-category">
              <span className="label text-secondary">{vi.categoryLabel}:</span>
              <span className="value">{categoryName}</span>
            </div>

            <div className="product-pricing">
              <div className="price-display">
                <span className="currency">₫</span>
                <span className="amount">{this.formatVND(finalPrice).replace('₫', '')}</span>
                {discount > 0 && (
                  <span className="price-original">{this.formatVND(originalPrice)}</span>
                )}
              </div>
              {discount > 0 && (
                <div className="discount-info">
                  {vi.savingAmount} {this.formatVND(originalPrice - finalPrice)}
                </div>
              )}
            </div>

            <div className="product-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>{vi.item100Natural}</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>{vi.highQuality}</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>{vi.freeShipping}</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>{vi.return30Days}</span>
              </div>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <label>{vi.quantity}</label>
                <div className="quantity-input">
                  <button
                    className="qty-btn"
                    onClick={() => this.handleQuantityChange(-1)}
                    disabled={txtQuantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={txtQuantity}
                    onChange={this.handleQuantityInputChange}
                    min="1"
                    max="99"
                  />
                  <button
                    className="qty-btn"
                    onClick={() => this.handleQuantityChange(1)}
                    disabled={!inStock || txtQuantity >= stockAvailable}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="action-buttons-row">
                <button
                  className={`btn-add-cart ${!inStock ? 'disabled-btn' : ''}`}
                  onClick={this.lnkAddClick}
                  disabled={!product || !inStock}
                  style={!inStock ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
                >
                  {!inStock ? 'Hết hàng' : vi.addToCart}
                </button>
                <button
                  className={`btn-buy-now ${!inStock ? 'disabled-btn' : ''}`}
                  onClick={this.btnBuyNowClick}
                  disabled={!product || !inStock}
                  style={!inStock ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
                >
                  {!inStock ? 'Hết hàng' : 'Mua ngay'}
                </button>
              </div>
            </div>

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">SKU:</span>
                <span className="meta-value">{this.safeValue(product, '_id', '').substring(0, 8)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">{vi.statusLabel}:</span>
                <span className={`meta-value ${inStock ? 'available' : 'out-of-stock'}`}>{inStock ? 'Còn hàng' : 'Hết hàng'}</span>
              </div>
              {stockAvailable > 0 && (
                <div className="meta-item">
                  <span className="meta-label">Tồn kho:</span>
                  <span className="meta-value" style={{ fontWeight: '600', color: 'var(--primary-color)'}}>Còn {stockAvailable} sản phẩm</span>
                </div>
              )}
            </div>

            <div className="product-description-detail">
              <h3>{vi.productDescriptionLabel}</h3>
              <div 
                className="description-html-content"
                dangerouslySetInnerHTML={{ 
                  __html: this.safeValue(product, 'description', 
                  '<p>Sản phẩm trầm hương cao cấp được tuyển chọn kỹ lưỡng từ những cây trầm tự nhiên. Mỗi sản phẩm đều mang đến trải nghiệm tinh tế và đẳng cấp cho những người sành trầm.</p>') 
                }} 
              />
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2>{vi.relatedProducts}</h2>
            <div className="related-products-grid">
              {relatedProducts.map((prod) => {
                const prodImgSrc = this.resolveImage(prod.image);
                const prodDiscount = prod.discount || 0;
                const prodOriginalPrice = prod.price || 0;
                const prodFinalPrice = prodOriginalPrice * (1 - prodDiscount / 100);

                return (
                  <div key={prod._id || Math.random()} className="related-product-card">
                    <div className="related-image">
                      <Link to={`/product/${prod._id}`}>
                        {prodImgSrc ? (
                          <img
                            src={prodImgSrc}
                            alt={this.safeValue(prod, 'name', 'Product')}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="product-placeholder"
                          style={{
                            display: prodImgSrc ? 'none' : 'flex',
                            background: 'linear-gradient(135deg, #4B3621 0%, #8B7355 50%, #C6A769 100%)',
                            color: 'rgba(249,246,241,0.7)',
                            fontSize: '0.8rem',
                            fontWeight: '300',
                            letterSpacing: '1px'
                          }}
                        >
                          Trầm
                        </div>
                      </Link>

                      {prodDiscount > 0 && (
                        <span className="product-discount-badge">
                          -{prodDiscount}%
                        </span>
                      )}
                    </div>

                    <div className="related-info">
                      <h3>{this.safeValue(prod, 'name', 'Unnamed Product')}</h3>
                      <div className="related-price">
                        {this.formatVND(prodFinalPrice)}
                      </div>
                      <Link to={`/product/${prod._id}`} className="related-link">
                        {vi.viewDetails} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(ProductDetail);
