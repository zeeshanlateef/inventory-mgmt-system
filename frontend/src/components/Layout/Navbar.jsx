import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const titles = {
  '/': 'Dashboard',
  '/products': 'Product Management',
  '/customers': 'Customer Management',
  '/orders': 'Order Management',
};

export default function Navbar() {
  const location = useLocation();
  const title = titles[location.pathname] || 'InventoryPro';
  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className="navbar">
      <div>
        <div className="navbar-title">{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{now}</div>
      </div>
      <div className="navbar-actions">
        <button
          onClick={toggleTheme}
          className="btn btn-icon"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px' }}
        >
          <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--info))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '700', color: '#000',
          flexShrink: 0
        }}>A</div>
      </div>
    </header>
  );
}
