/**
 * Route Matcher Service
 * Matches incoming request paths against configured route patterns.
 */

const matchPath = (reqPath, routePath) => {
  // Exact match
  if (reqPath === routePath) return true;

  // Wildcard match (e.g., '/api/*' or '/api/v1/*')
  if (routePath.endsWith('/*')) {
    const base = routePath.slice(0, -2);
    if (reqPath === base || reqPath.startsWith(base + '/') || reqPath.startsWith(base)) return true;
  }

  // Prefix match (e.g., route='/api/' should match '/api/secure-data')
  if (routePath.endsWith('/')) {
    if (reqPath.startsWith(routePath)) return true;
  }

  return false;
};

/**
 * Find the matching route configuration for a request.
 * @param {string} reqPath - The incoming request path
 * @param {string} reqMethod - The HTTP method
 * @param {Array} routes - Array of route config objects from DB
 * @returns {Object|null} - The matching route config or null
 */
const findMatchingRoute = (reqPath, reqMethod, routes) => {
  return routes.find(r =>
    matchPath(reqPath, r.path) &&
    (r.method === 'ALL' || r.method === reqMethod)
  ) || null;
};

module.exports = { matchPath, findMatchingRoute };
