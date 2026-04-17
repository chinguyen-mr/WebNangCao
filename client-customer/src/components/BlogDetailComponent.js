import React, { Component } from 'react';
import SeoUtil from '../utils/SeoUtil';
import CmsService from '../services/CmsService';
import withRouter from '../utils/withRouter';
import './BlogComponent.css'; // Reusing blog styles

class BlogDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      article: null,
      loading: true,
      error: ''
    };
  }

  async componentDidMount() {
    const slug = this.props.params.slug;
    await this.loadArticle(slug);
  }

  async loadArticle(slug) {
    this.setState({ loading: true });
    try {
      const article = await CmsService.getArticleDetail(slug);
      if (article) {
        this.setState({ article, loading: false });
        SeoUtil.updatePageMeta({
          title: `${article.title} | Blog Trầm Tịnh`,
          description: article.excerpt || article.content.substring(0, 160),
        });
      } else {
        this.setState({ loading: false, error: 'Bài viết không tồn tại.' });
      }
    } catch (error) {
      this.setState({ loading: false, error: 'Không thể tải bài viết.' });
    }
  }

  resolveImage(image) {
    if (!image) return null;
    if (typeof image !== 'string') return null;
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `data:image/jpeg;base64,${image}`;
  }

  render() {
    const { article, loading, error } = this.state;

    if (loading) return <div className="blog-container"><div className="loading-state">Đang tải bài viết...</div></div>;
    if (error) return <div className="blog-container"><div className="error-state">{error}</div></div>;
    if (!article) return null;

    return (
      <div className="blog-container">
        <div className="blog-detail-hero" style={{ 
          backgroundImage: article.image ? `url(${this.resolveImage(article.image)})` : 'none',
          backgroundColor: '#1a1a1a',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <div className="hero-overlay" style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.6)' 
          }}></div>
          <div className="hero-content" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px' }}>
            <span className="article-category-tag" style={{ background: '#c4a47c', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', marginBottom: '20px', display: 'inline-block' }}>
              {article.category || 'Kiến thức'}
            </span>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>{article.title}</h1>
            <div className="article-meta" style={{ fontSize: '14px', opacity: 0.8 }}>
              <span>Bởi {article.author || 'Trầm Tịnh'}</span> • <span>{new Date(article.cdate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="blog-detail-content" style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
          <div className="article-body" style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#444' }} dangerouslySetInnerHTML={{ __html: article.content }}>
          </div>
          
          <div className="article-footer" style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
            <button className="back-btn" onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#c4a47c', cursor: 'pointer', fontSize: '1rem' }}>
              ← Quay lại Blog
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(BlogDetail);
