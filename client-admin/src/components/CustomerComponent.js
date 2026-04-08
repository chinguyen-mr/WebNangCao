import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import vi from '../lang/vi';

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      searchKeyword: '',
      selectedCustomer: null,
      selectedOrders: [],
      loadingOrders: false
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  handleSearchSubmit = (event) => {
    event.preventDefault();
  }

  handleCustomerSelect = (customer) => {
    this.setState({ selectedCustomer: customer, selectedOrders: [], loadingOrders: true }, () => {
      this.apiGetOrdersByCustID(customer._id);
    });
  }

  handleDeactivate = (customer) => {
    if (window.confirm('Deactivate this customer?')) {
      this.apiPutCustomerDeactive(customer._id, customer.token);
    }
  }

  handleSendEmail = (customer) => {
    this.apiGetCustomerSendmail(customer._id);
  }

  renderCustomerDetail() {
    const { selectedCustomer, selectedOrders, loadingOrders } = this.state;

    if (!selectedCustomer) {
      return (
        <div className="customer-detail-empty">
          Vui lòng chọn khách hàng để xem chi tiết và đơn hàng.
        </div>
      );
    }

    return (
      <div className="customer-detail-card">
        <div className="customer-detail-header">
          <div>
            <h3>{selectedCustomer.name || selectedCustomer.username}</h3>
            <p className="customer-subtitle">{selectedCustomer.username}</p>
          </div>
          <span className={`status-badge ${selectedCustomer.active === 1 ? 'in-stock' : 'out-of-stock'}`}>
            {selectedCustomer.active === 1 ? vi.active : vi.inactive}
          </span>
        </div>

        <div className="customer-info-row">
          <div>
            <strong>Email</strong>
            <p>{selectedCustomer.email || 'N/A'}</p>
          </div>
          <div>
            <strong>Điện thoại</strong>
            <p>{selectedCustomer.phone || 'N/A'}</p>
          </div>
        </div>

        <div className="customer-info-row">
          <div>
            <strong>ID khách hàng</strong>
            <p>{selectedCustomer._id}</p>
          </div>
          <div>
            <strong>Tên đăng nhập</strong>
            <p>{selectedCustomer.username}</p>
          </div>
        </div>

        <div className="customer-action-group">
          <button className="customer-action-btn" onClick={() => this.handleSendEmail(selectedCustomer)}>
            Gửi email
          </button>
          {selectedCustomer.active === 1 ? (
            <button className="customer-action-btn danger" onClick={() => this.handleDeactivate(selectedCustomer)}>
              Hủy kích hoạt
            </button>
          ) : (
            <button className="customer-action-btn disabled" disabled>
              Đã hủy
            </button>
          )}
        </div>

        <div className="customer-orders-panel">
          <div className="customer-orders-header">
            <h4>Đơn hàng khách hàng</h4>
            <span>{loadingOrders ? 'Đang tải đơn hàng...' : `${selectedOrders.length} đơn hàng`}</span>
          </div>

          {selectedOrders.length > 0 ? (
            <div className="customer-orders-table-container">
              <table className="customer-orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ngày mua</th>
                    <th>Tổng cộng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrders.map((order) => {
                    let statusClass = 'pending';
                    if (order.status === 'APPROVED') statusClass = 'in-stock';
                    if (order.status === 'CANCELED') statusClass = 'out-of-stock';

                    return (
                      <tr key={order._id}>
                        <td>{order._id.substring(order._id.length - 8)}</td>
                        <td>{new Date(order.cdate).toLocaleDateString('vi-VN')}</td>
                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="customer-orders-empty">
              {loadingOrders ? 'Đang tải đơn hàng...' : 'Không tìm thấy đơn hàng cho khách hàng này.'}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const filteredCustomers = this.state.customers.filter((item) => {
      const keyword = this.state.searchKeyword.toLowerCase();
      return (
        item.username.toLowerCase().includes(keyword) ||
        item.name?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.phone?.toLowerCase().includes(keyword)
      );
    });

    return (
      <div className="customer-management">
        <div className="customer-header">
          <div className="header-left">
            <h2>Quản lý khách hàng</h2>
            <p>Duyệt khách hàng, xem chi tiết và đơn hàng của họ.</p>
          </div>
        </div>

        <div className="customer-filters">
          <div className="search-box">
            <form className="search-form" onSubmit={this.handleSearchSubmit}>
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng theo tên, tên đăng nhập hoặc email..."
                value={this.state.searchKeyword}
                onChange={(e) => this.setState({ searchKeyword: e.target.value })}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <i className="icon-search"></i>
              </button>
            </form>
          </div>
        </div>

        <div className="customer-layout-grid">
          <div className="customer-table-panel">
            <div className="customer-table-container">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Tên đăng nhập</th>
                    <th>Tên</th>
                    <th>Điện thoại</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((item) => (
                      <tr
                        key={item._id}
                        className={this.state.selectedCustomer?._id === item._id ? 'selected-row' : ''}
                        onClick={() => this.handleCustomerSelect(item)}
                      >
                        <td>{item.username}</td>
                        <td>{item.name || 'N/A'}</td>
                        <td>{item.phone || 'N/A'}</td>
                        <td>{item.email || 'N/A'}</td>
                        <td>{item.active === 1 ? vi.active : vi.inactive}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-message">
                        Không tìm thấy khách hàng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="customer-detail-panel">
            {this.renderCustomerDetail()}
          </div>
        </div>
      </div>
    );
  }

  apiGetCustomers() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/customer/admin/list', config).then((res) => {
      const result = res.data;
      this.setState({ customers: result });
    }).catch((error) => {
      console.error('Error loading customers:', error);
    });
  }

  apiPutCustomerDeactive(id, token) {
    const body = { token: token };
    const config = { headers: { 'x-access-token': this.context.token } };

    axios.put('/api/customer/admin/deactive/' + id, body, config).then((res) => {
      const result = res.data;

      if (result) {
        this.apiGetCustomers();
        this.setState({ selectedCustomer: null, selectedOrders: [] });
      } else {
        alert('Không thể hủy kích hoạt khách hàng.');
      }
    }).catch((error) => {
      console.error('Error deactivating customer:', error);
    });
  }

  apiGetCustomerSendmail(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/customer/admin/sendmail/' + id, config).then((res) => {
      const result = res.data;
      alert(result.message);
    }).catch((error) => {
      console.error('Error sending email:', error);
    });
  }

  apiGetOrdersByCustID(cid) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/order/admin/customer/' + cid, config).then((res) => {
      const result = res.data;
      this.setState({ selectedOrders: result, loadingOrders: false });
    }).catch((error) => {
      console.error('Error loading customer orders:', error);
      this.setState({ selectedOrders: [], loadingOrders: false });
    });
  }
}

export default Customer;
