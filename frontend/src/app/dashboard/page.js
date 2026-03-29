"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Plus, Activity, Server, Key } from "lucide-react";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  // New Project Form
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/management/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/management/projects", {
        name, targetBaseUrl: targetUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreate(false);
      setName("");
      setTargetUrl("");
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your gateways, policies, and API keys.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {showCreate && (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Create a New Project</h2>
          <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Project Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="e.g. Production Gateway" />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Target Base URL</label>
              <input required value={targetUrl} onChange={e => setTargetUrl(e.target.value)} type="url" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="https://api.mybackend.com" />
            </div>
            <div className="flex items-center gap-2 h-9">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-electric text-white rounded-md font-medium hover:bg-electric:hover">Create</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-gray-200 rounded-xl bg-gray-50 border-dashed">
          <Server className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No projects yet</h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">Create your first project to start routing your API traffic through IntelliGate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link key={project._id} href={`/dashboard/${project._id}`} className="group block h-full">
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                    <Server className="text-electric w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Active
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-electric transition-colors">{project.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1 flex items-center gap-1.5">
                  <Activity size={14} />
                  {project.targetBaseUrl}
                </p>

                <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key size={14} className="text-gray-400" />
                    <code className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded font-mono">
                      {project.apiKey.substring(0, 8)}...
                    </code>
                  </div>
                  <span className="text-sm font-medium text-electric group-hover:underline">View policies &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
