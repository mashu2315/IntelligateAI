"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Shield, Zap } from "lucide-react";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@intelligate.ai");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const endpoint = isLogin ? "/management/login" : "/management/register";
      const payload = isLogin ? { email, password } : { name: "Admin User", email, password };
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, payload);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
         setError(err.response.data.error);
      } else {
         setError("Connection error. Ensure backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full bg-[#fcfcfc]">
      {/* Left side: Hero & Features */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-purple-100/50 blur-3xl mix-blend-multiply opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-3xl mix-blend-multiply opacity-50 pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-electric text-sm font-semibold mb-6 border border-purple-100">
            <Zap size={14} className="fill-electric" />
            Supercharge your APIs
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Intelligent Traffic <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7000FF] to-[#3B82F6]">
              Optimization.
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            The modern Gateway-as-a-Service for developers. Pluggable rate-limiting, edge caching, and analytics without modifying your source code.
          </p>
          
          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Shield className="text-blue-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure by Default</h3>
                <p className="text-sm text-gray-500 mt-1">Automatic API Key validation & JWT generation.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                <Activity className="text-purple-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dynamic Rate Limiting</h3>
                <p className="text-sm text-gray-500 mt-1">Configure limits on the fly using our visual dashboard powered by Redis.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center p-8 lg:p-16 border-l border-gray-100 bg-white shadow-[0_0_50px_rgba(0,0,0,0.02)] z-10">
        <div className="w-full max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900">{isLogin ? "Welcome back" : "Create an account"}</h2>
            <p className="text-sm text-gray-500 mt-2">Enter your credentials to access the console.</p>
            
            <form onSubmit={handleAuth} className="mt-8 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email address</label>
                <input 
                  type="email" 
                  autoFocus 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-electric transition-all"
                  placeholder="admin@intelligate.ai"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-electric transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-electric text-white py-2.5 rounded-lg font-medium hover:bg-electric:hover transition-colors flex justify-center items-center gap-2 group shadow-lg shadow-purple-500/20"
              >
                {loading ? "Connecting..." : (isLogin ? "Sign In" : "Sign Up")}
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
            
            <p className="mt-6 text-center text-sm text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-electric font-medium hover:underline">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
