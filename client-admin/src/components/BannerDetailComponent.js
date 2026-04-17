import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import vi from '../lang/vi';

class BannerDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtTitle: '',
      txtSubtitle: '',
      txtLabel: '',
      txtLink: '',
      txtOrder: 0,
      chkActive: true,
      imgBanner: '',
      fileBanner: null, // Stores the actual File object
      isSubmitting: false,
      errors: {}
    };
  }

  // Helper to resolve image paths
  resolveImage = (image) => {
    if (!image) return "";
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http')) return image;
    return `${process.env.REACT_APP_API_URL || "http://localhost:3007"}${image}`;
  }

  componentDidMount() {
    if (this.props.item) {
      this.setState({
        txtID: this.props.item._id,
        txtTitle: this.props.item.title,
        txtSubtitle: this.props.item.subtitle,
        txtLabel: this.props.item.label || '',
        txtLink: this.props.item.link || '',
        txtOrder: this.props.item.order,
        chkActive: this.props.item.active,
        imgBanner: this.resolveImage(this.props.item.image)
      });
    }
  }

  previewImage(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        this.setState({
          imgBanner: evt.target.result,
          fileBanner: file
        });
      };
      reader.readAsDataURL(file);
    }
  }

  render() {
    const { txtTitle, txtSubtitle, txtLabel, txtLink, txtOrder, chkActive, imgBanner, isSubmitting } = this.state;

    return (
      <div className="product-detail-modal">
        <div className="modal-backdrop" onClick={this.props.onClose}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h3>{this.props.item ? vi.editBanner : vi.addBanner}</h3>
            <button className="close-btn" onClick={this.props.onClose} disabled={isSubmitting}>×</button>
          </div>

          <div className="modal-body overflow-y">
            <form className="product-form">
              <div className="form-group">
                <label className="form-label">{vi.title} <span className="required">*</span></label>
                <input type="text" className="form-input" value={txtTitle}
                  onChange={(e) => this.setState({ txtTitle: e.target.value })} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Nhãn (Label)</label>
                <input type="text" className="form-input" value={txtLabel}
                  placeholder="Ví dụ: BỘ SƯU TẬP MỚI"
                  onChange={(e) => this.setState({ txtLabel: e.target.value })} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">{vi.subtitle}</label>
                <input type="text" className="form-input" value={txtSubtitle}
                  onChange={(e) => this.setState({ txtSubtitle: e.target.value })} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">{vi.link}</label>
                <input type="text" className="form-input" value={txtLink}
                  onChange={(e) => this.setState({ txtLink: e.target.value })} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">{vi.sortOrder}</label>
                <input type="number" className="form-input" value={txtOrder}
                  onChange={(e) => this.setState({ txtOrder: parseInt(e.target.value) || 0 })} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <input type="checkbox" checked={chkActive}
                    onChange={(e) => this.setState({ chkActive: e.target.checked })} disabled={isSubmitting} /> {vi.active}
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">{vi.image} {!this.props.item && <span className="required">*</span>}</label>
                <input type="file" accept="image/*" onChange={(e) => this.previewImage(e)} className="form-file" disabled={isSubmitting} />
              </div>
              {imgBanner && (
                <div className="image-preview-container">
                  <img src={imgBanner} alt="Preview" className="preview-image" />
                </div>
              )}
            </form>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={this.props.onClose} disabled={isSubmitting}>{vi.cancel}</button>
            <button className="btn btn-primary" onClick={(e) => this.btnSubmitClick(e)} disabled={isSubmitting}>
              {isSubmitting ? vi.saving : vi.save}
            </button>
          </div>
        </div>
      </div>
    );
  }

  btnSubmitClick(e) {
    e.preventDefault();
    const { txtTitle, txtSubtitle, txtLabel, txtLink, txtOrder, chkActive, fileBanner } = this.state;

    if (!txtTitle || (!this.props.item && !fileBanner)) {
      alert('Please input title and image');
      return;
    }

    const formData = new FormData();
    formData.append('title', txtTitle);
    formData.append('subtitle', txtSubtitle || '');
    formData.append('label', txtLabel || '');
    formData.append('link', txtLink || '');
    formData.append('order', txtOrder);
    formData.append('active', chkActive);
    if (fileBanner) {
      formData.append('image', fileBanner);
    }

    this.setState({ isSubmitting: true });
    if (this.props.item) {
      this.apiPutBanner(this.state.txtID, formData);
    } else {
      this.apiPostBanner(formData);
    }
  }

  apiPostBanner(formData) {
    const config = { headers: { 'x-access-token': this.context.token, "Content-Type": "multipart/form-data" } };
    axios.post('/api/banner/admin/add', formData, config).then((res) => {
      this.setState({ isSubmitting: false });
      if (res.data) {
        alert('Success');
        this.props.onClose();
        this.props.updateBanners();
      }
    }).catch(error => {
      console.error(error);
      this.setState({ isSubmitting: false });
    });
  }

  apiPutBanner(id, formData) {
    const config = { headers: { 'x-access-token': this.context.token, "Content-Type": "multipart/form-data" } };
    axios.put('/api/banner/admin/update/' + id, formData, config).then((res) => {
      this.setState({ isSubmitting: false });
      if (res.data) {
        alert('Success');
        this.props.onClose();
        this.props.updateBanners();
      }
    }).catch(error => {
      console.error(error);
      this.setState({ isSubmitting: false });
    });
  }
}

export default BannerDetail;
