// Base URL for the IntelliGate Gateway
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';

/**
 * Fetch health status from a given URL
 * @param {string} url - Full URL to the health endpoint
 * @returns {Promise<object>} - Health response data
 */
export const fetchHealth = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
};

/**
 * Fetch products through the gateway
 * @returns {Promise<object>} - Products response data
 */
export const fetchProducts = async (apiKey, token = '') => {
  const headers = {};
  if (apiKey) headers['x-api-key'] = apiKey;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${GATEWAY_URL}/api/products`, { headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error: ${response.status}`);
  }
  return response.json();
};

/**
 * Fetch orders through the gateway
 * @returns {Promise<object>} - Orders response data
 */
export const fetchOrders = async (apiKey, token = '') => {
  const headers = {};
  if (apiKey) headers['x-api-key'] = apiKey;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${GATEWAY_URL}/api/orders`, { headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error: ${response.status}`);
  }
  return response.json();
};

export const getProjects = async () => {
  const response = await fetch(`${GATEWAY_URL}/api/projects`);
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

export const getProjectUsers = async (projectId) => {
  const response = await fetch(`${GATEWAY_URL}/api/projects/${projectId}/users`);
  if (!response.ok) throw new Error('Failed to fetch project users');
  return response.json();
};

export const createProject = async (name) => {
  const response = await fetch(`${GATEWAY_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!response.ok) throw new Error('Failed to create project');
  return response.json();
};

export const updateProjectConfig = async (id, config) => {
  const response = await fetch(`${GATEWAY_URL}/api/projects/${id}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!response.ok) throw new Error('Failed to update project config');
  return response.json();
};

export const getRoutes = async (projectId) => {
  const response = await fetch(`${GATEWAY_URL}/api/routes/project/${projectId}`);
  if (!response.ok) throw new Error('Failed to fetch routes');
  return response.json();
};

export const createRoute = async (routeData) => {
  const response = await fetch(`${GATEWAY_URL}/api/routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routeData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create route');
  }
  return response.json();
};

export const deleteRoute = async (routeId) => {
  const response = await fetch(`${GATEWAY_URL}/api/routes/${routeId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete route');
  return response.json();
};

export const getLogs = async (projectId, page = 1) => {
  const url = `${GATEWAY_URL}/api/logs?page=${page}${projectId ? `&projectId=${projectId}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch logs');
  return response.json();
};

export const getAnalyticsOverview = async (projectId = null) => {
  const url = `${GATEWAY_URL}/api/analytics/overview${projectId ? `?projectId=${projectId}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch analytics overview');
  return response.json();
};

export const getAnalyticsTraffic = async (projectId = null, range = '24h') => {
  const url = `${GATEWAY_URL}/api/analytics/traffic?range=${range}${projectId ? `&projectId=${projectId}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch analytics traffic');
  return response.json();
};

export { GATEWAY_URL };
