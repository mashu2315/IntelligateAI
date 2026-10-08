import { useState, useEffect } from 'react';
import { getProjects, updateProjectConfig, getRoutes } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

const GatewayConfig = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [config, setConfig] = useState(null);
  const [projectRoutes, setProjectRoutes] = useState([]);

  useEffect(() => {
    getProjects().then(res => setProjects(res.data));
  }, []);

  const selectProject = async (id) => {
    const proj = projects.find(p => p._id === id);
    setSelectedProject(proj);
    
    try {
      const routesRes = await getRoutes(id);
      setProjectRoutes(routesRes.data || []);
    } catch (err) {
      setProjectRoutes([]);
    }
    
    // Deep copy and normalize config to ensure arrays exist
    const initialConfig = JSON.parse(JSON.stringify(proj?.gatewayConfig || {}));
    if (!initialConfig.authentication) initialConfig.authentication = { enabled: false, type: 'JWT', customFields: [] };
    if (initialConfig.authentication && !initialConfig.authentication.customFields) initialConfig.authentication.customFields = [];
    if (!initialConfig.authorization) initialConfig.authorization = { enabled: false, type: 'ROLE', customFields: [], allowedRoles: [] };
    if (!initialConfig.rateLimit) initialConfig.rateLimit = { enabled: false, globalLimit: { windowSeconds: 60, maxRequests: 100 }, routes: [] };
    if (!initialConfig.cache) initialConfig.cache = { enabled: false, globalTtlSeconds: 60, routes: [] };
    
    setConfig(initialConfig);
  };

  const handleSave = async () => {
    if (!selectedProject) return;

    // Validate Primary Key constraint if Auth is enabled and fields exist
    if (config.authentication?.enabled && config.authentication?.customFields?.length > 0) {
      const primaryCount = config.authentication.customFields.filter(f => f.isPrimary).length;
      if (primaryCount !== 1) {
        alert('You must select exactly one Primary Key for authentication.');
        return;
      }
    }

    try {
      const res = await updateProjectConfig(selectedProject._id, config);
      const updatedProjects = projects.map(p => p._id === res.data._id ? res.data : p);
      setProjects(updatedProjects);
      alert('Gateway configuration saved successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const updateArrayField = (path, value) => {
    const parts = path.split('.');
    const newConfig = { ...config };
    let current = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value.split(',').map(s => s.trim()).filter(Boolean);
    setConfig(newConfig);
  };

  const addCustomField = () => {
    const newConfig = { ...config };
    if (!newConfig.authentication.customFields) newConfig.authentication.customFields = [];
    newConfig.authentication.customFields.push({ name: '', isRequired: false, dataType: 'string', isPrimary: false });
    setConfig(newConfig);
  };

  const removeCustomField = (index) => {
    const newConfig = { ...config };
    newConfig.authentication.customFields.splice(index, 1);
    setConfig(newConfig);
  };

  const addRouteLimit = () => {
    const newConfig = { ...config };
    const defaultPath = projectRoutes.length > 0 ? projectRoutes[0].gatewayPath : '/api/new-route';
    newConfig.rateLimit.routes.push({ pathMatch: defaultPath, windowSeconds: 60, maxRequests: 50 });
    setConfig(newConfig);
  };

  const removeRouteLimit = (index) => {
    const newConfig = { ...config };
    newConfig.rateLimit.routes.splice(index, 1);
    setConfig(newConfig);
  };

  const addRouteCache = () => {
    const newConfig = { ...config };
    const defaultPath = projectRoutes.length > 0 ? projectRoutes[0].gatewayPath : '/api/new-route';
    newConfig.cache.routes.push({ pathMatch: defaultPath, ttlSeconds: 120, methods: ['GET'] });
    setConfig(newConfig);
  };

  const removeRouteCache = (index) => {
    const newConfig = { ...config };
    newConfig.cache.routes.splice(index, 1);
    setConfig(newConfig);
  };

  return (
    <div>
      <h1 className="page-title">Gateway Configuration</h1>
      <p className="page-subtitle">Configure enterprise-grade API policies and middlewares for your project</p>

      <div style={{ marginBottom: '32px' }}>
        <select 
          value={selectedProject?._id || ''} 
          onChange={e => selectProject(e.target.value)}
          className="input-field"
          style={{ width: '300px' }}
        >
          <option value="" disabled>Select a Project...</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {selectedProject && config && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
          
          {/* Authentication */}
          <div className="card">
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Authentication</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px', fontWeight: 600 }}>
              <input type="checkbox" checked={config.authentication.enabled} onChange={e => setConfig({...config, authentication: {...config.authentication, enabled: e.target.checked}})} />
              Enable JWT Authentication
            </label>
            {config.authentication.enabled && (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>User Registration Schema</h4>
                  <button onClick={addCustomField} className="btn" style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}>
                    <Plus size={16} /> Add Field
                  </button>
                </div>
                
                {!config.authentication.customFields || config.authentication.customFields.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No custom fields defined. Gateway will only require email and password.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {config.authentication.customFields.map((field, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <label className="label" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 700 }}>Primary Key</label>
                          <input type="radio" name="primaryKey" checked={field.isPrimary} onChange={() => {
                            const newFields = [...config.authentication.customFields].map((f, idx) => ({ ...f, isPrimary: idx === i }));
                            setConfig({...config, authentication: {...config.authentication, customFields: newFields}});
                          }} style={{ marginTop: '8px', width: '16px', height: '16px', cursor: 'pointer' }} />
                        </div>
                        <div style={{ flex: 2 }}>
                          <label className="label" style={{ fontSize: '0.8rem' }}>Field Name</label>
                          <input type="text" value={field.name} onChange={e => {
                            const newFields = [...config.authentication.customFields];
                            newFields[i].name = e.target.value;
                            setConfig({...config, authentication: {...config.authentication, customFields: newFields}});
                          }} className="input-field" style={{ padding: '6px' }} placeholder="e.g. phone" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="label" style={{ fontSize: '0.8rem' }}>Type</label>
                          <select value={field.dataType} onChange={e => {
                            const newFields = [...config.authentication.customFields];
                            newFields[i].dataType = e.target.value;
                            setConfig({...config, authentication: {...config.authentication, customFields: newFields}});
                          }} className="input-field" style={{ padding: '6px' }} disabled={field.isPrimary}>
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                          </select>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <label className="label" style={{ fontSize: '0.8rem' }}>Required</label>
                          <input type="checkbox" checked={field.isRequired || field.isPrimary} disabled={field.isPrimary} onChange={e => {
                            const newFields = [...config.authentication.customFields];
                            newFields[i].isRequired = e.target.checked;
                            setConfig({...config, authentication: {...config.authentication, customFields: newFields}});
                          }} style={{ marginTop: '8px', width: '16px', height: '16px', cursor: field.isPrimary ? 'not-allowed' : 'pointer' }} />
                        </div>
                        <button onClick={() => removeCustomField(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginTop: '16px' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Authorization */}
          <div className="card">
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Authorization</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px', fontWeight: 600 }}>
              <input type="checkbox" checked={config.authorization.enabled} onChange={e => setConfig({...config, authorization: {...config.authorization, enabled: e.target.checked}})} />
              Enable Role-Based Access Control
            </label>
            {config.authorization.enabled && (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">JWT Custom Claim for Roles</label>
                  <input 
                    type="text" 
                    value={(config.authorization.customFields || []).join(', ')} 
                    onChange={e => updateArrayField('authorization.customFields', e.target.value)}
                    className="input-field"
                    placeholder="e.g. user_role, roles"
                  />
                </div>
                <div>
                  <label className="label">Allowed Roles (comma separated)</label>
                  <input 
                    type="text" 
                    value={(config.authorization.allowedRoles || []).join(', ')} 
                    onChange={e => updateArrayField('authorization.allowedRoles', e.target.value)}
                    className="input-field"
                    placeholder="e.g. admin, manager"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rate Limiting */}
          <div className="card">
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Rate Limiting</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px', fontWeight: 600 }}>
              <input type="checkbox" checked={config.rateLimit.enabled} onChange={e => setConfig({...config, rateLimit: {...config.rateLimit, enabled: e.target.checked}})} />
              Enable Redis Rate Limiting
            </label>
            {config.rateLimit.enabled && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Global Fallback Limit</h4>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="label">Max Requests</label>
                    <input type="number" value={config.rateLimit.globalLimit?.maxRequests || 100} onChange={e => setConfig({...config, rateLimit: {...config.rateLimit, globalLimit: {...config.rateLimit.globalLimit, maxRequests: parseInt(e.target.value)}}})} className="input-field" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label">Window (sec)</label>
                    <input type="number" value={config.rateLimit.globalLimit?.windowSeconds || 60} onChange={e => setConfig({...config, rateLimit: {...config.rateLimit, globalLimit: {...config.rateLimit.globalLimit, windowSeconds: parseInt(e.target.value)}}})} className="input-field" />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Route-Specific Limits</h4>
                  <button onClick={addRouteLimit} className="btn" style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}>
                    <Plus size={16} /> Add Route
                  </button>
                </div>
                
                {config.rateLimit.routes.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No specific routes defined. Global limit applies to all traffic.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {config.rateLimit.routes.map((route, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ flex: 2 }}>
                          <label className="label" style={{ fontSize: '0.8rem' }}>Path Match</label>
                          <select value={route.pathMatch} onChange={e => {
                            const newRoutes = [...config.rateLimit.routes];
                            newRoutes[i].pathMatch = e.target.value;
                            setConfig({...config, rateLimit: {...config.rateLimit, routes: newRoutes}});
                          }} className="input-field" style={{ padding: '6px' }}>
                            {projectRoutes.length === 0 && <option value={route.pathMatch} disabled>{route.pathMatch} (Not in Routes)</option>}
                            {projectRoutes.map(pr => (
                              <option key={pr._id} value={pr.gatewayPath}>{pr.gatewayPath}</option>
                            ))}
                            {!projectRoutes.some(pr => pr.gatewayPath === route.pathMatch) && projectRoutes.length > 0 && (
                              <option value={route.pathMatch} disabled>{route.pathMatch} (Not in Routes)</option>
                            )}
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="label" style={{ fontSize: '0.8rem' }}>Reqs</label>
                          <input type="number" value={route.maxRequests} onChange={e => {
                            const newRoutes = [...config.rateLimit.routes];
                            newRoutes[i].maxRequests = parseInt(e.target.value);
                            setConfig({...config, rateLimit: {...config.rateLimit, routes: newRoutes}});
                          }} className="input-field" style={{ padding: '6px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="label" style={{ fontSize: '0.8rem' }}>Secs</label>
                          <input type="number" value={route.windowSeconds} onChange={e => {
                            const newRoutes = [...config.rateLimit.routes];
                            newRoutes[i].windowSeconds = parseInt(e.target.value);
                            setConfig({...config, rateLimit: {...config.rateLimit, routes: newRoutes}});
                          }} className="input-field" style={{ padding: '6px' }} />
                        </div>
                        <button onClick={() => removeRouteLimit(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginTop: '16px' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Caching */}
          <div className="card">
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Response Caching</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px', fontWeight: 600 }}>
              <input type="checkbox" checked={config.cache.enabled} onChange={e => setConfig({...config, cache: {...config.cache, enabled: e.target.checked}})} />
              Enable Redis Caching
            </label>
            {config.cache.enabled && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <label className="label">Global TTL (sec)</label>
                  <input type="number" value={config.cache.globalTtlSeconds || 60} onChange={e => setConfig({...config, cache: {...config.cache, globalTtlSeconds: parseInt(e.target.value)}})} className="input-field" style={{ width: '150px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Route-Specific Cache Rules</h4>
                  <button onClick={addRouteCache} className="btn" style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}>
                    <Plus size={16} /> Add Rule
                  </button>
                </div>
                
                {config.cache.routes.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>If no rules are defined, the Global TTL applies to all GET requests.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {config.cache.routes.map((route, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ flex: 2 }}>
                          <label className="label" style={{ fontSize: '0.8rem' }}>Path Match</label>
                          <select value={route.pathMatch} onChange={e => {
                            const newRoutes = [...config.cache.routes];
                            newRoutes[i].pathMatch = e.target.value;
                            setConfig({...config, cache: {...config.cache, routes: newRoutes}});
                          }} className="input-field" style={{ padding: '6px' }}>
                            {projectRoutes.length === 0 && <option value={route.pathMatch} disabled>{route.pathMatch} (Not in Routes)</option>}
                            {projectRoutes.map(pr => (
                              <option key={pr._id} value={pr.gatewayPath}>{pr.gatewayPath}</option>
                            ))}
                            {!projectRoutes.some(pr => pr.gatewayPath === route.pathMatch) && projectRoutes.length > 0 && (
                              <option value={route.pathMatch} disabled>{route.pathMatch} (Not in Routes)</option>
                            )}
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="label" style={{ fontSize: '0.8rem' }}>TTL (sec)</label>
                          <input type="number" value={route.ttlSeconds} onChange={e => {
                            const newRoutes = [...config.cache.routes];
                            newRoutes[i].ttlSeconds = parseInt(e.target.value);
                            setConfig({...config, cache: {...config.cache, routes: newRoutes}});
                          }} className="input-field" style={{ padding: '6px' }} />
                        </div>
                        <button onClick={() => removeRouteCache(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginTop: '16px' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    <p style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '8px' }}>Note: If specific rules are defined, only requests matching those rules will be cached.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
            <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayConfig;
