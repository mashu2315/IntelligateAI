import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Route as RouteIcon, Settings2, ScrollText, TestTube2, Zap, Users as UsersIcon } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Zap className="brand-icon" />
          <h2>IntelliGate AI</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FolderKanban size={20} />
            <span>Projects</span>
          </NavLink>
          <NavLink to="/routes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <RouteIcon size={20} />
            <span>Routes</span>
          </NavLink>
          <NavLink to="/config" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Settings2 size={20} />
            <span>Gateway Config</span>
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <UsersIcon size={20} />
            <span>Users</span>
          </NavLink>
          <NavLink to="/logs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <ScrollText size={20} />
            <span>API Logs</span>
          </NavLink>
          <NavLink to="/tester" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <TestTube2 size={20} />
            <span>API Tester</span>
          </NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
