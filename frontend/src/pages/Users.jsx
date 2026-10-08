import { useState, useEffect } from 'react';
import { getProjects, getProjectUsers } from '../services/api';
import { Users as UsersIcon } from 'lucide-react';

const Users = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProjects().then(res => setProjects(res.data));
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchUsers(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchUsers = async (projectId) => {
    setLoading(true);
    try {
      const res = await getProjectUsers(projectId);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">User Management</h1>
      <p className="page-subtitle">View and manage authenticated end-users for your projects</p>

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
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table>
            <thead style={{ background: 'var(--bg-hover)' }}>
              <tr>
                <th>Identity (Primary Key)</th>
                <th>Role</th>
                <th>Custom Data</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <UsersIcon size={48} color="var(--border-color)" />
                      <div style={{ color: 'var(--text-secondary)' }}>No end-users registered yet.</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Users will appear here when they register via the Gateway `/client-auth/register` endpoint.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.identityKey}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: user.role === 'admin' ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-hover)',
                        color: user.role === 'admin' ? 'var(--brand-primary)' : 'var(--text-secondary)'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <pre style={{ 
                        margin: 0, 
                        fontSize: '0.8rem', 
                        color: 'var(--brand-primary)',
                        background: 'var(--bg-active)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        {JSON.stringify(user.customData || {})}
                      </pre>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {new Date(user.createdAt).toLocaleDateString()} {new Date(user.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
