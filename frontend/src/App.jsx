import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import GatewayRoutes from './pages/GatewayRoutes'; // Renamed from Routes to avoid conflict
import GatewayConfig from './pages/GatewayConfig';
import ApiLogs from './pages/ApiLogs';
import ApiTester from './pages/ApiTester';
import Users from './pages/Users';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="routes" element={<GatewayRoutes />} />
          <Route path="config" element={<GatewayConfig />} />
          <Route path="users" element={<Users />} />
          <Route path="logs" element={<ApiLogs />} />
          <Route path="tester" element={<ApiTester />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
