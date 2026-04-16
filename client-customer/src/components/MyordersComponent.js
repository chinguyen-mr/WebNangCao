import axios from 'axios';
import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import SeoUtil from '../utils/SeoUtil';
import './MyordersComponent.css';

class Myorders extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null,
      loading: true
    };
  }

  componentDidMount() {
    SeoUtil.updatePageMeta({
      title: 'Đơn hàng của tôi | Trầm Tịnh',
      description: 'Xem và theo dõi tất cả đơn hàng của bạn tại Trầm Tịnh. Kiểm tra trạng thái giao hàng và lịch sử mua sắm.',
    });

    if (this.context.customer) {
      this.apiGetOrdersByCustID(this.context.customer._id);
    }
  }

  resolveImage = (img) => {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) return img;
    return 'data:image/jpg;base64,' + img;
  };

  formatVND(price) {
    if (!price) return '0₫';
    const roundedPrice = Math.round(price);
    return roundedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
  }

  getStatusClass(status) {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'CANCELED': return 'status-canceled';
      default: return '';
    }
  }

  trItemClick(item) {
    this.setState({ order: item });
    // Scroll to detail smoothly
    setTimeout(() => {
      const detailElement = document.getElementById('order-detail-view');
      if (detailElement) {
        detailElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  apiGetOrdersByCustID(cid) {
    const config = {
      headers: { 'x-access-token': this.context.token }
    };
    this.setState({ loading: true });
    axios.get('/api/order/customer/history/' + cid, config).then((res) => {
      const result = res.data;
      if (Array.isArray(result)) {
        this.setState({ orders: result, loading: false });
      } else {
        this.setState({ loading: false });
      }
    }).catch((error) => {
      console.error('Error fetching orders:', error);
      this.setState({ loading: false });
    });
  }

  render() {
    if (this.context.token === '') return <Navigate replace to='/login' />;
    const { orders, order, loading } = this.state;

    return (
      <div className="orders-page-container">
        <div className="orders-header">
          <h1>Lịch sử đơn hàng</h1>
          <p>Quản lý và theo dõi các đơn hàng trầm hương cao cấp của bạn</p>
        </div>

        {loading ? (
          <div className="loading-state">Đang tải lịch sử đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>Bạn chưa có đơn hàng nào</h2>
            <p>Khám phá bộ sưu tập trầm hương tuyệt tác của chúng tôi ngay hôm nay.</p>
            <Link to="/product" className="btn btn-shop-now">Bắt đầu mua sắm</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((item) => (
              <div 
                key={item._id} 
                className={`order-card ${order && order._id === item._id ? 'active' : ''}`}
                onClick={() => this.trItemClick(item)}
              >
                <div className="order-card-header">
                  <div className="order-info-main">
                    <h3>Đơn hàng #{item._id.substring(item._id.length - 8).toUpperCase()}</h3>
                    <span className="order-date">
                      Ngày đặt: {new Date(item.cdate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className={`order-card-status ${this.getStatusClass(item.status)}`}>
                    {item.status === 'PENDING' ? 'Chờ duyệt' : 
                     item.status === 'APPROVED' ? 'Đã duyệt' : 'Đã hủy'}
                  </div>
                </div>
                <div className="order-card-body">
                  <div className="order-preview-items">
                    {item.items.slice(0, 3).map((line, idx) => (
                      <img 
                        key={idx} 
                        src={this.resolveImage(line.product.image)} 
                        alt={line.product.name} 
                        className="preview-thumb" 
                      />
                    ))}
                    {item.items.length > 3 && (
                      <span className="item-count-badge">+{item.items.length - 3} sản phẩm khác</span>
                    )}
                  </div>
                  <div className="order-total-display">
                    <span className="total-label-small">Tổng cộng</span>
                    <span className="total-price-large">{this.formatVND(item.total)}</span>
                  </div>
                </div>
                
                {/* INLINE DETAIL VIEW */}
                {order && order._id === item._id && (
                  <div className="order-detail-inline">
                    <div className="detail-header">
                      <div>
                        <h2>Chi tiết đơn hàng</h2>
                        <p className="order-id-full">Mã đầy đủ: {order._id}</p>
                      </div>
                    </div>

                    <div className="detail-grid">
                      <div className="detail-block">
                        <h4>Thông tin người nhận</h4>
                        <p><strong>{order.customer.name}</strong></p>
                        <p>{order.customer.phone}</p>
                        <p>{order.customer.email}</p>
                      </div>
                      <div className="detail-block">
                        <h4>Địa chỉ giao hàng</h4>
                        {order.shippingAddress ? (
                          <>
                            <p>{order.shippingAddress.address || order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.district && `${order.shippingAddress.district}, `}{order.shippingAddress.city}</p>
                          </>
                        ) : (
                          <p>Thông tin địa chỉ đang được cập nhật</p>
                        )}
                      </div>
                      <div className="detail-block">
                        <h4>Phương thức thanh toán</h4>
                        <p>{order.paymentMethod === 'cashOnDelivery' ? 'Thanh toán khi nhận hàng (COD)' : 
                            order.paymentMethod === 'creditCard' ? 'Thẻ tín dụng' : 
                            order.paymentMethod === 'payWithQR' ? 'Quét mã QR' : 'Chuyển khoản ngân hàng'}</p>
                      </div>
                    </div>

                    <div className="detail-items-table">
                      <div className="item-row-detail header">
                        <span>Ảnh</span>
                        <span>Sản phẩm</span>
                        <span>Giá</span>
                        <span>SL</span>
                        <span style={{ textAlign: 'right' }}>Thành tiền</span>
                      </div>
                      {order.items.map((line, index) => (
                        <div key={index} className="item-row-detail">
                          <img src={this.resolveImage(line.product.image)} alt="" className="item-thumb-detail" />
                          <span className="item-name-detail">{line.product.name}</span>
                          <span>{this.formatVND(line.product.price)}</span>
                          <span>{line.quantity}</span>
                          <span style={{ textAlign: 'right', fontWeight: 600 }}>{this.formatVND(line.product.price * line.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="detail-summary">
                      <div className="summary-line">
                        <span>Tạm tính:</span>
                        <span>{this.formatVND(order.total / 1.08)}</span>
                      </div>
                      <div className="summary-line">
                        <span>Thuế (8%):</span>
                        <span>{this.formatVND(order.total - (order.total / 1.08))}</span>
                      </div>
                      <div className="summary-line">
                        <span>Vận chuyển:</span>
                        <span className="shipping-free">Miễn phí</span>
                      </div>
                      <div className="summary-line grand-total">
                        <span>Tổng cộng:</span>
                        <span>{this.formatVND(order.total)}</span>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <button className="btn secondary" onClick={(e) => { e.stopPropagation(); this.setState({ order: null }); }}>Thu gọn</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default Myorders;