import { useState, useEffect } from 'react';
import { getProjects, createProject } from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProjectName) return;
    try {
      await createProject(newProjectName);
      setNewProjectName('');
      loadProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  const maskApiKey = (key) => {
    if (!key) return '';
    return 'ak_' + '*'.repeat(16) + key.slice(-4);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('API Key copied to clipboard!');
  };

  return (
    <div>
      <h1 className="page-title">Projects</h1>
      <p className="page-subtitle">Manage your API gateway projects and credentials</p>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="New Project Name" 
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            className="input-field"
            style={{ flex: 1 }}
          />
          <button onClick={handleCreate} className="btn btn-primary">
            Create Project
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '24px' }}>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p style={{ padding: '24px' }}>No projects found. Create one above.</p>
        ) : (
          <table>
            <thead style={{ backgroundColor: 'var(--bg-hover)' }}>
              <tr>
                <th>Project Name</th>
                <th>API Key</th>
                <th>Created</th>
                <th>Features Enabled</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const cfg = p.gatewayConfig || {};
                const features = [
                  cfg.authentication?.enabled && 'Auth',
                  cfg.authorization?.enabled && 'Authz',
                  cfg.rateLimit?.enabled && 'RateLimit',
                  cfg.cache?.enabled && 'Cache'
                ].filter(Boolean);

                return (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <code 
                        style={{ background: 'var(--bg-hover)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} 
                        onClick={() => copyToClipboard(p.apiKey)}
                      >
                        {maskApiKey(p.apiKey)}
                      </code>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      {features.length > 0 ? (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {features.map(f => (
                            <span key={f} style={{ background: 'var(--bg-active)', color: 'var(--brand-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{f}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Projects;
