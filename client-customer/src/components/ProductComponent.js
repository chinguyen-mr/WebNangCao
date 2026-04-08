import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import vi from '../lang/vi';
import SeoUtil from '../utils/SeoUtil';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      categories: [],
      loading: true,
      error: null,
      sortBy: 'newest',
      selectedCategory: '',
      searchKeyword: '',
      currentPage: 1,
      itemsPerPage: 12,
      totalProducts: 0
    };
  }

  componentDidMount() {
    this.loadCategories();
    this.loadProducts();
  }

  componentDidUpdate(prevProps) {
    const params = this.props.params;
    const prevParams = prevProps.params;

    if (params.cid !== prevParams.cid || params.keyword !== prevParams.keyword) {
      this.loadProducts();
    }
  }

  updatePageSeo = () => {
    const params = this.props.params;
    const { categories } = this.state;

    let title = vi.productAgarwoodTitle;
    let description = vi.productListingMetaDesc;

    if (params.cid) {
      const category = categories.find(cat => cat._id === params.cid);
      if (category) {
        title = `Sản phẩm ${category.name} | Trầm Tịnh`;
        description = `Khám phá sản phẩm trầm hương danh mục ${category.name} từ Trầm Tịnh với chất lượng vượt trội và mô tả chi tiết.`;
      } else {
        title = `Danh mục | ${vi.productAgarwoodTitle}`;
        description = vi.productListingMetaDesc;
      }
    } else if (params.keyword) {
      title = `${vi.searchResultsFor} "${params.keyword}" | Trầm Tịnh`;
      description = `${vi.searchResultsFor} "${params.keyword}" trong bộ sưu tập trầm hương cao cấp của Trầm Tịnh.`;
    }

    SeoUtil.updatePageMeta({ title, description });
  };

  loadCategories = () => {
    axios.get('/api/category/list')
      .then((res) => {
        this.setState({ categories: res.data }, () => {
          this.updatePageSeo();
        });
      })
      .catch((error) => {
        console.error('Error loading categories:', error);
      });
  };

  loadProducts = () => {
    const params = this.props.params;
    this.setState({ loading: true, error: null });

    if (params.cid) {
      this.apiGetProductsByCatID(params.cid);
    } else if (params.keyword) {
      this.apiGetProductsByKeyword(params.keyword);
    } else {
      this.apiGetAllProducts();
    }
  };

  safeValue = (obj, path, defaultValue = '') => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  formatVND = (price) => {
    if (!price || isNaN(price)) return vi.contactForPrice;
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
  };

  stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  resolveImage = (image) => {
    if (!image) return null;
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `data:image/jpeg;base64,${image}`;
  };

  getSortedProducts = (products) => {
    const { sortBy } = this.state;
    let sorted = [...products];

    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'name-asc') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'name-desc') {
      sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => (new Date(b.cdate || 0) - new Date(a.cdate || 0)));
    }

    return sorted;
  };

  handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    this.setState({ selectedCategory: categoryId, currentPage: 1 });

    if (categoryId) {
      const category = this.state.categories.find(cat => cat._id === categoryId);
      const identifier = category?.slug || categoryId;
      this.props.navigate(`/product/category/${identifier}`);
    } else {
      this.props.navigate('/product');
    }
  };

  handleSearchChange = (e) => {
    this.setState({ searchKeyword: e.target.value });
  };

  handleSearchSubmit = (e) => {
    e.preventDefault();
    const { searchKeyword } = this.state;
    if (searchKeyword.trim()) {
      this.props.navigate(`/product/search/${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  handleSortChange = (e) => {
    this.setState({ sortBy: e.target.value });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  apiGetAllProducts = () => {
    axios.get('/api/product/list/new')
      .then((res) => {
        const products = Array.isArray(res.data) ? res.data : [];
        this.setState({
          products,
          totalProducts: products.length,
          loading: false,
          currentPage: 1
        }, () => this.updatePageSeo());
      })
      .catch((error) => {
        console.error('Error fetching all products:', error);
        this.setState({
          error: error.message || vi.errorLoadingProducts,
          loading: false
        });
      });
  };

  apiGetProductsByCatID = (cid) => {
    axios.get('/api/product/list/category/' + cid)
      .then((res) => {
        const products = Array.isArray(res.data) ? res.data : [];
        this.setState({
          products,
          totalProducts: products.length,
          loading: false,
          currentPage: 1
        }, () => this.updatePageSeo());
      })
      .catch((error) => {
        console.error('Error fetching products by category:', error);
        this.setState({
          error: error.message || vi.errorLoadingProducts,
          loading: false
        });
      });
  };

  apiGetProductsByKeyword = (keyword) => {
    axios.get('/api/product/list/search/' + keyword)
      .then((res) => {
        const products = Array.isArray(res.data) ? res.data : [];
        this.setState({
          products,
          totalProducts: products.length,
          loading: false,
          currentPage: 1,
          searchKeyword: keyword
        }, () => this.updatePageSeo());
      })
      .catch((error) => {
        console.error('Error searching products:', error);
        this.setState({
          error: error.message || vi.errorLoadingProducts,
          loading: false
        });
      });
  };

  render() {
    const {
      products,
      categories,
      loading,
      error,
      sortBy,
      selectedCategory,
      searchKeyword,
      currentPage,
      itemsPerPage
    } = this.state;

    if (loading) {
      return (
        <div className="product-list-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{vi.loadingProducts}</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="product-list-container">
          <div className="error-message">
            <h2>⚠️ {vi.errorLoadingProducts}</h2>
            <p>{error}</p>
            <Link to="/home" className="btn-back-home">
              {vi.backToHome}
            </Link>
          </div>
        </div>
      );
    }

    const sortedProducts = this.getSortedProducts(products);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    const getTitle = () => {
      const params = this.props.params;
      if (params.cid) {
        const category = categories.find(cat => cat._id === params.cid);
        return category ? `${vi.productsInCategory} "${category.name}"` : vi.allProducts;
      }
      if (params.keyword) return `${vi.searchResultsFor} "${params.keyword}"`;
      return vi.allProducts;
    };

    return (
      <div className="product-list-container">
        <div className="product-list-header">
          <h1>{getTitle()}</h1>
          <p className="product-count">
            {sortedProducts.length} {vi.productsFound}
          </p>
        </div>

        <div className="product-filters">
          <form onSubmit={this.handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder={vi.searchPlaceholder}
              value={searchKeyword}
              onChange={this.handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </form>

          <div className="filter-group">
            <label htmlFor="category-select">{vi.categoryLabel}:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={this.handleCategoryChange}
              className="category-select"
            >
              <option value="">{vi.allCategories}</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {this.safeValue(category, 'name', 'Unknown Category')}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-select">{vi.sortBy}:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={this.handleSortChange}
              className="sort-select"
            >
              <option value="newest">{vi.sortNewest}</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
              <option value="name-asc">Tên: A → Z</option>
              <option value="name-desc">Tên: Z → A</option>
            </select>
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="no-products">
            <h2>{vi.noProductsFound}</h2>
            <p>{vi.tryAdjustSearch || 'Thử điều chỉnh tìm kiếm hoặc duyệt các danh mục của chúng tôi.'}</p>
            <Link to="/home" className="btn-browse-home">
              {vi.browseHome}
            </Link>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {paginatedProducts.map((item) => {
                const imageSource = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image;
                const imgSrc = this.resolveImage(imageSource);
                const discount = item.discount || 0;
                const originalPrice = item.price || 0;
                const finalPrice = originalPrice * (1 - discount / 100);

                return (
                  <div key={item._id || Math.random()} className="product-card">
                    <div className="product-image">
                      <Link to={`/product/${item.slug || item._id}`}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={this.safeValue(item, 'name', 'Product')}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                      </Link>

                      {discount > 0 && (
                        <span className="product-discount-badge">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">
                        {this.safeValue(item, 'name', 'Unnamed Product')}
                      </h3>

                      <p className="product-description">
                        {this.stripHtml(this.safeValue(item, 'description', 'Sản phẩm trầm hương cao cấp'))}
                      </p>

                      <div className="product-footer">
                        <div className="product-price">
                          <span className="price-current">
                            {this.formatVND(finalPrice)}
                          </span>
                          {discount > 0 && (
                            <span className="price-original">
                              {this.formatVND(originalPrice)}
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/product/${item.slug || item._id}`}
                          className="btn-view-details"
                        >
                          {vi.viewDetails}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => this.handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  {vi.prevPage}
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 ||
                             page === totalPages ||
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="pagination-dots">...</span>
                        )}
                        <button
                          onClick={() => this.handlePageChange(page)}
                          className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => this.handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  {vi.nextPage}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}

export default withRouter(Product);