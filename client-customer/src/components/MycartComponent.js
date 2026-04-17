import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import axios from 'axios';
import withRouter from '../utils/withRouter';
import vi from '../lang/vi';
import SeoUtil from '../utils/SeoUtil';
import './MycartComponent.css';

const provincesData = {
  "Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12", "Quận Bình Tân", "Quận Bình Thạnh", "Quận Gò Vấp", "Quận Phú Nhuận", "Quận Tân Bình", "Quận Tân Phú", "Thành phố Thủ Đức", "Huyện Bình Chánh", "Huyện Cần Giờ", "Huyện Củ Chi", "Huyện Hóc Môn", "Huyện Nhà Bè"],
  "Hà Nội": ["Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Tây Hồ", "Quận Long Biên", "Quận Cầu Giấy", "Quận Đống Đa", "Quận Hai Bà Trưng", "Quận Hoàng Mai", "Quận Thanh Xuân", "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm", "Quận Hà Đông", "Thị xã Sơn Tây", "Huyện Ba Vì", "Huyện Chương Mỹ", "Huyện Đan Phượng", "Huyện Đông Anh", "Huyện Gia Lâm", "Huyện Hoài Đức", "Huyện Mê Linh", "Huyện Mỹ Đức", "Huyện Phú Xuyên", "Huyện Phúc Thọ", "Huyện Quốc Oai", "Huyện Sóc Sơn", "Huyện Thạch Thất", "Huyện Thanh Oai", "Huyện Thanh Trì", "Huyện Thường Tín", "Huyện Ứng Hòa"],
  "Đà Nẵng": ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn", "Quận Liên Chiểu", "Quận Cẩm Lệ", "Huyện Hòa Vang", "Huyện Hoàng Sa"],
  "Cần Thơ": ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Quận Ô Môn", "Quận Thốt Nốt", "Huyện Phong Điền", "Huyện Thới Lai", "Huyện Cờ Đỏ", "Huyện Vĩnh Thạnh"],
  "Hải Phòng": ["Quận Hồng Bàng", "Quận Lê Chân", "Quận Ngô Quyền", "Quận Kiến An", "Quận Hải An", "Quận Dương Kinh", "Quận Đồ Sơn", "Huyện An Dương", "Huyện An Lão", "Huyện Bạch Long Vĩ", "Huyện Cát Hải", "Huyện Kiến Thụy", "Huyện Thủy Nguyên", "Huyện Tiên Lãng", "Huyện Vĩnh Bảo"]
};

