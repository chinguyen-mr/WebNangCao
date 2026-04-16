import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import CmsService from '../services/CmsService';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {},
      loading: true
    };
  }

  async componentDidMount() {
    try {
      const settings = await CmsService.getSettings('general');
      this.setState({ settings, loading: false });
    } catch (error) {
      console.error('Error loading footer settings');
      this.setState({ loading: false });
    }
  }

  render() {
    const { settings } = this.state;
    const currentYear = new Date().getFullYear();

    return (
      <footer className="footer">
        <div className="footer-content">
          {/* Brand section */}
          <div className="footer-section">
            <h4>{settings.siteName || 'Trầm Tịnh'}</h4>
            <p>
              {settings.siteDescription || 
                'Nhà tuyển chọn và phân phối trầm hương cao cấp. Tận tâm với sự xuất sắc trong nguồn gốc, tính xác thực và phát triển bền vững.'}
            </p>
            <div className="social-links">
              {settings.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" title="Facebook">f</a>}
              {settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" title="Instagram">in</a>}
              {settings.zaloUrl && <a href={settings.zaloUrl} target="_blank" rel="noopener noreferrer" title="Zalo">Z</a>}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Liên Kết Nhanh</h4>
            <nav aria-label="Liên kết nhanh">
              <ul>
                <li><Link to="/home">Trang Chủ</Link></li>
                <li><Link to="/product">Tất Cả Sản Phẩm</Link></li>
                <li><Link to="/mycart">Giỏ Hàng</Link></li>
                <li><Link to="/myorders">Lịch Sử Đơn Hàng</Link></li>
                <li><Link to="/myprofile">Tài Khoản Của Tôi</Link></li>
                <li><Link to="/about">Giới Thiệu</Link></li>
              </ul>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h4>Hỗ Trợ Khách Hàng</h4>
            <ul>
              <li><Link to="/contact">Liên Hệ Hỗ Trợ</Link></li>
              <li><Link to="/blog">Blog & Kiến Thức</Link></li>
              <li><a href="#shipping">Giao Hàng & Vận Chuyển</a></li>
              <li><a href="#returns">Đổi Trả Hàng</a></li>
              <li><a href="#faq">Câu Hỏi Thường Gặp</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section footer-contact">
            <h4>Liên Hệ</h4>
            <p>
              <strong>Điện Thoại</strong><br />
              {settings.contactPhone || '+84 (28) 3800 0000'}
            </p>
            <p>
              <strong>Email</strong><br />
              {settings.contactEmail || 'hotro@tramtinh.vn'}
            </p>
            <p>
              <strong>Địa Chỉ</strong><br />
              {settings.contactAddress || '123 Đường Cổ Mộc, TP. Hồ Chí Minh'}
            </p>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p>
            &copy; {currentYear} {settings.siteName || 'Trầm Tịnh'}. {settings.footerText || 'Tất cả quyền được bảo lưu.'}&nbsp;
            <a href="#terms">Điều Khoản</a> •&nbsp;
            <a href="#privacy">Bảo Mật</a>
          </p>
        </div>
      </footer>
    );
  }
}

export default Footer;
