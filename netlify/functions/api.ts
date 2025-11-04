// Netlify Serverless Function: /netlify/functions/api.js
// Deploy this to your Netlify site for secure API proxying

const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Initialize WooCommerce API with secure credentials
    const WooCommerce = new WooCommerceRestApi({
      url: process.env.WOOCOMMERCE_URL || 'https://www.sqb-tunisie.com',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
      version: 'wc/v3',
      queryStringAuth: true
    });

    const { pathParameters, queryStringParameters } = event;
    const method = event.httpMethod;
    let endpoint = '';

    // Route requests based on path
    if (event.path.includes('/categories')) {
      if (pathParameters && pathParameters.id) {
        // Single category or category-specific requests
        const categoryId = pathParameters.id;
        endpoint = `products/categories/${categoryId}`;

        if (event.path.includes('/subcategories')) {
          // Get subcategories
          return await handleSubcategories(WooCommerce, categoryId, queryStringParameters);
        } else if (event.path.includes('/products')) {
          // Get products for category
          return await handleCategoryProducts(WooCommerce, categoryId, queryStringParameters);
        } else {
          // Get single category
          return await handleSingleCategory(WooCommerce, categoryId);
        }
      } else {
        // Get all categories
        return await handleCategories(WooCommerce, queryStringParameters);
      }
    } else if (event.path.includes('/products')) {
      // Get products
      return await handleProducts(WooCommerce, queryStringParameters);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

// Handler functions
async function handleCategories(WooCommerce, params) {
  const options = {
    per_page: parseInt(params?.per_page) || 100,
    hide_empty: params?.hide_empty !== 'false',
    parent: params?.parent ? parseInt(params.parent) : 0
  };

  const response = await WooCommerce.get('products/categories', options);

  // Calculate pagination info
  const totalCategories = parseInt(response.headers['x-wp-total']);
  const totalPages = parseInt(response.headers['x-wp-totalpages']);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categories: response.data,
      totalPages,
      totalCategories
    })
  };
}

async function handleSingleCategory(WooCommerce, categoryId) {
  const response = await WooCommerce.get(`products/categories/${categoryId}`);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(response.data)
  };
}

async function handleSubcategories(WooCommerce, categoryId, params) {
  const options = {
    per_page: parseInt(params?.per_page) || 100,
    hide_empty: params?.hide_empty !== 'false',
    parent: categoryId
  };

  const response = await WooCommerce.get('products/categories', options);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categories: response.data,
      totalPages: parseInt(response.headers['x-wp-totalpages']),
      totalCategories: parseInt(response.headers['x-wp-total'])
    })
  };
}

async function handleCategoryProducts(WooCommerce, categoryId, params) {
  const options = {
    category: categoryId,
    per_page: parseInt(params?.per_page) || 20,
    page: parseInt(params?.page) || 1,
    status: 'publish',
    ...params
  };

  const response = await WooCommerce.get('products', options);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: response.data,
      totalPages: parseInt(response.headers['x-wp-totalpages']),
      totalProducts: parseInt(response.headers['x-wp-total'])
    })
  };
}

async function handleProducts(WooCommerce, params) {
  const options = {
    per_page: parseInt(params?.per_page) || 20,
    page: parseInt(params?.page) || 1,
    search: params?.search || '',
    status: 'publish',
    ...params
  };

  const response = await WooCommerce.get('products', options);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: response.data,
      totalPages: parseInt(response.headers['x-wp-totalpages']),
      totalProducts: parseInt(response.headers['x-wp-total'])
    })
  };
}