class Mycart extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      quantities: {},
      showCheckoutForm: false,
      checkoutStep: 'info', // 'info' -> 'confirm' -> 'payment' -> 'success'
      isSubmitting: false,
      checkoutMessage: '',
      availableDistricts: [],
      checkoutData: {
        fullName: '',
        phone: '',
        email: '',
        city: '',
        district: '',
        address: '',
        note: '',
        paymentMethod: 'cashOnDelivery'
      },
      errors: {}
    };
  }

  resolveImage = (img) => {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) return img;
    return 'data:image/jpg;base64,' + img;
  };

  formatVND(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
  }

  componentDidMount() {
    this.syncQuantities();
    SeoUtil.updatePageMeta({
      title: 'Giỏ hàng | Trầm Tịnh',
      description: 'Xem và quản lý giỏ hàng của bạn tại Trầm Tịnh. Kiểm tra sản phẩm, cập nhật số lượng và tiến hành thanh toán an toàn.',
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const mycart = Array.isArray(this.context.mycart) ? this.context.mycart : [];
    const currentKeys = mycart.map(item => item?.product?._id).join(',');
    const prevKeys = Object.keys(prevState.quantities || {}).join(',');

    if (currentKeys !== prevKeys) {
      this.syncQuantities();
    }
  }

  syncQuantities = () => {
    const quantities = {};
    const mycart = Array.isArray(this.context.mycart) ? this.context.mycart : [];
    mycart.forEach(item => {
      if (item && item.product && item.product._id) {
        quantities[item.product._id] = item.quantity;
      }
    });
    this.setState({ quantities });
  };

  handleQuantityChange = (productId, newQuantity) => {
    const validQuantity = Math.max(1, Number(newQuantity) || 1);
    const mycart = Array.isArray(this.context.mycart) ? this.context.mycart : [];
    const index = mycart.findIndex(x => x && x.product && x.product._id === productId);

    if (index !== -1) {
      CartUtil.updateQuantity(this.context, productId, validQuantity);
      this.setState(prev => ({
        quantities: { ...prev.quantities, [productId]: validQuantity }
      }));
    }
  };

  lnkRemoveClick = (id) => {
    CartUtil.removeFromCart(this.context, id);
    this.setState(prev => ({
      quantities: { ...prev.quantities, [id]: undefined }
    }));
  };

  lnkCheckoutClick = () => {
    const mycart = Array.isArray(this.context.mycart) ? this.context.mycart : [];
    if (mycart.length === 0) {
      alert(vi.cartIsEmpty);
      return;
    }

    const customer = this.context.customer;
    if (!customer) {
      this.props.navigate('/login');
      return;
    }

    this.setState({
      showCheckoutForm: true,
      checkoutStep: 'info',
      checkoutMessage: '',
      errors: {},
      availableDistricts: provincesData[customer.city] || [],
      checkoutData: {
        fullName: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        district: '',
        note: '',
        paymentMethod: 'cashOnDelivery'
      }
    });
  };

  handleCheckoutFieldChange = (field, value) => {
    const newCheckoutData = { ...this.state.checkoutData, [field]: value };

    // Reset district if city changes
    let newAvailableDistricts = this.state.availableDistricts;
    if (field === 'city') {
      newCheckoutData.district = '';
      newAvailableDistricts = provincesData[value] || [];
    }

    this.setState({
      checkoutData: newCheckoutData,
      availableDistricts: newAvailableDistricts,
      errors: { ...this.state.errors, [field]: '' }
    });
  };

  handleCheckoutNext = () => {
    const { checkoutData } = this.state;
    const errors = {};
    if (!checkoutData.fullName) errors.fullName = vi.fullNameRequiredValidation;
    if (!checkoutData.phone) errors.phone = vi.phoneRequiredValidation;
    if (!checkoutData.city) errors.city = vi.cityRequiredValidation;

    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    this.setState({ checkoutStep: 'confirm' });
  };

  handleCheckoutBack = () => {
    if (this.state.checkoutStep === 'confirm') {
      this.setState({ checkoutStep: 'info' });
    } else if (this.state.checkoutStep === 'payment') {
      this.setState({ checkoutStep: 'confirm' });
    }
  };

  handlePaymentIntermission = () => {
    this.setState({ checkoutStep: 'payment' });
  };

  handleConfirmCheckout = () => {
    const { checkoutData } = this.state;
    const mycart = this.context.mycart;
    const subtotal = CartUtil.getTotal(mycart);

    this.setState({ isSubmitting: true, checkoutMessage: 'Đang xử lý đặt hàng...' });

    const totalWithTax = subtotal * 1.08;

    const body = {
      total: totalWithTax,
      items: mycart,
      customer: {
        name: checkoutData.fullName,
        phone: checkoutData.phone,
        email: checkoutData.email
      },
      paymentMethod: checkoutData.paymentMethod,
      shippingAddress: {
        fullName: checkoutData.fullName,
        phone: checkoutData.phone,
        email: checkoutData.email,
        city: checkoutData.city,
        district: checkoutData.district,
        address: checkoutData.address,
        note: checkoutData.note
      }
    };

    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/order/checkout', body, config).then((res) => {
      const result = res.data;
      if (result.success === true) {
        this.context.setMycart([]);
        this.setState({ checkoutStep: 'success', isSubmitting: false });
        setTimeout(() => {
          this.setState({ showCheckoutForm: false, checkoutStep: 'info' });
          this.props.navigate('/myorders');
        }, 3000);
      } else {
        this.setState({ isSubmitting: false, checkoutMessage: result.message || 'Đặt hàng thất bại. Vui lòng thử lại.' });
      }
    }).catch((error) => {
      console.error(error);
      let errMsg = 'Đã có lỗi xảy ra kết nối máy chủ.';
      if (error.response && error.response.status === 401) {
        errMsg = 'Phiên làm việc hết hạn. Vui lòng đăng xuất và đăng nhập lại.';
      }
      this.setState({ isSubmitting: false, checkoutMessage: errMsg });
    });
  };

  handleCloseCheckoutForm = () => {
    if (!this.state.isSubmitting) {
      this.setState({ showCheckoutForm: false, checkoutStep: 'info' });
    }
  };

  render() {
    const mycart = Array.isArray(this.context.mycart) ? this.context.mycart : [];
    const subtotal = CartUtil.getTotal(mycart);

    if (mycart.length === 0) {
      return (
        <div className="cart-empty-container">
          <div className="empty-message">
            <h2>{vi.yourCartIsEmpty}</h2>
            <p>{vi.discoverPremiumAgarwood}</p>
            <Link to="/product" className="btn-continue-shopping">
              {vi.continueShopping}
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="cart-page-container">
        <div className="cart-header">
          <h1>{vi.shoppingCart}</h1>
          <span className="cart-item-count">{mycart.length} {mycart.length === 1 ? vi.item : vi.items}</span>
        </div>

        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-items-grid">
              {mycart.map((item) => (
                <div key={item.product._id} className="cart-item-card">
                  <div className="cart-item-image">
                    <img src={this.resolveImage(item.product.image)} alt={item.product.name} />
                  </div>
                  <div className="cart-item-details">
                    <h3 className="item-name">{item.product.name}</h3>
                    <p className="item-category">{item.product.category.name}</p>
                    <div className="item-pricing">
                      <span className="unit-price">{this.formatVND(item.product.price)} / sản phẩm</span>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button className="qty-btn-cart" onClick={() => this.handleQuantityChange(item.product._id, item.quantity - 1)}>−</button>
                      <input
                        type="number"
                        value={this.state.quantities[item.product._id] || item.quantity}
                        onChange={(e) => this.handleQuantityChange(item.product._id, parseInt(e.target.value, 10) || 1)}
                        min="1"
                        className="qty-input-cart"
                      />
                      <button className="qty-btn-cart" onClick={() => this.handleQuantityChange(item.product._id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="item-total">
                      <p className="total-label">{vi.subtotal}</p>
                      <p className="total-amount">{this.formatVND(item.product.price * item.quantity)}</p>
                    </div>
                    <button className="btn-remove" onClick={() => this.lnkRemoveClick(item.product._id)} title={vi.removeFromCart}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary-section">
            <div className="summary-card">
              <h2>{vi.orderSummary}</h2>
              <div className="summary-row">
                <span className="summary-label">{vi.subtotalLabel}</span>
                <span className="summary-value">{this.formatVND(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">{vi.shippingLabel}</span>
                <span className="summary-value shipping-free">{vi.free}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">{vi.taxLabel}</span>
                <span className="summary-value">{this.formatVND(subtotal * 0.08)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span className="summary-label">{vi.totalLabel}</span>
                <span className="total-price">{this.formatVND(subtotal + subtotal * 0.08)}</span>
              </div>
              <button className="btn-checkout" onClick={this.lnkCheckoutClick}>{vi.proceedToCheckout}</button>
              <Link to="/product" className="btn-continue-shopping-link">{vi.continueShoppingLink}</Link>
              <div className="security-badge"><span>{vi.secureCheckout}</span></div>
            </div>
          </div>
        </div>

        {this.state.showCheckoutForm && this.renderCheckoutForm()}
      </div>
    );
  }

  renderCheckoutForm() {
    const { checkoutData, errors, checkoutStep, isSubmitting, checkoutMessage, availableDistricts } = this.state;
    const mycart = this.context.mycart || [];
    const subtotal = CartUtil.getTotal(mycart);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
      <div className="checkout-modal-overlay">
        <div className={`checkout-modal-container ${isSubmitting ? 'submitting' : ''}`}>
          {isSubmitting && (
            <div className="checkout-loading-overlay">
              <div className="spinner"></div>
              <p>{checkoutMessage || 'Đang xử lý...'}</p>
            </div>
          )}

          {checkoutStep !== 'success' && (
            <div className="checkout-header-nav">
              <button className="back-arrow" onClick={this.handleCloseCheckoutForm}>&larr;</button>
              <span className="header-title">{checkoutStep === 'info' ? 'THÔNG TIN' : 'THANH TOÁN'}</span>
            </div>
          )}

          {checkoutStep !== 'success' && (
            <div className="checkout-progress-tabs">
              <div className={`tab-step ${checkoutStep === 'info' ? 'active' : ''}`} onClick={() => checkoutStep !== 'info' && this.handleCheckoutBack()}>
                1. THÔNG TIN
              </div>
              <div className={`tab-step ${checkoutStep !== 'info' ? 'active' : ''}`}>
                2. THANH TOÁN
              </div>
            </div>
          )}

          <div className="checkout-scroll-content">
            {checkoutStep !== 'success' && this.renderProductPreview()}

            {checkoutStep === 'info' ? this.renderCheckoutInfo(errors, checkoutData, availableDistricts) :
              checkoutStep === 'confirm' ? this.renderCheckoutConfirm(checkoutData, subtotal, tax, total) :
                checkoutStep === 'payment' ? this.renderCheckoutPaymentIntermission(checkoutData) :
                  this.renderCheckoutSuccess()}

            {(checkoutMessage && checkoutStep !== 'success' && !isSubmitting) && (
              <div className="checkout-alert error">{checkoutMessage}</div>
            )}
          </div>

          {checkoutStep !== 'success' && checkoutStep !== 'payment' && (
            <div className="checkout-sticky-footer">
              <div className="footer-total-info">
                <span className="footer-label">Tổng tiền tạm tính:</span>
                <span className="footer-value">{this.formatVND(total)}</span>
              </div>
              <button
                className="btn-primary-action"
                onClick={checkoutStep === 'info' ? this.handleCheckoutNext : (checkoutData.paymentMethod === 'cashOnDelivery' ? this.handleConfirmCheckout : this.handlePaymentIntermission)}
                disabled={isSubmitting}
              >
                {checkoutStep === 'info' ? 'TIẾP TỤC' : (checkoutData.paymentMethod === 'cashOnDelivery' ? 'THANH TOÁN' : 'TIẾP TỤC')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  renderProductPreview() {
    const mycart = this.context.mycart || [];
    return (
      <div className="product-preview-section">
        {mycart.map((item, index) => (
          <div key={index} className="product-preview-card">
            <div className="preview-img">
              <img src={this.resolveImage(item.product.image)} alt={item.product.name} />
            </div>
            <div className="preview-details">
              <h4 className="preview-name">{item.product.name}</h4>
              <div className="preview-prices">
                <span className="current-price">{this.formatVND(item.product.price)}</span>
              </div>
            </div>
            <div className="preview-qty">x{item.quantity}</div>
          </div>
        ))}
      </div>
    );
  }

  renderCheckoutSuccess() {
    return (
      <div className="checkout-success-view">
        <div className="success-icon-wrapper"><div className="success-checkmark">✓</div></div>
        <h2 className="success-title">{vi.transferSuccess}</h2>
        <p className="success-message">{vi.orderPlacedSuccessfully}</p>
        <div className="success-divider"></div>
        <p className="redirect-hint">Đang chuyển bạn đến đơn hàng của tôi...</p>
      </div>
    );
  }

  renderCheckoutPaymentIntermission(checkoutData) {
    const paymentMethods = [
      { id: 'cashOnDelivery', name: vi.cashOnDelivery, icon: '💵' },
      { id: 'payWithQR', name: vi.payWithQR, icon: '📱' },
      { id: 'bankTransfer', name: vi.bankTransfer, icon: '🏦' },
      { id: 'creditCard', name: vi.creditCard, icon: '💳' }
    ];

    return (
      <div className="checkout-step-container">
        <h3 className="checkout-section-title">CHỌN PHƯƠNG THỨC THANH TOÁN</h3>
        <div className="payment-methods-grid">
          {paymentMethods.map(method => (
            <div
              key={method.id}
              className={`payment-method-item ${checkoutData.paymentMethod === method.id ? 'active' : ''}`}
              onClick={() => this.handleCheckoutFieldChange('paymentMethod', method.id)}
            >
              <span className="method-icon">{method.icon}</span>
              <span className="method-name">{method.name}</span>
            </div>
          ))}
        </div>

        {checkoutData.paymentMethod === 'payWithQR' && (
          <div className="payment-sub-view">
            <p className="payment-instruction">{vi.scanQRToPay}</p>
            <div className="qr-container-wrapper">
              <img src="/images/qr-payment.png" alt="QR" className="qr-image-display" onError={(e) => { e.target.onerror = null; e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://tramtinh.com' }} />
            </div>
          </div>
        )}

        {checkoutData.paymentMethod === 'bankTransfer' && (
          <div className="payment-sub-view">
            <div className="bank-details-card">
              <p><strong>{vi.bankName}:</strong> VietcomBank (VCB)</p>
              <p><strong>{vi.accountNumber}:</strong> 1234567890</p>
              <p><strong>{vi.accountName}:</strong> NGUYEN VAN A</p>
              <p>Nội dung: #{this.context.customer?._id?.substring(0, 8)}</p>
            </div>
          </div>
        )}

        <button className="btn-confirm-payment" onClick={this.handleConfirmCheckout}>
          XÁC NHẬN THANH TOÁN
        </button>
      </div>
    );
  }

  renderCheckoutInfo(errors, checkoutData, availableDistricts) {
    return (
      <div className="checkout-step-container">
        <div className="checkout-form-section">
          <h3 className="checkout-section-title">THÔNG TIN KHÁCH HÀNG</h3>
          <div className="checkout-details-box">
            <div className="info-main-details">
              <span className="checkout-name-text">{checkoutData.fullName || 'Nguyễn Văn A'}</span>
              <span className="checkout-phone-text">{checkoutData.phone || '0123456789'}</span>
            </div>
            <div className="info-sub-details">
              <span className="checkout-email-label">EMAIL:</span>
              <span className="checkout-email-value">{checkoutData.email || 'email@example.com'}</span>
            </div>
          </div>
        </div>

        <div className="checkout-form-section">
          <h3 className="checkout-section-title">THÔNG TIN NHẬN HÀNG</h3>
          <div className="checkout-form-grid">
            <div className="checkout-form-field">
              <select
                className={`checkout-select-input ${errors.city ? 'input-invalid' : ''}`}
                value={checkoutData.city}
                onChange={(e) => this.handleCheckoutFieldChange('city', e.target.value)}
              >
                <option value="">TỈNH / THÀNH PHỐ</option>
                {Object.keys(provincesData).map(province => (<option key={province} value={province}>{province}</option>))}
              </select>
            </div>
            <div className="checkout-form-field">
              <select
                className="checkout-select-input"
                value={checkoutData.district}
                onChange={(e) => this.handleCheckoutFieldChange('district', e.target.value)}
                disabled={!checkoutData.city}
              >
                <option value="">QUẬN / HUYỆN</option>
                {availableDistricts.map(dist => (<option key={dist} value={dist}>{dist}</option>))}
              </select>
            </div>
          </div>

          <div className="checkout-form-field">
            <input type="text" className="checkout-text-input" placeholder="Địa chỉ chi tiết (số nhà, tên đường...)" value={checkoutData.address} onChange={(e) => this.handleCheckoutFieldChange('address', e.target.value)} />
          </div>

          <div className="checkout-form-field">
            <input type="text" className="checkout-text-input" placeholder="Ghi chú khác (nếu có)" value={checkoutData.note} onChange={(e) => this.handleCheckoutFieldChange('note', e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  renderCheckoutConfirm(checkoutData, subtotal, tax, total) {
    return (
      <div className="checkout-step-container">
        <div className="checkout-pricing-summary">
          <div className="summary-row-item">
            <span className="row-label">Tổng tiền hàng</span>
            <span className="row-value">{this.formatVND(subtotal)}</span>
          </div>
          <div className="summary-row-item">
            <span className="row-label">Thuế (8%)</span>
            <span className="row-value">{this.formatVND(tax)}</span>
          </div>
          <div className="summary-row-item">
            <span className="row-label">Phí vận chuyển</span>
            <span className="row-value shipping-free-text">Miễn phí</span>
          </div>
          <div className="summary-divider-light"></div>
          <div className="summary-row-item checkout-total-final">
            <span className="main-total">TỔNG CỘNG</span>
            <span className="final-total-amount">{this.formatVND(total)}</span>
          </div>
        </div>

        <div className="checkout-form-section">
          <h3 className="checkout-section-title">PHƯƠNG THỨC THANH TOÁN</h3>
          <div className="payment-selector-box" onClick={this.handlePaymentIntermission}>
            <div className="method-text-box">
              <span className="method-primary-text">{checkoutData.paymentMethod === 'cashOnDelivery' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'}</span>
            </div>
            <span className="method-arrow-indicator">CHỌN LẠI ›</span>
          </div>
        </div>

        <div className="checkout-form-section">
          <h3 className="checkout-section-title">XÁC NHẬN ĐỊA CHỈ</h3>
          <div className="info-summary-table-display">
            <p><strong>Người nhận:</strong> {checkoutData.fullName} - {checkoutData.phone}</p>
            <p><strong>Địa chỉ:</strong> {checkoutData.address}, {checkoutData.district}, {checkoutData.city}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Mycart);
