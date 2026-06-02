import React, { useState, useEffect } from 'react';
import { ordersApi, productsApi, customersApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchAll = async () => {
    try {
      const [ordersData, productsData, customersData] = await Promise.all([
        ordersApi.getAll(),
        productsApi.getAll(),
        customersApi.getAll(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setSelectedCustomer('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setFormError('');
    setCreateModalOpen(true);
  };

  const closeCreate = () => {
    setCreateModalOpen(false);
    setFormError('');
  };

  const addItemRow = () =>
    setOrderItems(prev => [...prev, { product_id: '', quantity: 1 }]);

  const removeItemRow = (idx) =>
    setOrderItems(prev => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) =>
    setOrderItems(prev =>
      prev.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    );

  const calcTotal = () =>
    orderItems.reduce((sum, item) => {
      const product = products.find(p => p.id === Number(item.product_id));
      if (!product || !item.quantity) return sum;
      return sum + Number(product.price) * Number(item.quantity);
    }, 0);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedCustomer) {
      setFormError('Please select a customer.');
      return;
    }
    if (orderItems.some(i => !i.product_id || !i.quantity || Number(i.quantity) < 1)) {
      setFormError('All items need a product selected and quantity of at least 1.');
      return;
    }

    // Check for duplicate products
    const productIds = orderItems.map(i => i.product_id);
    if (new Set(productIds).size !== productIds.length) {
      setFormError('Each product can only appear once per order.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_id: Number(selectedCustomer),
        items: orderItems.map(i => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
        })),
      };
      await ordersApi.create(payload);
      addToast({ type: 'success', title: 'Order Created', message: 'Order placed and stock updated.' });
      closeCreate();
      fetchAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const [cancelTarget, setCancelTarget] = useState(null);

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      await ordersApi.delete(cancelTarget.id);
      addToast({
        type: 'success',
        title: 'Order Cancelled',
        message: `Order #${cancelTarget.id} cancelled and stock restored.`,
      });
      setCancelTarget(null);
      fetchAll();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
      setCancelTarget(null);
    }
  };

  const statusBadge = (status) => {
    if (status === 'confirmed') return 'badge-success';
    if (status === 'pending') return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p>Create and manage customer orders with automatic stock tracking.</p>
        </div>
        <button id="create-order-btn" className="btn btn-primary" onClick={openCreate}>
          + Create Order
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="loading-spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon" style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
            <h3>No orders yet</h3>
            <p>Create your first order to get started.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>
                    <span className="badge badge-info font-mono">#{order.id}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{order.customer?.full_name ?? '—'}</td>
                  <td className="text-muted" style={{ fontSize: '13px' }}>
                    {order.items?.map(item => `${item.product?.name || 'Unknown'} (x${item.quantity})`).join(', ') || '—'}
                  </td>
                  <td className="text-accent" style={{ fontWeight: 600 }}>
                    ₹{Number(order.total_amount).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        id={`view-order-${order.id}`}
                        className="btn btn-icon"
                        onClick={() => setDetailOrder(order)}
                        title="View order details"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button
                        id={`delete-order-${order.id}`}
                        className="btn btn-icon btn-danger"
                        onClick={() => setCancelTarget(order)}
                        title="Cancel order"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      {createModalOpen && (
        <div className="modal-overlay" onClick={closeCreate}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Order</h3>
              <button className="btn btn-icon" onClick={closeCreate} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-error">
                    <span><i className="fa-solid fa-triangle-exclamation"></i></span>
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label required" htmlFor="order-customer">Customer</label>
                  <select
                    id="order-customer"
                    className="form-select"
                    value={selectedCustomer}
                    onChange={e => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">— Select a customer —</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Order Items</label>
                  <div className="order-items-list">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <select
                          className="form-select"
                          value={item.product_id}
                          onChange={e => updateItem(idx, 'product_id', e.target.value)}
                        >
                          <option value="">— Select product —</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.quantity}) — ₹{Number(p.price).toFixed(2)}
                            </option>
                          ))}
                        </select>
                        <input
                          className="form-input"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                        />
                        {orderItems.length > 1 && (
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeItemRow(idx)}
                            title="Remove item"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm mt-8"
                    onClick={addItemRow}
                  >
                    + Add Item
                  </button>
                </div>

                <div className="divider" />
                <div className="flex justify-between items-center">
                  <span className="text-muted">Estimated Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
                    ₹{calcTotal().toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeCreate}>
                  Cancel
                </button>
                <button
                  id="submit-order-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Order #{detailOrder.id} — Details</h3>
              <button className="btn btn-icon" onClick={() => setDetailOrder(null)} aria-label="Close">✕</button>
            </div>
            <div className="modal-body">
              {/* Customer Info */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{
                  fontWeight: 600, marginBottom: 10,
                  color: 'var(--text-secondary)', fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>
                  Customer Information
                </div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{detailOrder.customer?.full_name}</div>
                <div className="text-muted">{detailOrder.customer?.email}</div>
                {detailOrder.customer?.phone && (
                  <div className="text-muted">{detailOrder.customer.phone}</div>
                )}
              </div>

              {/* Order Items */}
              <div style={{
                fontWeight: 600, marginBottom: 12,
                color: 'var(--text-secondary)', fontSize: 11,
                textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>
                Order Items ({detailOrder.items?.length ?? 0})
              </div>
              {detailOrder.items?.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.product?.name}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      SKU: {item.product?.sku} · ₹{Number(item.unit_price).toFixed(2)} each
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>×{item.quantity}</div>
                    <div className="text-accent" style={{ fontWeight: 600 }}>
                      ₹{(Number(item.unit_price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="divider" />

              <div className="flex justify-between items-center">
                <span style={{ fontWeight: 600, fontSize: 15 }}>Total Amount</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>
                  ₹{Number(detailOrder.total_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-8">
                <span className="text-muted">Status</span>
                <span className={`badge ${statusBadge(detailOrder.status)}`}>
                  {detailOrder.status}
                </span>
              </div>
              <div className="flex justify-between items-center mt-8">
                <span className="text-muted">Order Date</span>
                <span className="text-muted">
                  {new Date(detailOrder.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetailOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Cancel Order</h3>
              <button className="btn btn-icon" onClick={() => setCancelTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel order <strong>#{cancelTarget.id}</strong>? Stock will be restored.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCancelTarget(null)}>No, Keep Order</button>
              <button className="btn btn-danger" onClick={confirmCancel}>Yes, Cancel Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
