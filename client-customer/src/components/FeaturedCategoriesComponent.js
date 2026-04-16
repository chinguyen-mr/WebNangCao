import axios from 'axios';
import { Component } from 'react';
import { Link } from 'react-router-dom';

// Accent gradients cycled across category cards for visual variety
const CATEGORY_GRADIENTS = [
  'linear-gradient(135deg, #4B3621 0%, #7A5C3E 50%, #C6A769 100%)',
  'linear-gradient(135deg, #3D2F23 0%, #6B4F37 50%, #B39A57 100%)',
  'linear-gradient(135deg, #5A3E2B 0%, #8B7355 50%, #D4B88A 100%)',
  'linear-gradient(135deg, #2C2018 0%, #5D4632 50%, #C6A769 100%)',
  'linear-gradient(135deg, #4B3621 0%, #9A7C5A 60%, #E8C882 100%)',
  'linear-gradient(135deg, #362819 0%, #7A5C3E 55%, #C6A769 100%)',
];

class FeaturedCategories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  apiGetCategories = () => {
    axios.get('/api/category/list')
      .then((res) => {
        const featured = Array.isArray(res.data) ? res.data.slice(0, 6) : [];
        this.setState({ categories: featured, loading: false });
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        this.setState({ error: error.message, loading: false });
      });
  };

  render() {
    const { categories, loading, error } = this.state;

    if (loading) {
      return (
        <div className="featured-categories">
          <div className="loading">Đang tải danh mục...</div>
        </div>
      );
    }

    if (error || categories.length === 0) {
      return null; // Hide section if categories fail to load
    }

    return (
      <div className="featured-categories">
        <h2>Danh Mục Sản Phẩm</h2>

        <div className="categories-grid">
          {categories.map((category, index) => (
            <Link
              key={category._id}
              to={`/product/category/${category.slug || category._id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="category-card">
                <div className="category-image">
                  {category.image ? (
                    <img src={category.image.startsWith('/') ? category.image : category.image} alt={category.name} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{
                        fontSize: '4rem',
                        fontFamily: 'Georgia, serif',
                        fontWeight: '300',
                        color: 'rgba(249, 246, 241, 0.25)',
                        letterSpacing: '2px',
                        userSelect: 'none',
                      }}>
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="category-overlay">
                  <h3>{category.name}</h3>
                  <p>Bộ sưu tập tuyển chọn</p>
                  <span className="category-link">Xem ngay</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
}

export default FeaturedCategories;
