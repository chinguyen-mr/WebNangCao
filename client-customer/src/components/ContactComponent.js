import React, { Component } from 'react';
import SeoUtil from '../utils/SeoUtil';
import CmsService from '../services/CmsService';
import vi from '../lang/vi';
import './ContactComponent.css';

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      subject: '',
      message: '',
      content: null,
      settings: {},
      faqs: [],
      submitted: false,
      isSubmitting: false,
      error: ''
    };
  }

  async componentDidMount() {
    SeoUtil.updatePageMeta({
      title: vi.contactMetaTitle,
      description: vi.contactMetaDesc,
    });

    try {
      const [content, settings] = await Promise.all([
        CmsService.getPageContent('contact'),
        CmsService.getSettings('general')
      ]);

      let faqs = [];
      if (settings.contactFaqs) {
        try {
          faqs = JSON.parse(settings.contactFaqs);
        } catch (e) {
          console.error("Error parsing FAQs", e);
        }
      }

      this.setState({ content, settings, faqs });
    } catch (error) {
      console.error('Error loading contact page data', error);
    }
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, subject, message } = this.state;
    this.setState({ isSubmitting: true, error: '' });
    
    try {
      await CmsService.submitEnquiry({ name, email, subject, message });
      this.setState({ submitted: true, isSubmitting: false });
      setTimeout(() => {
        this.setState({ name: '', email: '', subject: '', message: '', submitted: false });
      }, 3000);
    } catch (error) {
      this.setState({ isSubmitting: false, error: vi.updateFailed });
    }
  };

  render() {
    const { name, email, subject, message, submitted, content, settings, faqs, isSubmitting, error } = this.state;

    return (
      <div className="contact-container">
        <div className="contact-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>{content?.title || vi.contactHeroTitle}</h1>
            <p>{vi.contactHeroDesc}</p>
          </div>
        </div>

        <div className="contact-content">
          <div className="contact-info-section">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>{vi.visitOurWorkshop}</h3>
              <p>{settings.contactAddress || '123 Đường Cổ Mộc\nThành phố Hồ Chí Minh, Việt Nam'}</p>
              <div className="info-detail">{settings.contactHours || 'Thứ 2 - Thứ 6: 9:00 - 18:00'}</div>
            </div>

            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>{vi.contactUs}</h3>
              <p>{settings.contactPhone || '+84 28 1234 5678'}</p>
              <div className="info-detail">{vi.longTermCommitment}</div>
            </div>

            <div className="info-card">
              <div className="info-icon">✉️</div>
              <h3>Email</h3>
              <p>{settings.contactEmail || 'info@tram-tinh.com'}</p>
              <div className="info-detail">{vi.expertValidation}</div>
            </div>

            <div className="info-card">
              <div className="info-icon">🌐</div>
              <h3>{vi.socialMedia}</h3>
              <p>
                {settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>}
                {settings.instagramUrl && (settings.facebookUrl || settings.linkedinUrl) && ' / '}
                {settings.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>}
                {settings.facebookUrl && settings.linkedinUrl && ' / '}
                {settings.linkedinUrl && <a href={settings.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
                {!settings.instagramUrl && !settings.facebookUrl && !settings.linkedinUrl && 'Instagram / Facebook / LinkedIn'}
              </p>
              <div className="info-detail">@tramtinh.premium</div>
            </div>
          </div>

          <div className="contact-form-section">
            <div className="form-header">
              <h2>{vi.sendMessage}</h2>
              {content?.body ? (
                <div dangerouslySetInnerHTML={{ __html: content.body }} />
              ) : (
                <p>{vi.contactMetaDesc}</p>
              )}
            </div>

            {submitted ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>{vi.updateSuccess}</h3>
                <p>{vi.orderPlacedSuccessfully}</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={this.handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">{vi.fullName} *</label>
                    <input type="text" id="name" name="name" value={name} onChange={this.handleInputChange} required placeholder={vi.fullName} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">{vi.emailAddress} *</label>
                    <input type="email" id="email" name="email" value={email} onChange={this.handleInputChange} required placeholder={vi.emailPlaceholder} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">{vi.subjectLabel} *</label>
                  <select id="subject" name="subject" value={subject} onChange={this.handleInputChange} required>
                    <option value="">{vi.selectSubject}</option>
                    <option value="product-inquiry">{vi.prodInquiry}</option>
                    <option value="price-quote">{vi.priceQuote}</option>
                    <option value="custom-order">{vi.customOrder}</option>
                    <option value="wholesale">{vi.wholesale}</option>
                    <option value="authentication">{vi.authentication}</option>
                    <option value="general">{vi.general}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">{vi.messageLabel} *</label>
                  <textarea id="message" name="message" value={message} onChange={this.handleInputChange} required placeholder={vi.messageLabel} rows="6"></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? vi.sending : vi.sendNow}
                  {!isSubmitting && <span className="btn-icon">→</span>}
                </button>
              </form>
            )}
          </div>
        </div>

        {faqs && faqs.length > 0 && (
          <div className="faq-section">
            <div className="section-header">
              <h2>{vi.faqTitle}</h2>
              <div className="section-divider"></div>
            </div>

            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Contact;