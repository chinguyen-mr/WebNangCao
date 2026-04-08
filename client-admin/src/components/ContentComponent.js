import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import SimpleRichEditor from './SimpleRichEditor';

class Content extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtBody: '',
      loading: true,
      saving: false,
      message: '',
      messageType: '', // 'success' or 'error'
    };
  }

  componentDidMount() {
    this.apiGetAboutContent();
  }

  render() {
    return (
      <div className="product-management">
        <div className="product-header">
          <div className="header-left">
            <h2>Nội Dung: Giới Thiệu (About Us)</h2>
            <p>Viết câu chuyện thương hiệu của bạn tại đây.</p>
          </div>
          <div className="header-right">
            <button
              className="add-product-btn"
              onClick={() => this.apiSaveContent()}
              disabled={this.state.saving}
            >
              <i className="icon-edit"></i> {this.state.saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>

        {this.state.message && (
          <div className={`dashboard-status-message ${this.state.messageType === 'error' ? 'error' : 'success'}`} style={{ backgroundColor: this.state.messageType === 'error' ? '#fbeaea' : '#eafcef', color: this.state.messageType === 'error' ? '#8B0000' : '#1e5f32', borderColor: this.state.messageType === 'error' ? '#eebdbd' : '#8ddda4' }}>
            {this.state.message}
          </div>
        )}

        <div className="products-table-container form-container" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px' }}>
          {this.state.loading ? (
             <div className="loading-text">Đang tải nội dung...</div>
          ) : (
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Câu Chuyện Của Chúng Tôi (Trình soạn thảo trực quan)</label>
              <SimpleRichEditor 
                value={this.state.txtBody} 
                onChange={(html) => this.setState({ txtBody: html })}
                disabled={this.state.saving}
              />
              <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#6B6B6B' }}>
                *Sử dụng thanh công cụ bên trên để định dạng văn bản, chèn ảnh hoặc liên kết. Nội dung sẽ được hiển thị chính xác như trên trên trang khách hàng.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // APIs
  apiGetAboutContent() {
    this.setState({ loading: true, message: '' });
    axios.get('/api/content/page/about')
      .then((res) => {
        this.setState({ txtBody: res.data.body || '', loading: false });
      })
      .catch((error) => {
        console.error(error);
        this.setState({ loading: false, message: 'Lỗi tải dữ liệu', messageType: 'error' });
      });
  }

  apiSaveContent() {
    this.setState({ saving: true, message: '' });
    
    // Construct the payload required by POST /api/content/admin/update
    const payload = {
      slug: 'about',
      title: 'Giới thiệu',
      body: this.state.txtBody,
      type: 'page'
    };

    const config = { headers: { 'x-access-token': this.context.token } };
    
    axios.post('/api/content/admin/update', payload, config)
      .then((res) => {
        if (res.data.success) {
          this.setState({ saving: false, message: 'Lưu thay đổi thành công! Trang khách hàng đã được cập nhật.', messageType: 'success' });
          setTimeout(() => this.setState({ message: '' }), 5000);
        } else {
          this.setState({ saving: false, message: 'Lưu thất bại.', messageType: 'error' });
        }
      })
      .catch((error) => {
        console.error(error);
        this.setState({ saving: false, message: 'Lỗi kết nối máy chủ.', messageType: 'error' });
      });
  }
}

export default Content;
