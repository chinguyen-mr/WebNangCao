import axios from "axios";
import React from "react";
import { Component } from "react";
import MyContext from "../contexts/MyContext";
import SimpleRichEditor from './SimpleRichEditor';

class ProductDetail extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtID: "",
      txtName: "",
      txtPrice: 0,
      txtDescription: "",
      txtDiscount: 0,
      cmbCategory: "",
      txtStock: 0,
      productStatus: 'IN_STOCK',
      imgProduct: "",
      fileProduct: null, // Stores the actual File object
      selectedFiles: [],
      selectedPreviews: [],
      existingImages: [],
      removedImageIndices: new Set(), // Track which existing images to delete
      errors: {},
      isSubmitting: false
    };
  }

  componentDidMount() {
    this.apiGetCategories();
    this.setupProductState();
  }

  // Handle setting up data from either props on mount or updates
  setupProductState = () => {
    if (this.props.item) {
      const existingImages = Array.isArray(this.props.item.images) && this.props.item.images.length > 0
        ? this.props.item.images
        : this.props.item.image
          ? [this.resolveImage(this.props.item.image)]
          : [];

      this.setState({
        txtID: this.props.item._id,
        txtName: this.props.item.name,
        txtPrice: this.props.item.price,
        txtDescription: this.props.item.description || "",
        txtDiscount: this.props.item.discount || 0,
        cmbCategory: this.props.item.category?._id || "",
        txtStock: this.props.item.stock || 0,
        productStatus: this.props.item.status || 'IN_STOCK',
        imgProduct: existingImages[0] || "",
        fileProduct: null,
        selectedFiles: [],
        selectedPreviews: [],
        existingImages,
        removedImageIndices: new Set(),
        activeImageIndex: 0,
        errors: {}
      });
    }
  }

  // Helper to resolve image paths
  resolveImage = (image) => {
    if (!image) return "";
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http')) return image;
    return `${process.env.REACT_APP_API_URL || "http://localhost:3007"}${image}`;
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (this.props.item) {
        this.setupProductState();
      } else {
        this.setState({
          txtID: "",
          txtName: "",
          txtPrice: 0,
          txtDescription: "",
          txtDiscount: 0,
          cmbCategory: "",
          imgProduct: "",
          fileProduct: null,
          selectedFiles: [],
          selectedPreviews: [],
          existingImages: [],
          errors: {}
        });
      }
    }
  }

  validateForm = () => {
    const errors = {};
    if (!this.state.txtName || this.state.txtName.trim() === '') {
      errors.txtName = 'Product name is required';
    } else if (this.state.txtName.trim().length < 3) {
      errors.txtName = 'Product name must be at least 3 characters';
    }

    if (this.state.txtPrice === "" || this.state.txtPrice < 0) {
      errors.txtPrice = 'Price must be 0 or greater';
    }

    if (!this.state.cmbCategory) {
      errors.cmbCategory = 'Category is required';
    }

    if (!this.props.item && this.state.selectedFiles.length === 0) {
      errors.imgProduct = 'At least one product image is required';
    }

    const remainingExistingImages = this.state.existingImages.filter((_, idx) => !this.state.removedImageIndices.has(idx));
    const totalImages = remainingExistingImages.length + this.state.selectedFiles.length;
    if (totalImages === 0) {
      errors.imgProduct = 'At least one product image is required';
    }

    return errors;
  }

  handleFieldChange = (fieldName, value) => {
    this.setState(prev => ({
      [fieldName]: value,
      errors: {
        ...prev.errors,
        [fieldName]: ''
      }
    }));
  }

  toggleRemoveImage = (index, isExisting = true) => {
    this.setState(prev => {
      const newRemoved = new Set(prev.removedImageIndices);
      if (newRemoved.has(index)) {
        newRemoved.delete(index);
      } else {
        newRemoved.add(index);
      }
      return { removedImageIndices: newRemoved };
    });
  }

  previewImage(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const selectedFiles = [];
    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      if (file.size > maxSize) {
        alert('Each image size must be less than 5MB');
        return;
      }
      selectedFiles.push(file);
    }

    Promise.all(selectedFiles.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (evt) => resolve(evt.target.result);
      reader.readAsDataURL(file);
    })))
      .then((previews) => {
        this.setState({
          selectedFiles,
          selectedPreviews: previews,
          fileProduct: selectedFiles[0],
          imgProduct: previews[0] || this.state.imgProduct,
          errors: {
            ...this.state.errors,
            imgProduct: ''
          }
        });
      });
  }

  render() {
    const { categories, txtID, txtName, txtPrice, txtDescription, txtDiscount, cmbCategory, txtStock, productStatus, errors, isSubmitting } = this.state;
    const cates = categories.map((cate) => (
      <option key={cate._id} value={cate._id}>{cate.name}</option>
    ));

    return (
      <div className="product-detail-modal">
        <div className="modal-backdrop" onClick={this.props.onClose}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h3>{this.props.item ? 'Edit Product' : 'Add New Product'}</h3>
            <button className="close-btn" onClick={this.props.onClose} disabled={isSubmitting}>×</button>
          </div>

          <div className="modal-body overflow-y">
            <form className="product-form">
              <div className="form-group">
                <label className="form-label">Product ID</label>
                <input type="text" value={txtID} readOnly className="form-input readonly" disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Name <span className="required">*</span></label>
                <input type="text" value={txtName}
                  onChange={(e) => this.handleFieldChange('txtName', e.target.value)}
                  className={`form-input ${errors.txtName ? 'input-error' : ''}`} disabled={isSubmitting} />
                {errors.txtName && <span className="error-message">{errors.txtName}</span>}
              </div>

              <div className="two-cols">
                <div className="form-group">
                  <label className="form-label">Price (VND) <span className="required">*</span></label>
                  <input type="number" value={txtPrice}
                    onChange={(e) => this.handleFieldChange('txtPrice', e.target.value)}
                    className={`form-input ${errors.txtPrice ? 'input-error' : ''}`} disabled={isSubmitting} />
                  {errors.txtPrice && <span className="error-message">{errors.txtPrice}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Discount (%)</label>
                  <input type="number" value={txtDiscount}
                    onChange={(e) => this.handleFieldChange('txtDiscount', e.target.value)}
                    className="form-input" disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select value={cmbCategory}
                  onChange={(e) => this.handleFieldChange('cmbCategory', e.target.value)}
                  className={`form-input ${errors.cmbCategory ? 'input-error' : ''}`} disabled={isSubmitting}>
                  <option value="">-- Select Category --</option>
                  {cates}
                </select>
                {errors.cmbCategory && <span className="error-message">{errors.cmbCategory}</span>}
              </div>

              <div className="two-cols">
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input type="number" min="0" value={txtStock}
                    onChange={(e) => this.handleFieldChange('txtStock', Number(e.target.value))}
                    className="form-input" disabled={isSubmitting} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tình trạng</label>
                  <select value={productStatus}
                    onChange={(e) => this.handleFieldChange('productStatus', e.target.value)}
                    className="form-input" disabled={isSubmitting}>
                    <option value="IN_STOCK">Còn hàng</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Mô tả sản phẩm</label>
                <SimpleRichEditor
                  value={txtDescription}
                  onChange={(val) => this.handleFieldChange('txtDescription', val)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Images {!this.props.item && <span className="required">*</span>}</label>
                <input type="file" accept="image/*" multiple onChange={(e) => this.previewImage(e)} className="form-file" disabled={isSubmitting} />
                {errors.imgProduct && <span className="error-message">{errors.imgProduct}</span>}
              </div>

              {(this.state.selectedPreviews.length > 0 || this.state.existingImages.length > 0) && (
                <div className="image-preview-gallery">
                  {this.state.existingImages.map((src, idx) => {
                    const isMarkedForDeletion = this.state.removedImageIndices.has(idx);
                    return (
                      <div key={`existing-${idx}`} className={`image-preview-item ${isMarkedForDeletion ? 'marked-delete' : ''}`}>
                        <img src={src} alt={`Product ${idx + 1}`} className="preview-image" />
                        <div className="image-actions">
                          <button
                            type="button"
                            className="btn-remove-img"
                            onClick={() => this.toggleRemoveImage(idx, true)}
                            title={isMarkedForDeletion ? 'Restore image' : 'Delete image'}
                          >
                            {isMarkedForDeletion ? '⟲' : '✕'}
                          </button>
                        </div>
                        {isMarkedForDeletion && <div className="delete-overlay">Sẽ xóa</div>}
                      </div>
                    );
                  })}
                  {this.state.selectedPreviews.map((src, idx) => (
                    <div key={`new-${idx}`} className="image-preview-item new-image">
                      <img src={src} alt={`New product ${idx + 1}`} className="preview-image" />
                      <div className="image-label">Ảnh mới</div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={this.props.onClose} disabled={isSubmitting}>Cancel</button>
            {this.props.item ? (
              <>
                <button className="btn btn-danger" onClick={() => this.btnDeleteClick()} disabled={isSubmitting}>Delete</button>
                <button className="btn btn-primary" onClick={() => this.btnUpdateClick()} disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Product'}
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => this.btnAddClick()} disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Product'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  btnAddClick() {
    const errors = this.validateForm();
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    const formData = new FormData();
    formData.append('name', this.state.txtName);
    formData.append('price', this.state.txtPrice);
    formData.append('category', this.state.cmbCategory);
    formData.append('description', this.state.txtDescription);
    formData.append('discount', this.state.txtDiscount);
    formData.append('stock', this.state.txtStock);
    formData.append('status', this.state.productStatus);
    this.state.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.setState({ isSubmitting: true });
    this.apiPostProduct(formData);
  }

  btnUpdateClick() {
    const errors = this.validateForm();
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    const formData = new FormData();
    formData.append('name', this.state.txtName);
    formData.append('price', this.state.txtPrice);
    formData.append('category', this.state.cmbCategory);
    formData.append('description', this.state.txtDescription);
    formData.append('discount', this.state.txtDiscount);
    formData.append('stock', this.state.txtStock);
    formData.append('status', this.state.productStatus);

    // Add new image files
    if (this.state.selectedFiles.length > 0) {
      this.state.selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
    }

    // Add info about which existing images to keep
    const imagesToKeep = this.state.existingImages
      .map((_, idx) => !this.state.removedImageIndices.has(idx) ? idx : null)
      .filter(idx => idx !== null);
    if (imagesToKeep.length > 0 && this.state.selectedFiles.length === 0) {
      formData.append('keepImageIndices', imagesToKeep.join(','));
    }

    this.setState({ isSubmitting: true });
    this.apiPutProduct(this.state.txtID, formData);
  }

  btnDeleteClick() {
    if (window.confirm("Are you sure?")) {
      this.setState({ isSubmitting: true });
      this.apiDeleteProduct(this.state.txtID);
    }
  }

  apiGetCategories() {
    const config = { headers: { "x-access-token": this.context.token } };
    axios.get("/api/category/admin/list", config).then((res) => {
      this.setState({ categories: res.data });
    });
  }

  apiPostProduct(formData) {
    const config = { headers: { "x-access-token": this.context.token, "Content-Type": "multipart/form-data" } };
    axios.post("/api/product/admin/add", formData, config).then((res) => {
      if (res.data) {
        alert("Success!");
        this.setState({ isSubmitting: false });
        this.props.onClose();
        this.props.updateProducts([], 0, this.props.curPage);
      }
    }).catch(() => this.setState({ isSubmitting: false }));
  }

  apiPutProduct(id, formData) {
    const config = { headers: { "x-access-token": this.context.token, "Content-Type": "multipart/form-data" } };
    axios.put("/api/product/admin/update/" + id, formData, config).then((res) => {
      if (res.data) {
        alert("Success!");
        this.setState({ isSubmitting: false });
        this.props.onClose();
        this.props.updateProducts([], 0, this.props.curPage);
      }
    }).catch(() => this.setState({ isSubmitting: false }));
  }

  apiDeleteProduct(id) {
    const config = { headers: { "x-access-token": this.context.token } };
    axios.delete("/api/product/admin/delete/" + id, config).then((res) => {
      if (res.data) {
        alert("Success!");
        this.setState({ isSubmitting: false });
        this.props.onClose();
        this.props.updateProducts([], 0, this.props.curPage);
      }
    }).catch(() => this.setState({ isSubmitting: false }));
  }
}

export default ProductDetail;
