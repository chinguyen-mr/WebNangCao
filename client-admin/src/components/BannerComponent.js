import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import BannerDetail from './BannerDetailComponent';
import vi from '../lang/vi';

class Banner extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      banners: [],
      itemSelected: null,
      showAddForm: false,
      loading: false,
      errorMessage: ''
    };
  }

  componentDidMount() {
    this.apiGetBanners();
  }

  resolveImage = (image) => {
    if (!image) return '/no-image.png';
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `data:image/jpeg;base64,${image}`;
  };

  render() {
    const banners = this.state.banners;

    return (
      <div className="product-management">
        <div className="product-header">
          <div className="header-left">
            <h2>{vi.bannerManagement}</h2>
            <p>{vi.manageYourProductCatalog}</p> {/* Reusing similar subtitle logic */}
          </div>
          <div className="header-right">
            <button
              className="add-product-btn"
              onClick={() => this.setState({ showAddForm: true, itemSelected: null })}
            >
              <i className="icon-add"></i> {vi.addBanner}
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
                <th>Nhãn</th>
                <th>{vi.title}</th>
                <th>{vi.subtitle}</th>
                <th>{vi.sortOrder}</th>
                <th>{vi.status}</th>
                <th>{vi.actions}</th>
              </tr>
            </thead>
            <tbody>
              {banners.length > 0 ? banners.map((item) => (
                <tr key={item._id} className="product-row">
                  <td className="product-image-cell">
                    <img
                      src={this.resolveImage(item.image)}
                      alt={item.title}
                      className="product-thumbnail"
                    />
                  </td>
                  <td className="product-name">{item.label || '-'}</td>
                  <td className="product-name">{item.title}</td>
                  <td className="product-category">{item.subtitle}</td>
                  <td className="product-price">{item.order}</td>
                  <td className="product-status">
                    <span className={`status-badge ${item.active ? 'active' : 'out-of-stock'}`}>
                      {item.active ? vi.active : vi.inactive}
                    </span>
                  </td>
                  <td className="product-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => this.handleEdit(item)}
                      title={vi.editBanner}
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
                  <td colSpan="7" className="empty-state">
                    {vi.noBannersFound}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(this.state.itemSelected || this.state.showAddForm) && (
          <BannerDetail
            item={this.state.itemSelected}
            updateBanners={this.updateBanners}
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
    if (window.confirm(vi.confirmDeleteBanner)) {
      this.apiDeleteBanner(item._id);
    }
  }

  updateBanners = () => {
    this.apiGetBanners();
  }

  // APIs
  apiGetBanners() {
    this.setState({ loading: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/banner/admin/list', config).then((res) => {
      this.setState({ banners: res.data, loading: false });
    }).catch((error) => {
      console.error(error);
      this.setState({ loading: false, errorMessage: vi.failedToLoadBanners });
    });
  }

  apiDeleteBanner(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/banner/admin/delete/' + id, config).then((res) => {
      if (res.data) {
        alert(vi.bannerDeletedSuccessfully);
        this.apiGetBanners();
      }
    }).catch(error => {
      console.error(error);
      alert('Error deleting banner');
    });
  }
}

export default Banner;
