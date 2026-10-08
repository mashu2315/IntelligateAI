import { useState, useEffect } from 'react';
import { getProjects, getLogs } from '../services/api';

const ApiLogs = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    getProjects().then(res => setProjects(res.data));
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [selectedProjectId]);

  const fetchLogs = async (page) => {
    setLoading(true);
    try {
      const res = await getLogs(selectedProjectId, page);
      setLogs(res.data.logs);
      setPagination({ page: res.data.page, totalPages: res.data.totalPages, total: res.data.total });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (code) => {
    if (code >= 200 && code < 300) return 'var(--success)';
    if (code >= 400 && code < 500) return 'var(--warning)';
    if (code >= 500) return 'var(--danger)';
    return 'var(--text-muted)';
  };

  return (
    <div>
      <h1 className="page-title">API Request Logs</h1>
      <p className="page-subtitle">Real-time trace of gateway traffic and middleware execution</p>

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <select 
          value={selectedProjectId} 
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="input-field"
          style={{ width: '300px' }}
        >
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        
        <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          Total records: {pagination.total}
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table>
          <thead style={{ background: 'var(--bg-hover)' }}>
            <tr>
              <th>Time</th>
              <th>Method</th>
              <th>Path</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Cache</th>
              <th>Rate Limit</th>
              <th>Auth</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No logs found.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log._id}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(log.createdAt).toLocaleTimeString()}</td>
                  <td style={{ fontWeight: 700 }}>{log.method}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--brand-primary)' }}>{log.path}</td>
                  <td style={{ color: getStatusColor(log.statusCode), fontWeight: 700 }}>{log.statusCode}</td>
                  <td style={{ fontWeight: 500 }}>{log.latency}ms</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                      background: log.cacheStatus === 'HIT' ? 'rgba(16, 185, 129, 0.1)' : log.cacheStatus === 'MISS' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-hover)',
                      color: log.cacheStatus === 'HIT' ? 'var(--success)' : log.cacheStatus === 'MISS' ? 'var(--warning)' : 'var(--text-muted)'
                    }}>{log.cacheStatus}</span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                      background: log.rateLimitStatus === 'BLOCKED' ? 'rgba(239, 68, 68, 0.1)' : log.rateLimitStatus === 'PASS' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-hover)',
                      color: log.rateLimitStatus === 'BLOCKED' ? 'var(--danger)' : log.rateLimitStatus === 'PASS' ? 'var(--success)' : 'var(--text-muted)'
                    }}>{log.rateLimitStatus}</span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                      background: log.authenticationStatus === 'FAILED' ? 'rgba(239, 68, 68, 0.1)' : log.authenticationStatus === 'PASS' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-hover)',
                      color: log.authenticationStatus === 'FAILED' ? 'var(--danger)' : log.authenticationStatus === 'PASS' ? 'var(--success)' : 'var(--text-muted)'
                    }}>{log.authenticationStatus}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', borderTop: '1px solid var(--border-color)' }}>
          <button 
            disabled={pagination.page <= 1 || loading} 
            onClick={() => fetchLogs(pagination.page - 1)}
            className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            Previous
          </button>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Page {pagination.page} of {pagination.totalPages || 1}</span>
          <button 
            disabled={pagination.page >= pagination.totalPages || loading} 
            onClick={() => fetchLogs(pagination.page + 1)}
            className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiLogs;
