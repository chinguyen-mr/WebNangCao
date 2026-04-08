import React, { Component } from 'react';
import SeoUtil from '../utils/SeoUtil';
import CmsService from '../services/CmsService';
import vi from '../lang/vi';
import './AboutComponent.css';

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: null,
      loading: true
    };
  }

  async componentDidMount() {
    SeoUtil.updatePageMeta({
      title: vi.aboutMetaTitle,
      description: vi.aboutMetaDesc,
    });

    try {
      const content = await CmsService.getPageContent('about');
      this.setState({ content, loading: false });
    } catch (error) {
      this.setState({ loading: false });
    }
  }

  render() {
    const { content } = this.state;

    return (
      <div className="about-container">
        <div className="about-hero">
          <div className="hero-content">
            <h1 className="hero-title">{content?.title || vi.about}</h1>
            <p className="hero-subtitle">{vi.aboutHeroSubtitle}</p>
            <div className="hero-description">
              {vi.aboutHeroDesc}
            </div>
          </div>
          <div className="hero-image">
            <div className="agarwood-silhouette">🌿</div>
          </div>
        </div>

        <div className="about-content">
          <section className="story-section">
            <div className="section-header">
              <h2>{vi.ourStoryTitle}</h2>
              <div className="section-divider"></div>
            </div>
            <div className="story-content">
              <div className="story-text">
                {content?.body ? (
                  <div dangerouslySetInnerHTML={{ __html: content.body }} />
                ) : (
                  <>
                    <p>{vi.ourStoryText1}</p>
                    <p>{vi.ourStoryText2}</p>
                  </>
                )}
              </div>
              <div className="story-stats">
                <div className="stat-item">
                  <div className="stat-number">25+</div>
                  <div className="stat-label">{vi.yearsExperience}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">5000+</div>
                  <div className="stat-label">{vi.premiumProductsCount}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">{vi.countriesServed}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="values-section">
            <div className="section-header">
              <h2>{vi.coreValuesTitle}</h2>
              <div className="section-divider"></div>
            </div>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🌱</div>
                <h3>{vi.valueSustainabilityTitle}</h3>
                <p>{vi.valueSustainabilityDesc}</p>
              </div>
              <div className="value-card">
                <div className="value-icon">✨</div>
                <h3>{vi.valueAuthenticityTitle}</h3>
                <p>{vi.valueAuthenticityDesc}</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>{vi.valueCommunityTitle}</h3>
                <p>{vi.valueCommunityDesc}</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🎨</div>
                <h3>{vi.valueCraftsmanshipTitle}</h3>
                <p>{vi.valueCraftsmanshipDesc}</p>
              </div>
            </div>
          </section>

          <section className="process-section">
            <div className="section-header">
              <h2>{vi.ourProcessTitle}</h2>
              <div className="section-divider"></div>
            </div>
            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">01</div>
                <h3>{vi.processCultivationTitle}</h3>
                <p>{vi.processCultivationDesc}</p>
              </div>
              <div className="process-step">
                <div className="step-number">02</div>
                <h3>{vi.processHarvestingTitle}</h3>
                <p>{vi.processHarvestingDesc}</p>
              </div>
              <div className="process-step">
                <div className="step-number">03</div>
                <h3>{vi.processProcessingTitle}</h3>
                <p>{vi.processProcessingDesc}</p>
              </div>
              <div className="process-step">
                <div className="step-number">04</div>
                <h3>{vi.processQualityTitle}</h3>
                <p>{vi.processQualityDesc}</p>
              </div>
            </div>
          </section>

          <section className="commitment-section">
            <div className="commitment-content">
              <h2>{vi.qualityCommitmentTitle}</h2>
              <p>{vi.qualityCommitmentDesc}</p>
              <div className="commitment-highlights">
                <div className="highlight-item">
                  <span className="highlight-icon">✓</span>
                  <span>{vi.vietnameseAgarwood}</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">✓</span>
                  <span>{vi.sustainableHarvest}</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">✓</span>
                  <span>{vi.expertValidation}</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">✓</span>
                  <span>{vi.longTermCommitment}</span>
                </div>
              </div>
            </div>
            <div className="commitment-image">
              <div className="premium-badge">{vi.premiumBadge}</div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default About;