import React, { Component } from 'react';
import axios from 'axios';
import vi from '../lang/vi';

class TestimonialsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testimonials: []
    };
  }

  componentDidMount() {
    axios.get('/api/testimonial/customer/list')
      .then(res => {
        this.setState({ testimonials: res.data });
      })
      .catch(err => console.error("Could not load testimonials: ", err));
  }

  render() {
    return (
      <section className="testimonials-section">
        <h2>{vi.testimonialsTitle}</h2>
        <div className="testimonials-grid">
          {this.state.testimonials.map((t, index) => {
            const initialChar = t.author ? t.author.charAt(0).toUpperCase() : 'A';
            return (
              <div key={t._id || index} className="testimonial-card">
                <div className="testimonial-stars">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} style={{ color: 'var(--accent-color)', fontSize: '1.1rem' }}>{s}</span>
                  ))}
                </div>
                <p className="testimonial-text">{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--background-color)', fontSize: '1rem',
                    fontFamily: 'Georgia, serif', fontWeight: '400', flexShrink: 0
                  }}>
                    {initialChar}
                  </div>
                  <div>
                    <div className="testimonial-author">{t.author}</div>
                    <div className="testimonial-meta">{t.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
}

export default TestimonialsComponent;
