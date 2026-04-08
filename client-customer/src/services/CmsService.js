import axios from 'axios';

const CmsService = {
  // Banners
  getBanners: async () => {
    try {
      const response = await axios.get('/api/banner/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
  },

  // Blog
  getArticles: async () => {
    try {
      const response = await axios.get('/api/blog/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  },

  getArticleDetail: async (slug) => {
    try {
      const response = await axios.get(`/api/blog/detail/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching article ${slug}:`, error);
      return null;
    }
  },

  // Static Content
  getPageContent: async (slug) => {
    try {
      const response = await axios.get(`/api/content/page/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching page ${slug}:`, error);
      return null;
    }
  },

  // Enquiries
  submitEnquiry: async (data) => {
    try {
      const response = await axios.post('/api/content/enquiry', data);
      return response.data;
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      throw error;
    }
  },

  // Settings
  getSettings: async (group = 'general') => {
    try {
      const response = await axios.get(`/api/settings/group/${group}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching settings for ${group}:`, error);
      return {};
    }
  }
};

export default CmsService;
