import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import withRouter from '../utils/withRouter';
import vi from '../lang/vi';
import './MenuComponent.css';
import MyContext from "../contexts/MyContext";

class Menu extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtKeyword: '',
      loading: true,
      error: null
    };
  }

  render() {
    const { categories, loading, error, txtKeyword } = this.state;
    const { token, customer, mycart } = this.context;

    const cates = categories.map((item) => {
      return (
        <li key={item._id}>
          <Link to={"/product/category/" + (item.slug || item._id)}>
            {item.name}
          </Link>
        </li>
      );
    });

    return (
      <div className="border-bottom" id="main-nav-wrapper">
        <nav className="main-navigation" aria-label="Menu chính" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="float-left">
            <ul className="menu" style={{ margin: 0, padding: 0 }}>
              <li className="menu-item">
                <Link to="/home">{vi.home}</Link>
              </li>

              {/* Category Dropdown */}
              <li className="menu-item dropdown">
                <Link to="#" onClick={(e) => e.preventDefault()}>
                  {vi.categoryLabel} <span className="dropdown-indicator">▼</span>
                </Link>
                <ul className="dropdown-menu">
                  {loading ? (
                    <li className="loading-text">{vi.loadingCategories}</li>
                  ) : error ? (
                    <li className="error-text">{vi.categoriesUnavailable}</li>
                  ) : (
                    cates
                  )}
                </ul>
              </li>

              <li className="menu-item">
                <Link to="/about">{vi.about}</Link>
              </li>
              <li className="menu-item">
                <Link to="/blog">{vi.journal}</Link>
              </li>
              <li className="menu-item">
                <Link to="/contact">{vi.contact}</Link>
              </li>
            </ul>
          </div>

          <div className="float-right">
            <form className="search" onSubmit={this.btnSearchClick}>
              <input
                type="search"
                placeholder={vi.enterKeyword}
                className="keyword"
                value={txtKeyword}
                onChange={(e) => {
                  this.setState({ txtKeyword: e.target.value });
                }}
              />
              <input
                type="submit"
                value={vi.search}
              />
            </form>

            <div className="header-actions">
              {token === "" ? (
                <div className="action-item dropdown">
                  <Link to="#" onClick={(e) => e.preventDefault()} className="header-profile-link">
                     <span className="action-icon">👤</span>
                     <div className="action-text-col">
                       <span className="text-greeting">Tài khoản</span>
                       <span className="text-name">Đăng nhập</span>
                     </div>
                  </Link>
                  <ul className="dropdown-menu user-menu-dropdown">
                    <li><Link to="/login">Đăng nhập</Link></li>
                    <li><Link to="/signup">Đăng ký mới</Link></li>
                  </ul>
                </div>
              ) : (
                <div className="action-item dropdown">
                  <Link to="#" onClick={(e) => e.preventDefault()} className="header-profile-link">
                     <span className="action-icon">👤</span>
                     <div className="action-text-col">
                       <span className="text-greeting">chào</span>
                       <span className="text-name">{customer ? customer.name : ""}</span>
                     </div>
                  </Link>
                  <ul className="dropdown-menu user-menu-dropdown">
                    <li><Link to="/myprofile">Hồ sơ</Link></li>
                    <li><Link to="/myorders">Đơn hàng</Link></li>
                    <li><Link to="/home" onClick={() => this.context.logout()}>Đăng xuất</Link></li>
                  </ul>
                </div>
              )}
              
              <Link to="/mycart" className="action-item header-cart-link">
                <span className="action-icon">🛒</span>
                <div className="action-text-col cart-col">
                  <span className="text-greeting">Giỏ hàng</span>
                  <span className="cart-count">({mycart ? mycart.length : 0})</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="float-clear" />
        </nav>
      </div>
    );
  }

  btnSearchClick = (e) => {
    e.preventDefault();
    const keyword = this.state.txtKeyword.trim();
    if (keyword) {
      this.props.navigate('/product/search/' + encodeURIComponent(keyword));
    }
  };

  componentDidMount() {
    this.apiGetCategories();
  }

  // apis
  apiGetCategories() {
    axios
      .get("/api/category/list")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        this.setState({ categories: data, loading: false });
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        this.setState({ error: error.message, loading: false });
      });
  }
}

export default withRouter(Menu);

