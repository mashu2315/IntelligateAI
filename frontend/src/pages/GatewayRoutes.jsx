import { useState, useEffect } from 'react';
import { getProjects, getRoutes, createRoute, deleteRoute } from '../services/api';

const GatewayRoutes = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [routes, setRoutes] = useState([]);
  
  const [method, setMethod] = useState('ALL');
  const [gatewayPath, setGatewayPath] = useState('/api/');
  const [targetUrl, setTargetUrl] = useState('http://localhost:5001/');

  useEffect(() => {
    getProjects().then(res => {
      setProjects(res.data);
      if (res.data.length > 0) setSelectedProjectId(res.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadRoutes(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadRoutes = async (projectId) => {
    try {
      const res = await getRoutes(projectId);
      setRoutes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !gatewayPath || !targetUrl) return;
    try {
      await createRoute({ projectId: selectedProjectId, method, gatewayPath, targetUrl });
      setMethod('ALL');
      setGatewayPath('/api/');
      setTargetUrl('http://localhost:5001/');
      loadRoutes(selectedProjectId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await deleteRoute(id);
      loadRoutes(selectedProjectId);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Dynamic Routing</h1>
      <p className="page-subtitle">Map incoming gateway paths to backend microservices</p>

      <div style={{ marginBottom: '24px' }}>
        <select 
          value={selectedProjectId} 
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="input-field"
          style={{ width: '300px' }}
        >
          <option value="" disabled>Select a Project...</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {selectedProjectId && (
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          
          <div className="card" style={{ flex: '1', minWidth: '300px' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Create New Route</h3>
            <form onSubmit={handleCreateRoute} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <label className="label">HTTP Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} className="input-field">
                  {['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Gateway Path Prefix</label>
                <input type="text" value={gatewayPath} onChange={e => setGatewayPath(e.target.value)} placeholder="/api/products" className="input-field" />
              </div>
              <div>
                <label className="label">Target Backend URL</label>
                <input type="url" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="http://localhost:5001/" className="input-field" />
              </div>
              <button type="submit" className="btn btn-success" style={{ marginTop: '8px' }}>
                Add Route
              </button>
            </form>
          </div>

          <div className="card" style={{ flex: '2', minWidth: '500px', padding: 0, overflow: 'hidden' }}>
            <h3 style={{ margin: '24px 24px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Active Routes</h3>
            {routes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '24px' }}>No routes defined. Requests will fall back to default proxy paths if available.</p>
            ) : (
              <table style={{ marginTop: '16px' }}>
                <thead style={{ backgroundColor: 'var(--bg-hover)' }}>
                  <tr>
                    <th>Method</th>
                    <th>Path</th>
                    <th>Target</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map(r => (
                    <tr key={r._id}>
                      <td>
                        <span style={{ background: 'var(--bg-active)', color: 'var(--brand-primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{r.method}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{r.gatewayPath}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{r.targetUrl}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDeleteRoute(r._id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayRoutes;
