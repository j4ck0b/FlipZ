// Helper function to create page URLs
export const createPageUrl = (pageName) => {
  // Convert page names to routes
  const routeMap = {
    'Home': '/home',
    'Landing': '/',
    'Login': '/login',
    'CardExchange': '/card-exchange',
    'BrickExchange': '/brick-exchange',
    'DiecastExchange': '/diecast-exchange',
    'FigureExchange': '/figure-exchange',
    'CollectibleExchange': '/collectible-exchange',
    'Profile': '/profile',
    'Messages': '/messages',
    'Favorites': '/favorites',
    'Subscription': '/subscription',
    'SubscriptionSuccess': '/subscription/success',
    'MyListings': '/my-listings',
    'AdminPanel': '/admin',
    'AdminDashboard': '/admin'
  };

  return routeMap[pageName] || '/';
};

// Format currency
export const formatCurrency = (amount) => {
  return `${amount} zł`;
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    available: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-blue-100 text-blue-700',
    traded: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};
