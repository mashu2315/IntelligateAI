import { useState, useEffect } from 'react';
import ServiceStatus from '../components/ServiceStatus';
import { fetchProducts, fetchOrders, createProject, updateProjectConfig, GATEWAY_URL } from '../services/api';
import './Dashboard.css';

const services = [
  { name: 'API Gateway', url: 'http://localhost:5000/health' },
  { name: 'Product Service', url: 'http://localhost:5001/health' },
  { name: 'Order Service', url: 'http://localhost:5002/health' },
];

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Test State
  const [testJwt, setTestJwt] = useState('');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsError, setProductsError] = useState(null);
  const [ordersError, setOrdersError] = useState(null);

  // Config State
  const [config, setConfig] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch(`${GATEWAY_URL}/api/projects`);
      const data = await res.json();
      setProjects(data.data);
      if (data.data.length > 0 && !selectedProject) {
        selectProject(data.data[0]);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName) return;
    try {
      const res = await createProject(newProjectName);
      setNewProjectName('');
      await loadProjects();
      selectProject(res.data);
    } catch (err) {
      alert(err.message);
    }
  };

  const selectProject = (proj) => {
    setSelectedProject(proj);
    setConfig(proj.gatewayConfig);
    // Clear test results
    setProducts([]);
    setOrders([]);
    setProductsError(null);
    setOrdersError(null);
  };

  const handleSaveConfig = async () => {
    if (!selectedProject) return;
    try {
      const res = await updateProjectConfig(selectedProject._id, config);
      setSelectedProject(res.data);
      alert('Configuration saved!');
    } catch (err) {
      alert(err.message);
    }
  };

  const runTest = async () => {
    if (!selectedProject) return alert('Select a project first');
    
    try {
      const productRes = await fetchProducts(selectedProject.apiKey, testJwt);
      setProducts(productRes.data);
      setProductsError(null);
    } catch (err) {
      setProductsError(err.message);
      setProducts([]);
    }

    try {
      const orderRes = await fetchOrders(selectedProject.apiKey, testJwt);
      setOrders(orderRes.data);
      setOrdersError(null);
    } catch (err) {
      setOrdersError(err.message);
      setOrders([]);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo-section">
          <div className="logo-icon">⚡</div>
          <h1 className="dashboard-title">IntelliGate AI</h1>
        </div>
        <p className="dashboard-subtitle">Configurable Gateway Feature Engine</p>
      </header>

      <div className="dashboard-content">
        {/* Left Column: Config */}
        <div className="config-column">
          <section className="config-section">
            <h2 className="section-title">Projects</h2>
            <div className="project-selector">
              <select 
                value={selectedProject?._id || ''} 
                onChange={(e) => selectProject(projects.find(p => p._id === e.target.value))}
              >
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <div className="new-project">
                <input 
                  type="text" 
                  placeholder="New Project Name" 
                  value={newProjectName} 
                  onChange={e => setNewProjectName(e.target.value)} 
                />
                <button onClick={handleCreateProject}>Create</button>
              </div>
            </div>
            
            {selectedProject && config && (
              <div className="project-details">
                <p><strong>API Key:</strong> <code>{selectedProject.apiKey}</code></p>
                
                <h3 className="settings-title">Gateway Configuration</h3>
                
                {/* Auth */}
                <div className="config-group">
                  <label className="toggle-label">
                    <input type="checkbox" checked={config.authentication?.enabled || false} onChange={e => setConfig({...config, authentication: {...config.authentication, enabled: e.target.checked}})} />
                    Authentication
                  </label>
                  {config.authentication?.enabled && (
                    <div className="config-sub">
                      <label>Type: <input type="text" value={config.authentication.type || 'JWT'} disabled /></label>
                    </div>
                  )}
                </div>

                {/* Authz */}
                <div className="config-group">
                  <label className="toggle-label">
                    <input type="checkbox" checked={config.authorization?.enabled || false} onChange={e => setConfig({...config, authorization: {...config.authorization, enabled: e.target.checked}})} />
                    Authorization
                  </label>
                  {config.authorization?.enabled && (
                    <div className="config-sub">
                      <label>Allowed Roles (comma separated):
                        <input type="text" value={(config.authorization.allowedRoles || []).join(', ')} 
                          onChange={e => setConfig({...config, authorization: {...config.authorization, allowedRoles: e.target.value.split(',').map(r=>r.trim()).filter(Boolean)}})} />
                      </label>
                    </div>
                  )}
                </div>

                {/* Rate Limit */}
                <div className="config-group">
                  <label className="toggle-label">
                    <input type="checkbox" checked={config.rateLimit?.enabled || false} onChange={e => setConfig({...config, rateLimit: {...config.rateLimit, enabled: e.target.checked}})} />
                    Rate Limiting
                  </label>
                  {config.rateLimit?.enabled && (
                    <div className="config-sub">
                      <label>Max Requests: <input type="number" value={config.rateLimit.maxRequests || 100} onChange={e => setConfig({...config, rateLimit: {...config.rateLimit, maxRequests: parseInt(e.target.value)}})} /></label>
                      <label>Window (sec): <input type="number" value={config.rateLimit.windowSeconds || 60} onChange={e => setConfig({...config, rateLimit: {...config.rateLimit, windowSeconds: parseInt(e.target.value)}})} /></label>
                    </div>
                  )}
                </div>

                {/* Cache */}
                <div className="config-group">
                  <label className="toggle-label">
                    <input type="checkbox" checked={config.cache?.enabled || false} onChange={e => setConfig({...config, cache: {...config.cache, enabled: e.target.checked}})} />
                    Caching
                  </label>
                  {config.cache?.enabled && (
                    <div className="config-sub">
                      <label>TTL (sec): <input type="number" value={config.cache.ttlSeconds || 60} onChange={e => setConfig({...config, cache: {...config.cache, ttlSeconds: parseInt(e.target.value)}})} /></label>
                    </div>
                  )}
                </div>

                <button className="save-btn" onClick={handleSaveConfig}>Save Configuration</button>
              </div>
            )}
          </section>

          <section className="status-section">
            <h2 className="section-title">Service Health</h2>
            <div className="services-grid">
              {services.map(s => <ServiceStatus key={s.name} name={s.name} url={s.url} />)}
            </div>
          </section>
        </div>

        {/* Right Column: Testing */}
        <div className="test-column">
          <section className="test-section">
            <h2 className="section-title">Gateway Test Request</h2>
            <div className="test-controls">
              <label>Test JWT Token:
                <input type="text" placeholder="Paste JWT here (if Auth is enabled)" value={testJwt} onChange={e => setTestJwt(e.target.value)} />
              </label>
              <button className="test-btn" onClick={runTest}>Send Request</button>
            </div>

            <div className="data-grid">
              <div className="data-card">
                <h3 className="data-card-title">Products (GET /api/products)</h3>
                {productsError ? <p className="data-error">{productsError}</p> : products.length > 0 ? (
                  <ul className="data-list">
                    {products.map(p => <li key={p.id} className="data-item"><span className="data-name">{p.name}</span><span className="data-value">₹{p.price.toLocaleString()}</span></li>)}
                  </ul>
                ) : <p className="data-loading">Ready</p>}
              </div>

              <div className="data-card">
                <h3 className="data-card-title">Orders (GET /api/orders)</h3>
                {ordersError ? <p className="data-error">{ordersError}</p> : orders.length > 0 ? (
                  <ul className="data-list">
                    {orders.map(o => <li key={o.id} className="data-item"><span className="data-name">#{o.id} — {o.product}</span><span className={`data-badge status-${o.status}`}>{o.status}</span></li>)}
                  </ul>
                ) : <p className="data-loading">Ready</p>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
