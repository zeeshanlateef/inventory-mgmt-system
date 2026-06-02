import React, { useState, useEffect } from 'react';
import { customersApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const initialForm = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openCreate = () => { setForm(initialForm); setFormError(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setForm(initialForm); setFormError(''); };
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.full_name.trim() || !form.email.trim()) {
      setFormError('Full name and email are required.');
      return;
    }
    setSubmitting(true);
    try {
      await customersApi.create(form);
      addToast({ type: 'success', title: 'Created', message: `${form.full_name} added successfully.` });
      closeModal();
      fetchCustomers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await customersApi.delete(deleteTarget.id);
      addToast({ type: 'success', title: 'Deleted', message: `${deleteTarget.full_name} has been removed.` });
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
      setDeleteTarget(null);
    }
  };

  // Generate avatar color from customer id
  const avatarColor = (id) => `hsl(${(id * 47) % 360}, 55%, 40%)`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p>Manage your customer database and contact information.</p>
        </div>
        <button id="add-customer-btn" className="btn btn-primary" onClick={openCreate}>
          + Add Customer
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="loading-spinner" /></div>
      ) : customers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon" style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <h3>No customers yet</h3>
            <p>Add your first customer to get started with order management.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div className="flex items-center gap-8">
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: avatarColor(customer.id),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, flexShrink: 0, color: '#fff',
                      }}>
                        {customer.full_name[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{customer.full_name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{customer.email}</td>
                  <td className="text-muted">{customer.phone || '—'}</td>
                  <td className="text-muted">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        id={`delete-customer-${customer.id}`}
                        className="btn btn-icon btn-danger"
                        onClick={() => setDeleteTarget(customer)}
                        title="Delete customer"
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

      {/* Add Customer Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Customer</h3>
              <button className="btn btn-icon" onClick={closeModal} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-error">
                    <span><i className="fa-solid fa-triangle-exclamation"></i></span>
                    <span>{formError}</span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label required" htmlFor="customer-name">Full Name</label>
                  <input
                    id="customer-name"
                    className="form-input"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Jane Smith"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required" htmlFor="customer-email">Email Address</label>
                  <input
                    id="customer-email"
                    className="form-input"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="customer-phone">Phone Number</label>
                  <input
                    id="customer-phone"
                    className="form-input"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  id="submit-customer-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
              <button className="btn btn-icon" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete customer <strong>{deleteTarget.full_name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
