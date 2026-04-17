import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Testimonial extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      itemSelected: null,
      txtId: '',
      txtText: '',
      txtAuthor: '',
      txtRole: '',
      chkActive: true,
      txtOrder: 0
    };
  }

  componentDidMount() {
    this.apiGetItems();
  }

  render() {
    const items = this.state.items.map((item) => (
      <tr key={item._id} className="product-row" onClick={() => this.trItemClick(item)} style={{ cursor: 'pointer' }}>
        <td>{item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text}</td>
        <td style={{ fontWeight: '600' }}>{item.author}</td>
        <td>{item.role}</td>
        <td style={{ textAlign: 'center' }}>{item.order}</td>
        <td>
          <span className={`status-badge ${item.active ? 'in-stock' : 'out-of-stock'}`}>
            {item.active ? 'Hiển thị' : 'Ẩn'}
          </span>
        </td>
      </tr>
    ));

    return (
      <div className="product-management">
        <div className="product-header">
          <div className="header-left">
            <h2>Quản Lý Lời Chứng Thực (Testimonials)</h2>
            <p>Quản lý các nhận xét từ khách hàng hiển thị ở trang chủ.</p>
          </div>
          <div className="header-right">
            <button className="add-product-btn" onClick={() => this.setState({
              itemSelected: null, txtId: '', txtText: '', txtAuthor: '', txtRole: '', chkActive: true, txtOrder: 0
            })}>
              <i className="icon-add"></i> Xoá form / Thêm Mới
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

          {/* Table Panel */}
          <div className="products-table-container" style={{ flex: '1', minWidth: '600px', marginBottom: '0' }}>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Nội dung</th>
                  <th>Tác giả</th>
                  <th>Vai trò</th>
                  <th style={{ textAlign: 'center' }}>Thứ tự</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? items : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      Chưa có đánh giá nào. Vui lòng thêm mới!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Form Panel */}
          <div style={{
            width: '350px',
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            <h3 style={{ margin: '0 0 20px', color: '#4B3621', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              {this.state.itemSelected ? 'Chỉnh sửa' : 'Thêm nhận xét mới'}
            </h3>

            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {this.state.txtId && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#666', fontSize: '0.9rem' }}>ID</label>
                  <input type="text" value={this.state.txtId} readOnly
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', color: '#999', boxSizing: 'border-box' }} />
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4B3621' }}>Nội dung <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  value={this.state.txtText}
                  onChange={(e) => this.setState({ txtText: e.target.value })}
                  rows="4"
                  placeholder="Nhập cảm nhận của khách..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4B3621' }}>Khách hàng <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  value={this.state.txtAuthor}
                  onChange={(e) => this.setState({ txtAuthor: e.target.value })}
                  placeholder="Trần Văn A"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4B3621' }}>Vai trò / Danh xưng</label>
                <input
                  type="text"
                  value={this.state.txtRole}
                  onChange={(e) => this.setState({ txtRole: e.target.value })}
                  placeholder="Ví dụ: Khách vãng lai"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4B3621' }}>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={this.state.txtOrder}
                    onChange={(e) => this.setState({ txtOrder: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '25px' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', color: '#4B3621' }}>
                    <input
                      type="checkbox"
                      checked={this.state.chkActive}
                      onChange={(e) => this.setState({ chkActive: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#C6A769' }}
                    />
                    Cho phép hiện
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {!this.state.itemSelected ? (
                  <button onClick={() => this.btnAddClick()} style={{ flex: 1, backgroundColor: '#4B3621', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    Thêm mới
                  </button>
                ) : (
                  <>
                    <button onClick={() => this.btnUpdateClick()} style={{ flex: 1, backgroundColor: '#C6A769', color: '#4B3621', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      Cập nhật
                    </button>
                    <button onClick={() => this.btnDeleteClick()} style={{ backgroundColor: '#ffebee', color: '#c62828', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      Xoá
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>

        </div>
      </div>
    );
  }

  trItemClick(item) {
    this.setState({
      itemSelected: item,
      txtId: item._id,
      txtText: item.text,
      txtAuthor: item.author,
      txtRole: item.role,
      chkActive: item.active,
      txtOrder: item.order
    });
  }

  btnAddClick() {
    const { txtText, txtAuthor, txtRole, chkActive, txtOrder } = this.state;
    if (txtText && txtAuthor) {
      const item = { text: txtText, author: txtAuthor, role: txtRole, active: chkActive, order: parseInt(txtOrder) };
      this.apiPostItem(item);
    } else {
      alert('Vui lòng nhập Nội dung và Tác giả');
    }
  }

  btnUpdateClick() {
    const { txtId, txtText, txtAuthor, txtRole, chkActive, txtOrder } = this.state;
    if (txtId && txtText && txtAuthor) {
      const item = { _id: txtId, text: txtText, author: txtAuthor, role: txtRole, active: chkActive, order: parseInt(txtOrder) };
      this.apiPutItem(item);
    } else {
      alert('Vui lòng chọn 1 mục và điền đủ thông tin');
    }
  }

  btnDeleteClick() {
    if (window.confirm('BẠN CÓ CHẮC MUỐN XÓA?')) {
      const { txtId } = this.state;
      if (txtId) {
        this.apiDeleteItem(txtId);
      } else {
        alert('Vui lòng chọn 1 mục để xóa');
      }
    }
  }

  // APIs
  apiGetItems() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/testimonial/admin/list', config).then((res) => {
      this.setState({ items: res.data });
    });
  }

  apiPostItem(item) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/testimonial/admin/add', item, config).then((res) => {
      if (res.data) {
        alert('THÊM THÀNH CÔNG');
        this.apiGetItems();
      }
    });
  }

  apiPutItem(item) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/testimonial/admin/update/' + item._id, item, config).then((res) => {
      if (res.data) {
        alert('CẬP NHẬT THÀNH CÔNG!');
        this.apiGetItems();
      }
    });
  }

  apiDeleteItem(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/testimonial/admin/delete/' + id, config).then((res) => {
      if (res.data) {
        alert('XOÁ THÀNH CÔNG!');
        this.apiGetItems();
        this.setState({ itemSelected: null, txtId: '', txtText: '', txtAuthor: '', txtRole: '' });
      }
    });
  }
}

export default Testimonial;
