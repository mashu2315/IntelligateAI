import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

function App() {
  // Auth State
  const [primaryKeyName, setPrimaryKeyName] = useState('Email');
  const [primaryKeyValue, setPrimaryKeyValue] = useState('');
  const [password, setPassword] = useState('');
  const [customFieldsJson, setCustomFieldsJson] = useState('{\n  "Password": "supersecret",\n  "Role": "user"\n}');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [authMessage, setAuthMessage] = useState('');
  
  // Request Tester State
  const [testMethod, setTestMethod] = useState('GET');
  const [testPath, setTestPath] = useState('/api/secure-data');
  const [testQuery, setTestQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (type, message, details = null) => {
    setLogs(prev => [...prev, { id: Date.now(), type, message, details, time: new Date().toLocaleTimeString() }]);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthMessage('Signing up...');
    try {
      let customData = {};
      try {
        if (customFieldsJson.trim()) customData = JSON.parse(customFieldsJson);
      } catch (err) {
        setAuthMessage('Invalid JSON in Custom Fields!');
        return;
      }
      
      const payload = { 
        [primaryKeyName]: primaryKeyValue, 
        password,
        ...customData
      };
      
      addLog('info', 'Sending Signup Request', payload);
      await axios.post(`${GATEWAY_URL}/client-auth/register`, payload, {
        headers: { 'x-api-key': API_KEY }
      });
      setAuthMessage('Signup successful! Please login.');
      addLog('success', 'Signup Successful');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setAuthMessage(`Signup failed: ${msg}`);
      addLog('error', 'Signup Failed', msg);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthMessage('Logging in...');
    try {
      let customData = {};
      if (customFieldsJson.trim()) {
        try { customData = JSON.parse(customFieldsJson); } catch (e) {} // ignore invalid json on login
      }
      const payload = { [primaryKeyName]: primaryKeyValue, password, ...customData };
      
      const res = await axios.post(`${GATEWAY_URL}/client-auth/login`, payload, {
        headers: { 'x-api-key': API_KEY }
      });
      const jwtToken = res.data.data.token;
      setToken(jwtToken);
      localStorage.setItem('token', jwtToken);
      setAuthMessage('Login successful!');
      addLog('success', 'Login Successful', { token: jwtToken.substring(0, 20) + '...' });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setAuthMessage(`Login failed: ${msg}`);
      addLog('error', 'Login Failed', msg);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setAuthMessage('Logged out.');
    addLog('info', 'Logged Out');
  };

  const fireRequest = async () => {
    setIsLoading(true);
    const fullPath = testQuery ? `${testPath}?${testQuery}` : testPath;
    addLog('info', `Firing ${testMethod} ${fullPath}`);
    
    const startTime = Date.now();
    try {
      const requestData = (testMethod === 'POST' || testMethod === 'PUT') ? {
        products: [{ name: "TestItem", price: 99 }],
        totalAmount: 99,
        address: "123 Main St",
        preferences: { theme: "dark" }
      } : undefined;

      const res = await axios({
        method: testMethod,
        url: `${GATEWAY_URL}${fullPath}`,
        data: requestData,
        headers: {
          'x-api-key': API_KEY,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      const latency = Date.now() - startTime;
      addLog('success', `200 OK (${latency}ms)`, {
        headers: {
          'X-Cache': res.headers['x-cache'] || 'Not Provided',
          'X-Response-Time': res.headers['x-response-time'] || `${latency}ms`
        },
        data: res.data
      });
    } catch (err) {
      const latency = Date.now() - startTime;
      if (err.response) {
        addLog(err.response.status === 429 ? 'warning' : 'error', `${err.response.status} Error (${latency}ms)`, {
          headers: {
            'X-Cache': err.response.headers['x-cache'] || 'Not Provided',
            'X-RateLimit-Limit': err.response.headers['x-ratelimit-limit'],
            'X-RateLimit-Remaining': err.response.headers['x-ratelimit-remaining'],
          },
          data: err.response.data
        });
      } else {
        addLog('error', `Network Error (${latency}ms)`, err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-gray-200 p-4 md:p-8 font-sans overflow-x-hidden relative selection:bg-indigo-500/30">
      
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <header className="flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
              Target Tester
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Fully-fledged environment to test IntelliGate AI Gateway</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-mono text-gray-400">Gateway: {GATEWAY_URL}</span>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Auth & Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* AUTHENTICATION */}
            <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-indigo-400">01.</span> Authentication
              </h2>
              
              {!token ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary Key Name</label>
                      <input type="text" value={primaryKeyName} onChange={e => setPrimaryKeyName(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="e.g. Email" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary Key Value</label>
                      <input type="text" value={primaryKeyValue} onChange={e => setPrimaryKeyValue(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="user@example.com" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
                      <span>Additional Custom Fields</span>
                      <span className="text-gray-600">(JSON Format)</span>
                    </label>
                    <textarea 
                      value={customFieldsJson} 
                      onChange={e => setCustomFieldsJson(e.target.value)} 
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-sm font-mono text-fuchsia-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all h-28" 
                      placeholder={`{\n  "Password": "capitalP",\n  "Age": 25\n}`}
                    />
                    <p className="text-[10px] text-gray-500 leading-tight">Define ALL required fields exactly as configured in IntelliGate (e.g., if you required "Password" with a capital P, include it here).</p>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSignup} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold py-3 rounded-xl transition-all border border-gray-700">Sign Up</button>
                    <button onClick={handleLogin} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">Login</button>
                  </div>
                  {authMessage && <div className="text-sm text-center text-gray-400 mt-2">{authMessage}</div>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Authenticated
                    </div>
                    <p className="text-xs font-mono text-emerald-600/70 break-all">{token}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full bg-gray-800 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/50 text-gray-300 text-sm font-bold py-3 rounded-xl transition-all border border-gray-700">Logout</button>
                </div>
              )}
            </section>

          </div>

          {/* RIGHT COLUMN: Request Tester & Logs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* REQUEST TESTER */}
            <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-fuchsia-400">02.</span> Gateway Request Tester
              </h2>
              
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <select value={testMethod} onChange={e => setTestMethod(e.target.value)} className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold focus:border-fuchsia-500 transition-all text-fuchsia-400 md:w-32">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
                <input type="text" value={testPath} onChange={e => setTestPath(e.target.value)} className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-fuchsia-500 transition-all font-mono" placeholder="/api/secure-data" />
              </div>
              <div className="mb-4 space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Query Parameters</label>
                <input type="text" value={testQuery} onChange={e => setTestQuery(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-fuchsia-500 transition-all font-mono text-gray-400" placeholder="page=2&sort=desc" />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={fireRequest} 
                  disabled={isLoading}
                  className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(192,38,211,0.3)] hover:shadow-[0_0_25px_rgba(192,38,211,0.5)] flex justify-center items-center gap-2"
                >
                  {isLoading ? <span className="animate-pulse">Gateway Processing...</span> : '🚀 Send Request via Gateway'}
                </button>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">1. Gateway Features</h3>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => {setTestPath('/api/secure-data'); setTestQuery(''); setTestMethod('GET');}} className="text-xs px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700">Test Auth & Delay (2s)</button>
                  <button onClick={() => {setTestPath('/api/products'); setTestQuery('page=1'); setTestMethod('GET');}} className="text-xs px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700">Test Cache (/api/products)</button>
                  <button onClick={() => {setTestPath('/api/admin-data'); setTestQuery(''); setTestMethod('GET');}} className="text-xs px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700">Test RBAC (/api/admin-data)</button>
                  <button onClick={() => {setTestPath('/api/fast-data'); setTestQuery(''); setTestMethod('GET');}} className="text-xs px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700">Test Rate Limit Spam</button>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">2. Business Logic (App DB)</h3>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => {setTestPath('/api/profile'); setTestQuery(''); setTestMethod('GET');}} className="text-xs px-3 py-1.5 rounded bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 transition-colors border border-indigo-900/50">Get Profile</button>
                  <button onClick={() => {setTestPath('/api/orders'); setTestQuery(''); setTestMethod('GET');}} className="text-xs px-3 py-1.5 rounded bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 transition-colors border border-indigo-900/50">Get Orders</button>
                  <button onClick={() => {setTestPath('/api/orders'); setTestQuery(''); setTestMethod('POST');}} className="text-xs px-3 py-1.5 rounded bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 transition-colors border border-indigo-900/50">Create Order</button>
                </div>
              </div>
            </section>

            {/* LIVE ACTIVITY LOG */}
            <section className="bg-[#0A0D14] border border-gray-800 rounded-2xl flex flex-col flex-1 min-h-[300px] overflow-hidden">
              <div className="p-4 border-b border-gray-800 bg-gray-900/30 flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Live Gateway Logs
                </h2>
                <button onClick={() => setLogs([])} className="text-xs text-gray-500 hover:text-white transition-colors">Clear</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-600 flex h-full items-center justify-center">Awaiting requests...</div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className={`p-3 rounded-lg border ${
                      log.type === 'error' ? 'bg-rose-950/20 border-rose-900/50' : 
                      log.type === 'warning' ? 'bg-amber-950/20 border-amber-900/50' :
                      log.type === 'success' ? 'bg-emerald-950/20 border-emerald-900/50' :
                      'bg-gray-800/30 border-gray-700/50'
                    }`}>
                      <div className="flex justify-between text-gray-500 mb-1">
                        <span>{log.time}</span>
                        <span className={`uppercase font-bold tracking-wider ${
                          log.type === 'error' ? 'text-rose-500' : 
                          log.type === 'warning' ? 'text-amber-500' :
                          log.type === 'success' ? 'text-emerald-500' :
                          'text-indigo-400'
                        }`}>{log.type}</span>
                      </div>
                      <div className="text-gray-200 font-semibold mb-1.5">{log.message}</div>
                      {log.details && (
                        <div className="bg-black/40 p-2 rounded border border-gray-800/50 overflow-x-auto text-[10px] text-gray-400">
                          <pre>{JSON.stringify(log.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
