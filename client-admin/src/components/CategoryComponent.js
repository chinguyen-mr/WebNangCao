import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CategoryDetail from './CategoryDetailComponent';

class Category extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null,
      searchKeyword: '',
      showAddForm: false
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  resolveImage = (image) => {
    if (!image) return null;
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `data:image/jpeg;base64,${image}`;
  };

  render() {
    const filteredCategories = this.getFilteredCategories();

    return (
      <div className="category-management">
        {/* Header Section */}
        <div className="category-header">
          <div className="header-left">
            <h2>Quản lý danh mục</h2>
            <p>Quản lý danh mục sản phẩm</p>
          </div>
          <div className="header-right">
            <button
              className="add-category-btn"
              onClick={() => this.setState({ showAddForm: true, itemSelected: null })}
            >
              <i className="icon-add"></i> Thêm danh mục
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="category-search">
          <div className="search-box">
            <form className="search-form" onSubmit={this.handleSearchSubmit}>
              <input
                type="text"
                placeholder="Tìm kiếm danh mục..."
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

        {/* Categories Table */}
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Số sản phẩm</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((item) => (
                  <tr key={item._id} className="category-row">
                    <td className="category-image-cell">
                      {item.image ? (
                        <img src={this.resolveImage(item.image)} alt={item.name} className="category-thumbnail" />
                      ) : (
                        <div className="category-thumbnail placeholder">No Image</div>
                      )}
                    </td>
                    <td className="category-name">
                      <span className="category-badge">{item.name}</span>
                    </td>
                    <td className="category-count">
                      {item.products?.length ?? item.count ?? item.productCount ?? 'N/A'}
                    </td>
                    <td className="category-date">
                      {new Date(item.cdate || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="category-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => this.handleEdit(item)}
                        title="Edit Category"
                      >
                        <i className="icon-edit"></i>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => this.handleDelete(item)}
                        title="Delete Category"
                      >
                        <i className="icon-delete"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-message">Không tìm thấy danh mục nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Category Detail Modal/Form */}
        {(this.state.itemSelected || this.state.showAddForm) && (
          <CategoryDetail
            item={this.state.itemSelected}
            updateCategories={this.updateCategories}
            onClose={() => this.setState({ itemSelected: null, showAddForm: false })}
          />
        )}
      </div>
    );
  }

  getFilteredCategories() {
    let filtered = this.state.categories;

    // Filter by search keyword
    if (this.state.searchKeyword) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(this.state.searchKeyword.toLowerCase())
      );
    }

    return filtered;
  }

  handleEdit(item) {
    this.setState({ itemSelected: item, showAddForm: false });
  }

  handleDelete(item) {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${item.name}" không?`)) {
      this.apiDeleteCategory(item._id);
    }
  }

  handleSearchSubmit = (event) => {
    event.preventDefault();
  }

  updateCategories = () => {
    this.setState({ itemSelected: null, showAddForm: false }, () => {
      this.apiGetCategories();
    });
  }

  // APIs
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/category/admin/list', config).then((res) => {
      const result = res.data;
      this.setState({ categories: result });
    }).catch(error => {
      alert('Lỗi tải danh mục!');
      console.error(error);
    });
  }

  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/category/admin/delete/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('Xóa danh mục thành công!');
        this.apiGetCategories(); // Reload data
      } else {
        alert('Không thể xóa danh mục!');
      }
    }).catch(error => {
      alert('Lỗi khi xóa danh mục!');
      console.error(error);
    });
  }
}
export default Category;