import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalyticsOverview, getAnalyticsTraffic } from '../services/api';

const Home = () => {
  const [overview, setOverview] = useState({ totalRequests: 0, avgLatency: 0, errorRate: 0, cacheHitRate: 0 });
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, trafficRes] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsTraffic()
        ]);
        setOverview(overviewRes.data);
        setTrafficData(trafficRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    // In a real app, you might want to set up an interval to refresh this data
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, unit, trend, isGood }) => (
    <div className="card" style={{ flex: 1, minWidth: '200px' }}>
      <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
        {unit && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>}
      </div>
      {trend && (
        <div style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: 600, color: isGood ? 'var(--success)' : 'var(--danger)' }}>
          {trend} vs last hour
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      <p className="page-subtitle">Real-time metrics and health of your API Gateway</p>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <StatCard 
              title="Total Requests" 
              value={(overview.totalRequests || 0).toLocaleString()} 
              trend="+12.5%" 
              isGood={true} 
            />
            <StatCard 
              title="Avg Latency" 
              value={Math.round(overview.avgLatency || 0)} 
              unit="ms" 
              trend="-5ms" 
              isGood={true} 
            />
            <StatCard 
              title="Error Rate" 
              value={(overview.errorRate || 0).toFixed(2)} 
              unit="%" 
              trend="+0.1%" 
              isGood={false} 
            />
            <StatCard 
              title="Cache Hit Rate" 
              value={(overview.cacheHitRate || 0).toFixed(1)} 
              unit="%" 
              trend="+5.2%" 
              isGood={true} 
            />
          </div>

          <div className="card" style={{ height: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Gateway Traffic (Requests / Min)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: 'var(--brand-primary)', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="requests" stroke="var(--brand-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
