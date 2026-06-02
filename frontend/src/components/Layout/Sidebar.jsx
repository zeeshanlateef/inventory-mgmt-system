import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', icon: 'fa-solid fa-chart-simple', label: 'Dashboard' },
  { path: '/products', icon: 'fa-solid fa-boxes-stacked', label: 'Products' },
  { path: '/customers', icon: 'fa-solid fa-users', label: 'Customers' },
  { path: '/orders', icon: 'fa-solid fa-cart-shopping', label: 'Orders' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <i className="fa-solid fa-cubes" style={{ color: '#000' }}></i>
        </div>
        <div>
          <h1>InventoryPro</h1>
          <span>Management System</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">
              <i className={item.icon}></i>
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{ fontSize: '11px', opacity: 0.7 }}>v1.0.0 · FastAPI + React</div>
      </div>
    </aside>
  );
}
