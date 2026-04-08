import { Component } from "react";
import MyContext from "../contexts/MyContext";
import Home from "./HomeComponent";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Category from "./CategoryComponent";
import Product from "./ProductComponent";
import Order from './OrderComponent';
import Customer from './CustomerComponent';
import Banner from './BannerComponent';
import Blog from './BlogComponent';
import Content from './ContentComponent';
import Settings from './SettingsComponent';
import Enquiry from './EnquiryComponent';
import Testimonial from './TestimonialComponent';
import withRouter from "../utils/withRouter";
import vi from '../lang/vi';

class Main extends Component {
  static contextType = MyContext;

  getPageTitle() {
    const path = this.props.location ? this.props.location.pathname : window.location.pathname;
    switch (path) {
      case '/admin/home':     return vi.home;
      case '/admin/category': return vi.category;
      case '/admin/product':  return vi.product;
      case '/admin/order':    return vi.order;
      case '/admin/customer': return vi.customer;
      case '/admin/banner':   return vi.banner;
      case '/admin/blog':     return vi.blog;
      case '/admin/content':  return vi.content;
      case '/admin/settings': return vi.settings;
      case '/admin/enquiry':  return vi.enquiry;
      case '/admin/testimonial': return 'Đánh Giá / Lời Chứng Thực';
      default:                return 'Admin Dashboard';
    }
  }

  render() {
    if (this.context.token !== "") {
      const path = this.props.location ? this.props.location.pathname : window.location.pathname;

      return (
        <div className="dashboard-container">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-header">
              <h3>Admin Panel</h3>
            </div>
            <nav className="sidebar-nav">
              <Link to="/admin/home" className={`sidebar-link ${path === '/admin/home' ? 'active' : ''}`}>
                <i className="icon-dashboard"></i> {vi.home}
              </Link>
              <div className="nav-group-label">E-COMMERCE</div>
              <Link to="/admin/category" className={`sidebar-link ${path === '/admin/category' ? 'active' : ''}`}>
                <i className="icon-category"></i> {vi.category}
              </Link>
              <Link to="/admin/product" className={`sidebar-link ${path === '/admin/product' ? 'active' : ''}`}>
                <i className="icon-product"></i> {vi.product}
              </Link>
              <Link to="/admin/order" className={`sidebar-link ${path === '/admin/order' ? 'active' : ''}`}>
                <i className="icon-order"></i> {vi.order}
              </Link>
              <Link to="/admin/customer" className={`sidebar-link ${path === '/admin/customer' ? 'active' : ''}`}>
                <i className="icon-customer"></i> {vi.customer}
              </Link>

              <div className="nav-group-label">CONTENT CMS</div>
              <Link to="/admin/banner" className={`sidebar-link ${path === '/admin/banner' ? 'active' : ''}`}>
                <i className="icon-banner"></i> {vi.banner}
              </Link>
              <Link to="/admin/blog" className={`sidebar-link ${path === '/admin/blog' ? 'active' : ''}`}>
                <i className="icon-blog"></i> {vi.blog}
              </Link>
              <Link to="/admin/content" className={`sidebar-link ${path === '/admin/content' ? 'active' : ''}`}>
                <i className="icon-content"></i> {vi.content}
              </Link>
              <Link to="/admin/testimonial" className={`sidebar-link ${path === '/admin/testimonial' ? 'active' : ''}`}>
                <i className="icon-enquiry"></i> Đánh Giá
              </Link>
              <Link to="/admin/enquiry" className={`sidebar-link ${path === '/admin/enquiry' ? 'active' : ''}`}>
                <i className="icon-enquiry"></i> {vi.enquiry}
              </Link>
              <Link to="/admin/settings" className={`sidebar-link ${path === '/admin/settings' ? 'active' : ''}`}>
                <i className="icon-settings"></i> {vi.settings}
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {/* Top Bar */}
            <div className="top-bar">
              <div className="top-bar-left">
                <h1>{this.getPageTitle()}</h1>
              </div>
              <div className="top-bar-right">
                <span>{vi.hello} <b>{this.context.username}</b></span>
                <button
                  className="logout-btn"
                  onClick={() => {
                    this.context.logout();
                    window.location.href = '/admin';
                  }}
                >
                  {vi.logout}
                </button>
              </div>
            </div>

            {/* Page Content */}
            <div className="page-content">
              <Routes>
                <Route path="/admin" element={<Navigate replace to="/admin/home" />} />
                <Route path="/admin/home"     element={<Home />} />
                <Route path="/admin/category" element={<Category />} />
                <Route path="/admin/product"  element={<Product />} />
                <Route path="/admin/order"    element={<Order />} />
                <Route path="/admin/customer" element={<Customer />} />
                <Route path="/admin/banner"   element={<Banner />} />
                <Route path="/admin/blog"     element={<Blog />} />
                <Route path="/admin/content"  element={<Content />} />
                <Route path="/admin/testimonial" element={<Testimonial />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="/admin/enquiry"  element={<Enquiry />} />
              </Routes>
            </div>
          </div>
        </div>
      );
    }

    return <div />;
  }
}

export default withRouter(Main);
