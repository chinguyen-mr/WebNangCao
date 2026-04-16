import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import vi from '../lang/vi';

class Settings extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      settings: {},
      loading: false,
      isSaving: false,
      // FAQ state
      faqs: []
    };
  }

  componentDidMount() {
    this.apiGetSettings();
  }

  render() {
    const { settings, faqs, loading, isSaving } = this.state;

    return (
      <div className="product-management">
        <div className="product-header">
          <div className="header-left">
            <h2>{vi.settingsManagement}</h2>
            <p>Cấu hình các thông tin cơ bản của cửa hàng và trang liên hệ.</p>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-status-message">{vi.loadingData}</div>
        ) : (
          <div className="settings-container" style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* General & Contact Information */}
            <div className="table-container" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Thông tin cơ bản & Liên hệ</h3>
              <form className="settings-form">
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Tên cửa hàng</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.siteName || ''}
                    onChange={(e) => this.handleSettingChange('siteName', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Slogan chuyên mục / Mô tả ngắn</label>
                  <textarea
                    className="form-input"
                    style={{ height: '60px' }}
                    value={settings.siteDescription || ''}
                    onChange={(e) => this.handleSettingChange('siteDescription', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Email liên hệ</label>
                  <input
                    type="email"
                    className="form-input"
                    value={settings.contactEmail || ''}
                    onChange={(e) => this.handleSettingChange('contactEmail', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.contactPhone || ''}
                    onChange={(e) => this.handleSettingChange('contactPhone', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Địa chỉ</label>
                  <textarea
                    className="form-input"
                    style={{ height: '60px' }}
                    value={settings.contactAddress || ''}
                    onChange={(e) => this.handleSettingChange('contactAddress', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Giờ làm việc (VD: Thứ 2 - Thứ 6: 9:00 - 18:00)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.contactHours || ''}
                    onChange={(e) => this.handleSettingChange('contactHours', e.target.value)}
                  />
                </div>

                <h4 style={{ margin: '20px 0 10px 0', fontSize: '1rem', color: '#666' }}>Mạng xã hội</h4>
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Facebook URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.facebookUrl || ''}
                    onChange={(e) => this.handleSettingChange('facebookUrl', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Instagram URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.instagramUrl || ''}
                    onChange={(e) => this.handleSettingChange('instagramUrl', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Zalo URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.zaloUrl || ''}
                    onChange={(e) => this.handleSettingChange('zaloUrl', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px', marginTop: '20px' }}>
                  <label className="form-label">Chân trang (Footer Text)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.footerText || ''}
                    onChange={(e) => this.handleSettingChange('footerText', e.target.value)}
                  />
                </div>

                <div style={{ marginTop: '30px', textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => this.apiSaveSettings()}
                    disabled={isSaving}
                  >
                    {isSaving ? vi.saving : vi.save}
                  </button>
                </div>
              </form>
            </div>

            {/* FAQ Management */}
            <div className="table-container" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Quản lý Câu hỏi thường gặp (FAQs)</h3>
              <div className="faq-manager">
                {faqs.map((faq, index) => (
                  <div key={index} className="faq-item-editor" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: '#f9f9f9', position: 'relative' }}>
                    <button 
                      type="button" 
                      style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 8px' }}
                      onClick={() => this.removeFaq(index)}
                    >
                      Xóa
                    </button>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Câu hỏi #{index + 1}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={faq.q} 
                        onChange={(e) => this.handleFaqChange(index, 'q', e.target.value)}
                        placeholder="Nhập câu hỏi..."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Câu trả lời</label>
                      <textarea 
                        className="form-input" 
                        style={{ height: '80px' }}
                        value={faq.a} 
                        onChange={(e) => this.handleFaqChange(index, 'a', e.target.value)}
                        placeholder="Nhập câu trả lời..."
                      ></textarea>
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ width: '100%', padding: '10px', borderStyle: 'dashed', background: 'transparent', color: '#8b7355', borderColor: '#8b7355' }}
                  onClick={() => this.addFaq()}
                >
                  + Thêm câu hỏi mới
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  handleSettingChange(key, value) {
    this.setState(prevState => ({
      settings: {
        ...prevState.settings,
        [key]: value
      }
    }));
  }

  // FAQ Handlers
  addFaq = () => {
    this.setState(prevState => ({
      faqs: [...prevState.faqs, { q: '', a: '' }]
    }));
  };

  removeFaq = (index) => {
    const newFaqs = [...this.state.faqs];
    newFaqs.splice(index, 1);
    this.setState({ faqs: newFaqs });
  };

  handleFaqChange = (index, field, value) => {
    const newFaqs = [...this.state.faqs];
    newFaqs[index][field] = value;
    this.setState({ faqs: newFaqs });
  };

  // APIs
  apiGetSettings() {
    this.setState({ loading: true });
    axios.get('/api/settings/group/general').then((res) => {
      // res.data is an object { key: value }
      const settings = res.data;
      
      // Parse FAQs if they exist
      let faqs = [];
      if (settings.contactFaqs) {
        try {
          faqs = JSON.parse(settings.contactFaqs);
        } catch (e) {
          console.error("Error parsing FAQs", e);
          faqs = [];
        }
      }

      this.setState({ settings, faqs, loading: false });
    }).catch(error => {
      console.error(error);
      this.setState({ loading: false });
    });
  }

  apiSaveSettings() {
    this.setState({ isSaving: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    
    // Prepare settings object, including serialized FAQs
    const settingsToSave = { ...this.state.settings };
    settingsToSave.contactFaqs = JSON.stringify(this.state.faqs);
    
    const promises = Object.keys(settingsToSave).map(key => {
      return axios.post('/api/settings/admin/update', {
        key: key,
        value: settingsToSave[key],
        group: 'general'
      }, config);
    });

    Promise.all(promises).then(() => {
      this.setState({ isSaving: false });
      alert('Đã lưu cài đặt thành công!');
    }).catch(error => {
      console.error(error);
      this.setState({ isSaving: false });
      alert('Lỗi khi lưu cài đặt');
    });
  }
}

export default Settings;
