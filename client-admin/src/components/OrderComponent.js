import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import vi from '../lang/vi';

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      selectedOrder: null,
      searchKeyword: '',
      filterStatus: '',
      showDetail: false
    };
  }

  getStatusText(status) {
    const statusMap = {
      'PENDING': vi.pending,
      'APPROVED': vi.approved,
      'COMPLETED': vi.completed,
      'CANCELED': vi.cancelled,
      'CANCELLED': vi.cancelled
    };
    return statusMap[status] || status;
  }

  getPaymentMethodText(method) {
    const methodMap = {
      'cashOnDelivery': 'Thanh toán khi nhận hàng (COD)',
      'payWithQR': 'Thanh toán qua mã QR',
      'bankTransfer': 'Chuyển khoản ngân hàng',
      'creditCard': 'Thanh toán qua thẻ Visa/Master'
    };
    return methodMap[method] || method || 'N/A';
  }

  componentDidMount() {
    this.apiGetOrders();
  }

  render() {
    const filteredOrders = this.getFilteredOrders();

    return (
      <div className="order-management">
        {/* Header Section */}
        <div className="order-header">
          <div className="header-left">
            <h2>Order Management</h2>
            <p>View and manage customer orders</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="order-filters">
          <div className="search-box">
            <form className="search-form" onSubmit={this.handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search orders by ID or customer name..."
                value={this.state.searchKeyword}
                onChange={(e) => this.setState({ searchKeyword: e.target.value })}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <i className="icon-search"></i>
              </button>
            </form>
          </div>

          <div className="filter-box">
            <select
              value={this.state.filterStatus}
              onChange={(e) => this.setState({ filterStatus: e.target.value })}
              className="status-filter"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((item) => (
                  <tr key={item._id} className="order-row">
                    <td className="order-id">{item._id.substring(0, 8)}...</td>
                    <td className="order-date">
                      {new Date(item.cdate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="order-customer-name">{item.customer?.name || 'N/A'}</td>
                    <td className="order-phone">{item.customer?.phone || 'N/A'}</td>
                    <td className="order-price">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(item.total)}
                    </td>
                    <td className="order-status">
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {this.getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="order-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => this.handleViewDetail(item)}
                        title="View Order Details"
                      >
                        <i className="icon-view"></i>
                      </button>
                      {item.status !== 'APPROVED' && (
                        <button
                          className="action-btn approve-btn"
                          onClick={() => this.handleApprove(item._id)}
                          title="Approve Order"
                        >
                          <i className="icon-approve"></i>
                        </button>
                      )}
                      {item.status !== 'CANCELED' && (
                        <button
                          className="action-btn cancel-btn"
                          onClick={() => this.handleCancel(item._id)}
                          title="Cancel Order"
                        >
                          <i className="icon-cancel"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-message">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        {this.state.showDetail && this.state.selectedOrder && (
          this.renderOrderDetailModal()
        )}
      </div>
    );
  }

  renderOrderDetailModal() {
    const order = this.state.selectedOrder;
    const items = order.items.map((item, index) => (
      <tr key={item.product._id} className="detail-item-row">
        <td>{index + 1}</td>
        <td>{item.product.name}</td>
        <td>
          <img
            src={"data:image/jpg;base64," + item.product.image}
            alt={item.product.name}
            className="detail-product-image"
          />
        </td>
        <td>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(item.product.price)}
        </td>
        <td>{item.quantity}</td>
        <td>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(item.product.price * item.quantity)}
        </td>
      </tr>
    ));

    return (
      <div className="order-detail-modal">
        <div className="modal-backdrop" onClick={() => this.setState({ showDetail: false })}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Order Details</h3>
            <button 
              className="close-btn" 
              onClick={() => this.setState({ showDetail: false })}
            >
              <i className="icon-close"></i>
            </button>
          </div>

          <div className="modal-body">
            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-row">
                <span className="summary-label">Order ID:</span>
                <span className="summary-value">{order._id}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Customer:</span>
                <span className="summary-value">{order.customer?.name || 'N/A'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Phone:</span>
                <span className="summary-value">{order.customer?.phone || 'N/A'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date:</span>
                <span className="summary-value">
                  {new Date(order.cdate).toLocaleString('en-US')}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Status:</span>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {this.getStatusText(order.status)}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Payment Method:</span>
                <span className="summary-value">{this.getPaymentMethodText(order.paymentMethod)}</span>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="shipping-info-section">
              <h4>Shipping Information</h4>
              <div className="shipping-details-grid">
                <div className="shipping-row">
                  <span className="info-label">Recipient:</span>
                  <span className="info-value">{order.shippingAddress?.fullName || order.customer?.name}</span>
                </div>
                <div className="shipping-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{order.shippingAddress?.phone || order.customer?.phone}</span>
                </div>
                <div className="shipping-row">
                  <span className="info-label">Address:</span>
                  <span className="info-value">
                    {order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.district}, ${order.shippingAddress.city}` : 'N/A'}
                  </span>
                </div>
                {order.shippingAddress?.note && (
                  <div className="shipping-row">
                    <span className="info-label">Note:</span>
                    <span className="info-value">{order.shippingAddress.note}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div className="order-items-container">
              <h4>Order Items</h4>
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="order-total">
              <span className="total-label">Total:</span>
              <span className="total-price">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(order.total)}
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => this.setState({ showDetail: false })}
            >
              Close
            </button>
            {order.status !== 'APPROVED' && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  this.handleApprove(order._id);
                  this.setState({ showDetail: false });
                }}
              >
                Approve Order
              </button>
            )}
            {order.status !== 'CANCELED' && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  this.handleCancel(order._id);
                  this.setState({ showDetail: false });
                }}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  getFilteredOrders() {
    let filtered = this.state.orders;

    // Filter by search keyword
    if (this.state.searchKeyword) {
      const keyword = this.state.searchKeyword.toLowerCase();
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(keyword) ||
        order.customer?.name.toLowerCase().includes(keyword)
      );
    }

    // Filter by status
    if (this.state.filterStatus) {
      filtered = filtered.filter(order =>
        order.status === this.state.filterStatus
      );
    }

    return filtered;
  }

  handleViewDetail(order) {
    this.setState({ selectedOrder: order, showDetail: true });
  }

  handleApprove(id) {
    if (window.confirm('Approve this order?')) {
      this.lnkApproveClick(id);
    }
  }

  handleCancel(id) {
    if (window.confirm('Cancel this order?')) {
      this.lnkCancelClick(id);
    }
  }

  handleSearchSubmit = (event) => {
    event.preventDefault();
  }

  // Event handlers
  lnkApproveClick(id) {
    this.apiPutOrderStatus(id, 'APPROVED');
  }

  lnkCancelClick(id) {
    this.apiPutOrderStatus(id, 'CANCELED');
  }

  // APIs
  apiPutOrderStatus(id, status) {
    const body = { status: status };
    const config = { headers: { 'x-access-token': this.context.token } };

    axios.put('/api/order/admin/status/' + id, body, config).then((res) => {
      const result = res.data;
      if (result) {
        alert(`Order ${status.toLowerCase()} successfully!`);
        this.apiGetOrders();
      } else {
        alert('Failed to update order status!');
      }
    }).catch(error => {
      alert('Error updating order!');
      console.error(error);
    });
  }

  apiGetOrders() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/order/admin/list', config).then((res) => {
      const result = res.data;
      this.setState({ orders: result });
    }).catch(error => {
      alert('Error loading orders!');
      console.error(error);
    });
  }
}

export default Order;