const DEFAULT_TITLE = 'Scentia | Scented Candles & Incense';
const DEFAULT_DESCRIPTION = 'Trầm Tịnh cung cấp trầm hương cao cấp và sản phẩm thủ công chất lượng, với trải nghiệm mua sắm trực tuyến sang trọng, bền vững và đáng tin cậy.';

const ensureMetaTag = (name) => {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  return element;
};

const setMetaTag = (name, content) => {
  if (typeof document === 'undefined') return;
  const element = ensureMetaTag(name);
  element.content = content || '';
};

const setTitle = (title) => {
  if (typeof document === 'undefined') return;
  document.title = title || DEFAULT_TITLE;
};

const setDescription = (description) => {
  setMetaTag('description', description || DEFAULT_DESCRIPTION);
};

const setCanonical = (url) => {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url || window.location.href;
};

const setLanguage = (lang = 'vi') => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
};

const updatePageMeta = ({ title, description, canonical }) => {
  setLanguage('vi');
  setTitle(title || DEFAULT_TITLE);
  setDescription(description || DEFAULT_DESCRIPTION);
  if (canonical !== false) {
    setCanonical(canonical || window.location.href);
  }
};

const SeoUtil = {
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  setTitle,
  setDescription,
  setMetaTag,
  setCanonical,
  setLanguage,
  updatePageMeta
};

export default SeoUtil;
