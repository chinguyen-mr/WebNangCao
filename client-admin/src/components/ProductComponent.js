import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';
import vi from '../lang/vi';

class Product extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      categories: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null,
      searchKeyword: '',
      selectedCategory: '',
      showAddForm: false,
      loading: false,
      errorMessage: ''
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    this.setState({ loading: true, errorMessage: '' }, () => {
      this.apiGetProducts(this.state.curPage);
      this.apiGetCategories();
    });
  }

  resolveImage = (image) => {
    if (!image) return '/no-image.png';
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `data:image/jpeg;base64,${image}`;
  };

  render() {
    const filteredProducts = this.getFilteredProducts();

    return (
      <div className="product-management">
        {/* Header Section */}
        <div className="product-header">
          <div className="header-left">
            <h2>{vi.productManagement}</h2>
            <p>{vi.manageYourProductCatalog}</p>
          </div>
          <div className="header-right">
            <button
              className="add-product-btn"
              onClick={() => this.setState({ showAddForm: true, itemSelected: null })}
            >
              <i className="icon-add"></i> {vi.addProduct}
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="product-filters">
          <div className="search-box">
            <form className="search-form" onSubmit={this.handleSearchSubmit}>
              <input
                type="text"
                placeholder={vi.searchProducts}
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
              value={this.state.selectedCategory}
              onChange={(e) => this.setState({ selectedCategory: e.target.value })}
              className="category-filter"
            >
              <option value="">{vi.allCategories}</option>
              {this.state.categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {this.state.loading && (
          <div className="dashboard-status-message">
            {vi.loadingProducts}
          </div>
        )}

        {this.state.errorMessage && (
          <div className="dashboard-status-message error">
            {this.state.errorMessage}
          </div>
        )}

        <div className="products-summary">
          {filteredProducts.length > 0 ? (
            <span>{vi.productsFound.replace('{count}', filteredProducts.length)}</span>
          ) : null}
        </div>

        {/* Products Table */}
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>{vi.image}</th>
                <th>{vi.name}</th>
                <th>{vi.category}</th>
                <th>{vi.price}</th>
                <th>Số lượng</th>
                <th>{vi.status}</th>
                <th>{vi.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? filteredProducts.map((item) => {
                const statusLabel = item.status
                  ? item.status
                  : typeof item.stock === 'number'
                    ? item.stock > 0
                      ? vi.inStock
                      : vi.outOfStock
                    : vi.active;

                const statusClass = item.status
                  ? item.status.toLowerCase().includes('out')
                    ? 'out-of-stock'
                    : 'in-stock'
                  : typeof item.stock === 'number'
                    ? item.stock > 0
                      ? 'in-stock'
                      : 'out-of-stock'
                    : 'active';

                // Pick first image from array or singular image field
                const imgSource = Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : item.image;

                return (
                  <tr key={item._id} className="product-row">
                    <td className="product-image-cell">
                      <img
                        src={this.resolveImage(imgSource)}
                        alt={item.name}
                        className="product-thumbnail"
                      />
                    </td>
                    <td className="product-name">{item.name}</td>
                    <td className="product-category">{item.category?.name || vi.na}</td>
                    <td className="product-price">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(item.price)}
                    </td>
                    <td className="product-stock" style={{ textAlign: 'center', fontWeight: 'bold', color: item.stock > 0 ? 'var(--primary-color)' : '#cf1322' }}>
                      {item.stock !== undefined ? item.stock : 0}
                    </td>
                    <td className="product-status">
                      <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                    </td>
                    <td className="product-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => this.handleEdit(item)}
                        title={vi.editProduct}
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
                );
              }) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    {vi.noProductsFound}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {this.state.noPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={this.state.curPage === 1}
              onClick={() => this.handlePageChange(this.state.curPage - 1)}
            >
              {vi.previous}
            </button>

            {Array.from({ length: this.state.noPages }, (_, index) => (
              <button
                key={index + 1}
                className={`page-btn ${this.state.curPage === index + 1 ? 'active' : ''}`}
                onClick={() => this.handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={this.state.curPage === this.state.noPages}
              onClick={() => this.handlePageChange(this.state.curPage + 1)}
            >
              {vi.next}
            </button>
          </div>
        )}

        {/* Product Detail Modal/Form */}
        {(this.state.itemSelected || this.state.showAddForm) && (
          <ProductDetail
            item={this.state.itemSelected}
            curPage={this.state.curPage}
            updateProducts={this.updateProducts}
            onClose={() => this.setState({ itemSelected: null, showAddForm: false })}
          />
        )}
      </div>
    );
  }

  getFilteredProducts() {
    let filtered = this.state.products;

    // Filter by search keyword
    if (this.state.searchKeyword) {
      const keyword = this.state.searchKeyword.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(keyword) ||
        product.category?.name?.toLowerCase().includes(keyword)
      );
    }

    // Filter by category
    if (this.state.selectedCategory) {
      filtered = filtered.filter(product =>
        product.category?._id === this.state.selectedCategory
      );
    }

    return filtered;
  }

  handleEdit(item) {
    this.setState({ itemSelected: item, showAddForm: false });
  }

  handleDelete(item) {
    if (window.confirm(vi.confirmDeleteProduct.replace('{name}', item.name))) {
      this.apiDeleteProduct(item._id);
    }
  }

  handleSearchSubmit = (event) => {
    event.preventDefault();
  }

  handlePageChange(page) {
    this.apiGetProducts(page);
  }

  updateProducts = (products, noPages, curPage) => {
    if (!products || products.length === 0) {
      this.loadData();
      return;
    }

    this.setState({ products: products, noPages: noPages, curPage: curPage || this.state.curPage });
  }

  // APIs
  apiGetProducts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/product/admin/list?page=' + page, config).then((res) => {
      const result = res.data;
      this.setState({
        products: result.products,
        noPages: result.noPages,
        curPage: result.curPage,
        loading: false,
        errorMessage: ''
      });
    }).catch((error) => {
      console.error('Failed to load products:', error);
      this.setState({
        loading: false,
        errorMessage: vi.failedToLoadProducts
      });
    });
  }

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/category/admin/list', config).then((res) => {
      const result = res.data;
      this.setState({ categories: result });
    }).catch((error) => {
      console.error('Failed to load categories:', error);
      this.setState({ categories: [] });
    });
  }

  apiDeleteProduct(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/product/admin/delete/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert(vi.productDeletedSuccessfully);
        this.loadData(); // Reload data
      } else {
        alert(vi.failedToDeleteProduct);
      }
    }).catch(error => {
      alert('Error deleting product!');
      console.error(error);
    });
  }
}

export default Product;