import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import vi from '../lang/vi';
import axios from 'axios';

class Home extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: '',
      counts: {
        products: 0,
        categories: 0,
        orders: 0,
        customers: 0
      },
      totalRevenue: 0,
      recentOrders: []
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    const config = { headers: { 'x-access-token': this.context.token } };

    try {
      const res = await axios.get('/api/admin/dashboard-stats', config);
      if (res.data.success) {
        this.setState({
          loading: false,
          counts: res.data.counts,
          totalRevenue: res.data.totalRevenue,
          recentOrders: res.data.recentOrders
        });
      } else {
        throw new Error(res.data.message || 'Error fetching stats');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.setState({
        loading: false,
        error: vi.dashboardLoadError || 'Không thể tải dữ liệu bảng điều khiển'
      });
    }
  };

  formatDate(timestamp) {
    if (!timestamp) return vi.na;
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPrice(price) {
    if (price == null || isNaN(price)) return '0₫';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
  }

  render() {
    const { loading, error, counts, totalRevenue, recentOrders } = this.state;
    const adminName = this.context.username || vi.admin;

    return (
      <div className="dashboard-content">
        <div className="dashboard-hero">
          <div className="hero-copy">
            <span className="hero-label">Chào mừng quay lại,</span>
            <h2>{adminName}</h2>
            <p>Hệ thống quản lý Trầm Tịnh đang hoạt động ổn định</p>
          </div>
          <div className="hero-widget">
            <span>Hôm nay</span>
            <h3>{new Date().toLocaleDateString('vi-VN')}</h3>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-status-message">Đang cập nhật dữ liệu...</div>
        ) : error ? (
          <div className="dashboard-status-message error">{error}</div>
        ) : (
          <>
            <div className="stats-grid">
               {/* Total Revenue Card - NEW */}
               <div className="stat-card revenue-card highlight">
                <div className="stat-icon revenue-icon">
                  <span style={{ fontSize: '2rem' }}>💰</span>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Tổng doanh thu</p>
                  <h3 className="stat-value">{this.formatPrice(totalRevenue)}</h3>
                </div>
              </div>

              <div className="stat-card summary-card">
                <div className="stat-icon orders-icon">
                   <span style={{ fontSize: '2rem' }}>📦</span>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Tổng đơn hàng</p>
                  <h3 className="stat-value">{counts.orders}</h3>
                </div>
              </div>

              <div className="stat-card summary-card">
                <div className="stat-icon customers-icon">
                   <span style={{ fontSize: '2rem' }}>👥</span>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Khách hàng</p>
                  <h3 className="stat-value">{counts.customers}</h3>
                </div>
              </div>

              <div className="stat-card summary-card">
                <div className="stat-icon products-icon">
                   <span style={{ fontSize: '2rem' }}>🧴</span>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Sản phẩm</p>
                  <h3 className="stat-value">{counts.products}</h3>
                </div>
              </div>
            </div>

            <div className="recent-orders-section">
              <div className="section-header">
                <h2>Đơn hàng mới nhất</h2>
                <button className="btn-link" onClick={() => window.location.href='/admin/order'}>Xem tất cả</button>
              </div>
              <div className="table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Tổng cộng</th>
                      <th>Trạng thái</th>
                      <th>Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map(order => (
                        <tr key={order._id}>
                          <td>#{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                          <td>{order.customer?.name || 'Khách vãng lai'}</td>
                          <td>{this.formatPrice(order.total)}</td>
                          <td>
                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                              {order.status === 'PENDING' ? 'Chờ duyệt' : 
                               order.status === 'APPROVED' ? 'Đã duyệt' : 'Đã hủy'}
                            </span>
                          </td>
                          <td>{this.formatDate(order.cdate)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          Chưa có đơn hàng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default Home;
