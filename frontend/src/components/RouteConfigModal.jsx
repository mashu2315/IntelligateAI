"use client";
import { useState } from "react";
import axios from "axios";
import { X, Save, Zap, ShieldAlert, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RouteConfigModal({ projectId, onClose, onSuccess }) {
  const [path, setPath] = useState("/*");
  const [method, setMethod] = useState("ALL");
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false);
  const [limit, setLimit] = useState(100);
  const [window, setWindow] = useState(60);
  const [cacheEnabled, setCacheEnabled] = useState(false);
  const [cacheTTL, setCacheTTL] = useState(300);
  const [authRequired, setAuthRequired] = useState(false);
  const [loggingEnabled, setLoggingEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/management/routes", {
        projectId,
        path,
        method,
        rateLimit: rateLimitEnabled ? { limit: Number(limit), window: Number(window) } : { limit: 0, window: 60 },
        authRequired,
        cacheEnabled,
        cacheTTL: Number(cacheTTL),
        loggingEnabled
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to create route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">New Route Policy</h2>
              <p className="text-sm text-gray-500 mt-0.5">Configure matching rules and gateway actions.</p>
             </div>
            <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 text-left">
            <form id="route-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Trigger Matching */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Code size={16} className="text-gray-400" />
                  Request Matching
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Path Pattern</label>
                    <input required value={path} onChange={e => setPath(e.target.value)} type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-mono shadow-sm" placeholder="/api/v1/*" />
                    <p className="text-xs text-gray-500">Use /* to match all sub-paths (e.g. /users/*)</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Method</label>
                    <select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black shadow-sm font-medium">
                      <option value="ALL">ALL</option>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rate Limiting */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert size={16} className="text-orange-400" />
                    Rate Limiting
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={rateLimitEnabled} onChange={e => setRateLimitEnabled(e.target.checked)} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                {rateLimitEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-orange-800 uppercase tracking-wider">Requests Limit</label>
                      <input type="number" value={limit} onChange={e => setLimit(e.target.value)} className="w-full px-3 py-2 text-sm border border-orange-200 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-orange-800 uppercase tracking-wider">Time Window (s)</label>
                      <input type="number" value={window} onChange={e => setWindow(e.target.value)} className="w-full px-3 py-2 text-sm border border-orange-200 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Authentication Requirement */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert size={16} className="text-electric" />
                    Require Authentication
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={authRequired} onChange={e => setAuthRequired(e.target.checked)} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric"></div>
                  </label>
                </div>
                {authRequired && (
                  <p className="text-xs text-gray-500">Clients must provide a valid JWT from your GaaS Identity Provider in the <code className="font-mono bg-gray-100 px-1">Authorization: Bearer</code> header. GaaS will automatically validate it and attach an <code className="font-mono bg-gray-100 px-1">x-user-id</code> before forwarding.</p>
                )}
              </div>

              {/* Edge Caching */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" />
                    Edge Caching (GET Only)
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={cacheEnabled} onChange={e => setCacheEnabled(e.target.checked)} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                {cacheEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 max-w-[50%]">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-yellow-800 uppercase tracking-wider">Cache TTL (s)</label>
                      <input type="number" value={cacheTTL} onChange={e => setCacheTTL(e.target.value)} className="w-full px-3 py-2 text-sm border border-yellow-200 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 shadow-sm" />
                    </div>
                  </motion.div>
                )}
              </div>
            </form>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
            <button type="submit" form="route-form" disabled={loading} className="px-5 py-2 text-sm bg-black text-white rounded-md font-medium hover:bg-gray-800 flex items-center gap-2 shadow-sm transition-colors">
              <Save size={16} />
              {loading ? "Saving..." : "Save Route Policy"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
