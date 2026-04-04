const GA_MEASUREMENT_ID = "G-XD3YLY21ML";

export const initGA = () => {
  // gtag is already initialized by the script in index.html
  // we can use this to set any extra config if needed.
};

export const trackPageView = (path) => {
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }
};

export const trackEvent = (category, action, label) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};
