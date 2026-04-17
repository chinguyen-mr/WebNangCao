import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import vi from '../lang/vi';

class BlogDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtTitle: '',
      txtSlug: '',
      txtExcerpt: '',
      txtContent: '',
      txtAuthor: '',
      chkActive: true,
      imgBlog: '',
      fileBlog: null, // Stores the actual File object
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
        txtSlug: this.props.item.slug,
        txtExcerpt: this.props.item.excerpt,
        txtContent: this.props.item.content,
        txtAuthor: this.props.item.author,
        chkActive: this.props.item.active,
        imgBlog: this.resolveImage(this.props.item.image)
      });
    }
  }

  handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title.toLowerCase()
      .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
      .replace(/ì|í|ị|ỉ|ĩ/g, "i")
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
      .replace(/đ/g, "d")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    this.setState({ txtTitle: title, txtSlug: slug });
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
          imgBlog: evt.target.result,
          fileBlog: file
        });
      };
      reader.readAsDataURL(file);
    }
  }

  render() {
    const { txtTitle, txtSlug, txtExcerpt, txtContent, txtAuthor, chkActive, imgBlog, isSubmitting } = this.state;

    return (
      <div className="product-detail-modal">
        <div className="modal-backdrop" onClick={this.props.onClose}></div>
        <div className="modal-content blog-modal">
          <div className="modal-header">
            <h3>{this.props.item ? vi.editBlog : vi.addBlog}</h3>
            <button className="close-btn" onClick={this.props.onClose} disabled={isSubmitting}>×</button>
          </div>

          <div className="modal-body overflow-y">
            <form className="product-form">
              <div className="form-group">
                <label className="form-label">{vi.title} <span className="required">*</span></label>
                <input type="text" className="form-input" value={txtTitle}
                  onChange={this.handleTitleChange} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">{vi.slug}</label>
                <input type="text" className="form-input readonly" value={txtSlug} readOnly disabled />
              </div>
              <div className="form-group">
                <label className="form-label">{vi.author}</label>
                <input type="text" className="form-input" value={txtAuthor}
                  onChange={(e) => this.setState({ txtAuthor: e.target.value })} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">{vi.excerpt}</label>
                <textarea className="form-input" style={{ height: '80px' }} value={txtExcerpt}
                  onChange={(e) => this.setState({ txtExcerpt: e.target.value })} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">{vi.content} <span className="required">*</span></label>
                <textarea className="form-input" style={{ height: '200px' }} value={txtContent}
                  onChange={(e) => this.setState({ txtContent: e.target.value })} disabled={isSubmitting} />
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
              {imgBlog && (
                <div className="image-preview-container">
                  <img src={imgBlog} alt="Preview" className="preview-image" style={{ maxWidth: '300px' }} />
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
    const { txtTitle, txtSlug, txtExcerpt, txtContent, txtAuthor, chkActive, fileBlog } = this.state;
    
    if (!txtTitle || !txtContent || (!this.props.item && !fileBlog)) {
      alert('Please fill in title, content and image');
      return;
    }

    const formData = new FormData();
    formData.append('title', txtTitle);
    formData.append('slug', txtSlug);
    formData.append('excerpt', txtExcerpt || '');
    formData.append('content', txtContent);
    formData.append('author', txtAuthor || '');
    formData.append('active', chkActive);
    if (fileBlog) {
      formData.append('image', fileBlog);
    }

    this.setState({ isSubmitting: true });
    if (this.props.item) {
      this.apiPutArticle(this.state.txtID, formData);
    } else {
      this.apiPostArticle(formData);
    }
  }

  apiPostArticle(formData) {
    const config = { headers: { 'x-access-token': this.context.token, "Content-Type": "multipart/form-data" } };
    axios.post('/api/blog/admin/add', formData, config).then((res) => {
      this.setState({ isSubmitting: false });
      if (res.data) {
        alert('Success');
        this.props.onClose();
        this.props.updateBlogs();
      }
    }).catch(error => {
      console.error(error);
      this.setState({ isSubmitting: false });
    });
  }

  apiPutArticle(id, formData) {
    const config = { headers: { 'x-access-token': this.context.token, "Content-Type": "multipart/form-data" } };
    axios.put('/api/blog/admin/update/' + id, formData, config).then((res) => {
      this.setState({ isSubmitting: false });
      if (res.data) {
        alert('Success');
        this.props.onClose();
        this.props.updateBlogs();
      }
    }).catch(error => {
      console.error(error);
      this.setState({ isSubmitting: false });
    });
  }
}

export default BlogDetail;
