"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Search, ShieldAlert, Zap, Server, BarChart3, KeyRound } from "lucide-react";
import Link from "next/link";
import RouteConfigModal from "../../../components/RouteConfigModal";
import AuthSettings from "../../../components/AuthSettings";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("routes");
  const [showRouteModal, setShowRouteModal] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [projRes, logsRes] = await Promise.all([
        axios.get(`http://localhost:5000/management/projects/${projectId}`, { headers }),
        axios.get(`http://localhost:5000/management/logs/${projectId}`, { headers })
      ]);
      
      setData(projRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const handleDeleteRoute = async (routeId) => {
    if (!confirm("Are you sure you want to delete this route policy?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/management/routes/${routeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjectDetails();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading project details...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load project</div>;

  const { project, routes, stats } = data;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 w-fit mb-4">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            {project.name}
          </h1>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
              <Server size={14} /> {project.targetBaseUrl}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-1 border border-purple-200 bg-purple-50 text-electric rounded-lg font-mono">
              Key: {project.apiKey}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-3 bg-white border border-gray-200 shadow-sm rounded-xl min-w-[140px]">
            <p className="text-xs font-semibold text-gray-500 uppercase">Requests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          <button 
            onClick={() => setActiveTab("routes")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "routes" ? "border-electric text-electric" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Route Policies
          </button>
          <button 
            onClick={() => setActiveTab("auth")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "auth" ? "border-electric text-electric" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Auth Config
          </button>
          <button 
            onClick={() => setActiveTab("logs")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "logs" ? "border-electric text-electric" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Traffic Logs
          </button>
        </nav>
      </div>

      {activeTab === "routes" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Configured Routes</h2>
            <button 
              onClick={() => setShowRouteModal(true)}
              className="bg-black text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors shadow-sm"
            >
              Add Route Policy
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Path & Method</th>
                  <th className="px-6 py-4">Authentication</th>
                  <th className="px-6 py-4">Rate Limiting</th>
                  <th className="px-6 py-4">Edge Caching</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No routes configured. Traffic to unconfigured routes will be rejected.
                    </td>
                  </tr>
                )}
                {routes.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.method==='GET' ? 'bg-blue-100 text-blue-700' : r.method==='POST' ? 'bg-green-100 text-green-700' : r.method==='ALL' ? 'bg-gray-200 text-gray-800' : 'bg-purple-100 text-purple-700'}`}>
                          {r.method}
                        </span>
                        <code className="text-gray-900 font-mono">{r.path}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {r.authRequired ? (
                        <div className="flex items-center gap-1.5 text-electric font-medium">
                          <KeyRound size={14} /> Secured
                        </div>
                      ) : (
                        <span className="text-gray-400">Public</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {r.rateLimit.limit > 0 ? (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <ShieldAlert size={14} className="text-orange-500" />
                          {r.rateLimit.limit} req / {r.rateLimit.window}s
                        </div>
                      ) : (
                        <span className="text-gray-400">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {r.cacheEnabled ? (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Zap size={14} className="text-yellow-500" />
                          {r.cacheTTL}s TTL
                        </div>
                      ) : (
                        <span className="text-gray-400">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteRoute(r._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "auth" && (
        <AuthSettings project={project} onUpdate={fetchProjectDetails} />
      )}

      {activeTab === "logs" && (
        <div>
          <div className="flex items-center gap-3 mb-6 bg-blue-50/50 p-4 border border-blue-100 rounded-xl text-blue-800 text-sm">
            <BarChart3 className="shrink-0" size={18} />
            Showing the latest {logs.length} requests processed by IntelliGate.
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No logs available.
                    </td>
                  </tr>
                )}
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-800">
                      {log.route}
                    </td>
                    <td className="px-6 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.method==='GET' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-800'}`}>
                          {log.method}
                        </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded inline-flex items-center gap-1.5 font-medium ${log.status >= 400 ? 'text-red-700' : log.status >= 300 ? 'text-yellow-700' : 'text-green-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status >= 400 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                      {log.latency}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRouteModal && (
        <RouteConfigModal 
          projectId={projectId} 
          onClose={() => setShowRouteModal(false)} 
          onSuccess={() => {
            setShowRouteModal(false);
            fetchProjectDetails();
          }} 
        />
      )}
    </div>
  );
}
