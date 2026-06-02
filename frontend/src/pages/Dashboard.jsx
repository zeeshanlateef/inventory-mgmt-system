import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch(err => addToast({ type: 'error', title: 'Error loading dashboard', message: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="loading-spinner" />
      <span>Loading dashboard...</span>
    </div>
  );

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.total_products ?? 0,
      icon: 'fa-solid fa-boxes-stacked',
      color: 'var(--accent)',
      bg: 'rgba(0,212,170,0.1)',
      path: '/products'
    },
    {
      label: 'Total Customers',
      value: stats?.total_customers ?? 0,
      icon: 'fa-solid fa-users',
      color: 'var(--info)',
      bg: 'rgba(59,130,246,0.1)',
      path: '/customers'
    },
    {
      label: 'Total Orders',
      value: stats?.total_orders ?? 0,
      icon: 'fa-solid fa-cart-shopping',
      color: 'var(--warning)',
      bg: 'rgba(245,158,11,0.1)',
      path: '/orders'
    },
    {
      label: 'Total Revenue',
      value: `₹${(stats?.total_revenue ?? 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: 'fa-solid fa-hand-holding-dollar',
      color: 'var(--success)',
      bg: 'rgba(16,185,129,0.1)',
      path: '/orders'
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Welcome back! Here's what's happening with your inventory.</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(card => (
          <div
            key={card.label}
            className="stat-card"
            style={{ '--accent-color': card.color, cursor: 'pointer' }}
            onClick={() => navigate(card.path)}
          >
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              <i className={card.icon}></i>
            </div>
            <div className="stat-info">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-12 mb-16">
          <span style={{ fontSize: 20, color: 'var(--warning)' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Low Stock Alert</div>
            <div className="text-muted">Products with less than 10 units remaining</div>
          </div>
        </div>

        {!stats?.low_stock_products?.length ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 10, color: 'var(--success)' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div style={{ fontWeight: 500 }}>All products are well stocked!</div>
          </div>
        ) : (
          <div>
            {stats.low_stock_products.map(product => (
              <div key={product.id} className="low-stock-item">
                <div>
                  <div className="low-stock-name">{product.name}</div>
                  <div className="low-stock-sku">SKU: {product.sku}</div>
                </div>
                <div className="flex items-center gap-8">
                  <span className={`badge ${product.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                    {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} left`}
                  </span>
                  <span className="text-muted" style={{ fontSize: 13 }}>
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
