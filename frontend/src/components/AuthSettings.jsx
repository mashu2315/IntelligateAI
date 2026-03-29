"use client";

import { useState } from "react";
import axios from "axios";
import { ShieldCheck, Save, Users, KeyRound, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthSettings({ project, onUpdate }) {
  const [enabled, setEnabled] = useState(project.authConfig?.enabled || false);
  const [loginEndpoint, setLoginEndpoint] = useState(project.authConfig?.loginEndpoint || "/auth/login");
  const [signupEndpoint, setSignupEndpoint] = useState(project.authConfig?.signupEndpoint || "/auth/signup");
  const [fields, setFields] = useState(project.authConfig?.requiredFields || []);
  const [newField, setNewField] = useState("");
  const [loading, setLoading] = useState(false);

  const addField = () => {
    if (newField && !fields.includes(newField)) {
      setFields([...fields, newField]);
      setNewField("");
    }
  };

  const removeField = (f) => setFields(fields.filter(x => x !== f));

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/management/projects/${project._id}/auth`, {
        enabled,
        loginEndpoint,
        signupEndpoint,
        requiredFields: fields
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
      alert("Auth Settings Saved Successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save auth settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-3xl">
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-electric" />
            Gateway Authentication Service
          </h2>
          <p className="text-gray-500 text-sm mt-1 max-w-lg">
            Turn IntelliGate into your Identity Provider. We will intercept signup/login requests, store end-user credentials securely, and automatically generate/validate JWTs for your clients.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-electric rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric"></div>
        </label>
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-8 overflow-hidden">
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><KeyRound size={16}/> Login Endpoint</label>
                <input value={loginEndpoint} onChange={e => setLoginEndpoint(e.target.value)} type="text" className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-electric transition-shadow" placeholder="/auth/login" />
                <p className="text-xs text-gray-400">Gateway intercepts POST requests here to validate passwords and return a JWT.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Users size={16}/> Signup Endpoint</label>
                <input value={signupEndpoint} onChange={e => setSignupEndpoint(e.target.value)} type="text" className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-electric transition-shadow" placeholder="/auth/signup" />
                <p className="text-xs text-gray-400">Gateway creates a new End-User and returns a JWT instantly.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 block">Required Signup Fields</label>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium border border-gray-300">email (Locked)</span>
                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium border border-gray-300">password (Locked)</span>
                
                {fields.map(f => (
                  <span key={f} className="px-3 py-1 bg-white text-gray-700 rounded-full text-xs font-medium border border-gray-300 flex items-center gap-1 shadow-sm">
                    {f} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeField(f)} />
                  </span>
                ))}
              </div>
              <div className="flex gap-2 w-full max-w-sm">
                <input value={newField} onChange={e => setNewField(e.target.value)} onKeyDown={e => e.key === 'Enter' && addField()} type="text" className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-electric" placeholder="e.g. phone_number" />
                <button onClick={addField} className="px-3 py-2 bg-gray-900 text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"><Plus size={16}/></button>
              </div>
              <p className="text-xs text-gray-500 mt-1">These fields will be validated before signup and forwarded to your backend inside the JWT context.</p>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 text-sm bg-electric text-white rounded-lg font-medium hover:bg-electric:hover shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2">
                <Save size={16} />
                {loading ? "Saving..." : "Save Identity Settings"}
              </button>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
