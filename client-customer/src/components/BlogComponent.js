import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import SeoUtil from '../utils/SeoUtil';
import CmsService from '../services/CmsService';
import './BlogComponent.css';

class Blog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      loading: true,
      selectedCategory: 'All'
    };
  }

  async componentDidMount() {
    SeoUtil.updatePageMeta({
      title: 'Blog trầm hương | Trầm Tịnh',
      description: 'Những câu chuyện, kiến thức và cảm hứng về trầm hương cao cấp, canh tác bền vững và nghệ thuật chế tác từ Trầm Tịnh.',
    });

    try {
      const articles = await CmsService.getArticles();
      this.setState({ articles, loading: false });
    } catch (error) {
      console.error('Error fetching articles:', error);
      this.setState({ loading: false });
    }
  }

  handleCategoryFilter = (category) => {
    this.setState({ selectedCategory: category });
  };

  resolveImage(image) {
    if (!image) return null;
    if (typeof image !== 'string') return null;
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `data:image/jpeg;base64,${image}`;
  }

  stripHtml(html) {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  getFilteredArticles = () => {
    const { articles, selectedCategory } = this.state;
    if (selectedCategory === 'All') return articles;
    return articles.filter(article => article.category === selectedCategory);
  };

  getCategories = () => {
    const categories = ['All', ...new Set(this.state.articles.map(article => article.category || 'Chung'))];
    return categories;
  };

  render() {
    const { articles, loading, selectedCategory } = this.state;
    const filteredArticles = this.getFilteredArticles();
    const categories = this.getCategories();
    const featuredArticles = articles.filter(article => article.active).slice(0, 2);

    if (loading) return <div className="blog-container"><div className="loading-state">Đang tải bài viết...</div></div>;

    return (
      <div className="blog-container">
        <div className="blog-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>Nhật ký Trầm Hương</h1>
            <p>Những câu chuyện, kiến thức và cảm hứng từ thế giới trầm hương cao cấp</p>
          </div>
        </div>

        <div className="blog-content">
          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <section className="featured-section">
              <div className="section-header">
                <h2>Câu chuyện nổi bật</h2>
                <div className="section-divider"></div>
              </div>

              <div className="featured-grid">
                {featuredArticles.map(article => (
                  <article key={article._id} className="featured-article">
                    <div className="featured-image">
                      {article.image ? (
                        <img src={this.resolveImage(article.image)} alt={article.title} />
                      ) : (
                        <div className="article-icon">🌳</div>
                      )}
                    </div>
                    <div className="featured-content">
                      <div className="article-meta">
                        <span className="article-date">
                          {new Date(article.cdate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="article-read-time">{article.author || 'Trầm Tịnh'}</span>
                      </div>
                      <h3>{article.title}</h3>
                      <p>{this.stripHtml(article.excerpt || article.content).substring(0, 150) + '...'}</p>
                      <Link to={`/blog/${article.slug}`} className="read-more-btn">
                        Xem bài viết
                        <span className="btn-arrow">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Category Filter */}
          <section className="filter-section">
            <div className="filter-buttons">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => this.handleCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* All Articles */}
          <section className="articles-section">
            <div className="section-header">
              <h2>{selectedCategory === 'All' ? 'Tất cả bài viết' : `${selectedCategory} bài viết`}</h2>
              <div className="section-divider"></div>
            </div>

            <div className="articles-grid">
              {filteredArticles.length > 0 ? filteredArticles.map(article => (
                <article key={article._id} className="article-card">
                  <div className="article-image">
                    {article.image ? (
                      <img src={this.resolveImage(article.image)} alt={article.title} />
                    ) : (
                      <div className="article-icon-small">✨</div>
                    )}
                  </div>
                  <div className="article-content">
                    <div className="article-meta-small">
                      <span className="article-date-small">
                        {new Date(article.cdate).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="article-read-time-small">{article.author || 'Admin'}</span>
                    </div>
                    <h3>{article.title}</h3>
                    <p>{this.stripHtml(article.excerpt || article.content).substring(0, 100) + '...'}</p>
                    <Link to={`/blog/${article.slug}`} className="read-more-link">
                      Xem thêm →
                    </Link>
                  </div>
                </article>
              )) : (
                <div className="no-articles">Không có bài viết nào trong danh mục này.</div>
              )}
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="newsletter-section">
            <div className="newsletter-content">
              <div className="newsletter-text">
                <h2>Luôn Cập Nhật</h2>
                <p>
                  Đăng ký nhận tin để cập nhật những bài viết mới nhất về canh tác trầm hương,
                  nghệ thuật chế tác và thế giới trầm hương cao cấp.
                </p>
              </div>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn"
                  className="newsletter-input"
                />
                <button className="newsletter-btn">Đăng ký</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default Blog;