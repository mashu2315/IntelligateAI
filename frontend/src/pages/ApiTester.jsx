import { useState, useEffect } from 'react';
import { getProjects } from '../services/api';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';

const ApiTester = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/api/products');
  const [token, setToken] = useState('');
  
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProjects().then(res => setProjects(res.data));
  }, []);

  const handleTest = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return alert('Select a project first');

    const project = projects.find(p => p._id === selectedProjectId);
    if (!project) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      const headers = {
        'x-api-key': project.apiKey
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${GATEWAY_URL}${path}`, {
        method,
        headers
      });

      const latency = Date.now() - startTime;
      const data = await res.json().catch(() => null);
      
      setResponse({
        status: res.status,
        latency,
        headers: {
          'x-cache': res.headers.get('x-cache'),
          'x-ratelimit-remaining': res.headers.get('x-ratelimit-remaining'),
          'x-ratelimit-rule': res.headers.get('x-ratelimit-rule')
        },
        data
      });
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">API Tester</h1>
      <p className="page-subtitle">Test your API Gateway routes and inspect headers</p>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1', minWidth: '400px' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Request Configuration</h3>
          
          <form onSubmit={handleTest} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div>
              <label className="label">Target Project</label>
              <select 
                value={selectedProjectId} 
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="input-field"
              >
                <option value="">Select a Project...</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '120px' }}>
                <label className="label">Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} className="input-field">
                  {['GET', 'POST', 'PUT', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Gateway Path</label>
                <input type="text" value={path} onChange={e => setPath(e.target.value)} className="input-field" placeholder="/api/products" />
              </div>
            </div>

            <div>
              <label className="label">JWT Token (optional)</label>
              <input type="text" value={token} onChange={e => setToken(e.target.value)} className="input-field" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '8px', padding: '12px', fontSize: '1.05rem' }}>
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </form>
        </div>

        <div className="card" style={{ flex: '1.5', minWidth: '500px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Response</h3>
          
          {!response && !loading && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Configure and send a request to see the response.
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
              Executing request through gateway...
            </div>
          )}

          {response && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: response.status >= 200 && response.status < 300 ? 'var(--success)' : 'var(--danger)' }}>
                    {response.status || 'ERROR'}
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Latency</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {response.latency ? `${response.latency}ms` : '-'}
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px', flex: 1 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Gateway Headers</div>
                  <div style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--brand-primary)', marginTop: '4px' }}>
                    X-Cache: {response.headers?.['x-cache'] || 'MISS'}<br/>
                    X-RateLimit-Rule: {response.headers?.['x-ratelimit-rule'] || 'N/A'}<br/>
                    X-RateLimit-Remaining: {response.headers?.['x-ratelimit-remaining'] || 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Response Body</h4>
                <pre style={{ 
                  background: '#1e293b', /* Keep code block dark for syntax contrast */
                  color: '#e2e8f0', 
                  padding: '16px', 
                  borderRadius: '8px',
                  overflowX: 'auto',
                  margin: 0,
                  fontSize: '0.9rem',
                  border: '1px solid var(--border-color)'
                }}>
                  {response.error ? response.error : JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiTester;
