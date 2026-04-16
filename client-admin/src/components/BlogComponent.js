import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import BlogDetail from './BlogDetailComponent';
import vi from '../lang/vi';

class Blog extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      itemSelected: null,
      showAddForm: false,
      loading: false,
      errorMessage: ''
    };
  }

  componentDidMount() {
    this.apiGetArticles();
  }

  resolveImage = (image) => {
    if (!image) return '/no-image.png';
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `data:image/jpeg;base64,${image}`;
  };

  render() {
    const articles = this.state.articles;

    return (
      <div className="product-management">
        <div className="product-header">
          <div className="header-left">
            <h2>{vi.blogManagement}</h2>
            <p>Duyệt và quản lý bài viết trên trang web của bạn.</p>
          </div>
          <div className="header-right">
            <button
              className="add-product-btn"
              onClick={() => this.setState({ showAddForm: true, itemSelected: null })}
            >
              <i className="icon-add"></i> {vi.addBlog}
            </button>
          </div>
        </div>

        {this.state.loading && (
          <div className="dashboard-status-message">
            {vi.loadingData}
          </div>
        )}

        {this.state.errorMessage && (
          <div className="dashboard-status-message error">
            {this.state.errorMessage}
          </div>
        )}

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>{vi.image}</th>
                <th>{vi.title}</th>
                <th>{vi.author}</th>
                <th>{vi.date}</th>
                <th>{vi.status}</th>
                <th>{vi.actions}</th>
              </tr>
            </thead>
            <tbody>
              {articles.length > 0 ? articles.map((item) => (
                <tr key={item._id} className="product-row">
                  <td className="product-image-cell">
                    <img
                      src={this.resolveImage(item.image)}
                      alt={item.title}
                      className="product-thumbnail"
                    />
                  </td>
                  <td className="product-name">{item.title}</td>
                  <td className="product-category">{item.author}</td>
                  <td className="product-price">
                    {new Date(item.cdate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="product-status">
                    <span className={`status-badge ${item.active ? 'active' : 'out-of-stock'}`}>
                      {item.active ? vi.active : vi.inactive}
                    </span>
                  </td>
                  <td className="product-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => this.handleEdit(item)}
                      title={vi.editBlog}
                    >
                      <i className="icon-edit"></i>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => this.handleDelete(item)}
                      title={vi.deleteProduct}
                    >
                      <i className="icon-delete"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    {vi.noBlogsFound}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(this.state.itemSelected || this.state.showAddForm) && (
          <BlogDetail
            item={this.state.itemSelected}
            updateBlogs={this.updateBlogs}
            onClose={() => this.setState({ itemSelected: null, showAddForm: false })}
          />
        )}
      </div>
    );
  }

  handleEdit(item) {
    this.setState({ itemSelected: item, showAddForm: false });
  }

  handleDelete(item) {
    if (window.confirm(vi.confirmDeleteBlog)) {
      this.apiDeleteArticle(item._id);
    }
  }

  updateBlogs = () => {
    this.apiGetArticles();
  }

  // APIs
  apiGetArticles() {
    this.setState({ loading: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/blog/admin/list', config).then((res) => {
      this.setState({ articles: res.data, loading: false });
    }).catch((error) => {
      console.error(error);
      this.setState({ loading: false, errorMessage: vi.failedToLoadBlogs });
    });
  }

  apiDeleteArticle(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/blog/admin/delete/' + id, config).then((res) => {
      if (res.data) {
        alert(vi.blogDeletedSuccessfully);
        this.apiGetArticles();
      }
    }).catch(error => {
      console.error(error);
      alert('Error deleting article');
    });
  }
}

export default Blog;
