import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import vi from '../lang/vi';

class Enquiry extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      enquiries: [],
      loading: false
    };
  }

  componentDidMount() {
    this.apiGetEnquiries();
  }

  render() {
    const enquiries = this.state.enquiries;

    return (
      <div className="product-management">
        <div className="product-header">
          <div className="header-left">
            <h2>{vi.enquiryManagement}</h2>
            <p>Xem các tin nhắn từ khách hàng qua form liên hệ.</p>
          </div>
        </div>

        {this.state.loading && (
          <div className="dashboard-status-message">
            {vi.loadingData}
          </div>
        )}

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>{vi.date}</th>
                <th>{vi.customerName}</th>
                <th>Email</th>
                <th>{vi.subject}</th>
                <th>{vi.status}</th>
                <th>{vi.actions}</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length > 0 ? enquiries.map((item) => (
                <tr key={item._id} className="product-row">
                  <td>{new Date(item.cdate).toLocaleDateString('vi-VN')}</td>
                  <td className="product-name">{item.name}</td>
                  <td>{item.email}</td>
                  <td className="product-category">{item.subject}</td>
                  <td className="product-status">
                    <span className={`status-badge ${item.status === 'new' ? 'out-of-stock' : 'in-stock'}`}>
                      {vi[item.status] || item.status}
                    </span>
                  </td>
                  <td className="product-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => alert(`Message: ${item.message}`)}
                      title="Xem tin nhắn"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Không có liên hệ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // APIs
  apiGetEnquiries() {
    this.setState({ loading: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/content/admin/enquiries', config).then((res) => {
      this.setState({ enquiries: res.data, loading: false });
    }).catch((error) => {
      console.error(error);
      this.setState({ loading: false });
    });
  }
}

export default Enquiry;
