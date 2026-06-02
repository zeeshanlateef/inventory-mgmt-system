import React, { useState, useEffect } from 'react';
import { productsApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const initialForm = { name: '', sku: '', price: '', quantity: '', description: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      price: p.price,
      quantity: p.quantity,
      description: p.description || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(initialForm);
    setFormError('');
  };

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.sku.trim() || form.price === '' || form.quantity === '') {
      setFormError('Name, SKU, price, and quantity are required.');
      return;
    }
    if (Number(form.price) < 0) { setFormError('Price cannot be negative.'); return; }
    if (Number(form.quantity) < 0) { setFormError('Quantity cannot be negative.'); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      };
      if (editing) {
        await productsApi.update(editing.id, payload);
        addToast({ type: 'success', title: 'Updated', message: `${form.name} updated successfully.` });
      } else {
        await productsApi.create(payload);
        addToast({ type: 'success', title: 'Created', message: `${form.name} added to inventory.` });
      }
      closeModal();
      fetchProducts();
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
      await productsApi.delete(deleteTarget.id);
      addToast({ type: 'success', title: 'Deleted', message: `${deleteTarget.name} has been removed.` });
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
      setDeleteTarget(null);
    }
  };

  const stockBadge = (qty) => {
    if (qty === 0) return 'badge-danger';
    if (qty < 10) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>Manage your product catalog and inventory levels.</p>
        </div>
        <button id="add-product-btn" className="btn btn-primary" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="loading-spinner" /></div>
      ) : products.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon" style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
            <h3>No products yet</h3>
            <p>Get started by adding your first product to the catalog.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Description</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td>
                    <span className="badge badge-info font-mono">{product.sku}</span>
                  </td>
                  <td className="text-accent" style={{ fontWeight: 600 }}>
                    ₹{Number(product.price).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${stockBadge(product.quantity)}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td
                    className="text-muted truncate"
                    style={{ maxWidth: 200 }}
                    title={product.description || ''}
                  >
                    {product.description || '—'}
                  </td>
                  <td className="text-muted">
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        id={`edit-product-${product.id}`}
                        className="btn btn-icon"
                        onClick={() => openEdit(product)}
                        title="Edit product"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        id={`delete-product-${product.id}`}
                        className="btn btn-icon btn-danger"
                        onClick={() => setDeleteTarget(product)}
                        title="Delete product"
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

      {/* Product Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</h3>
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
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required" htmlFor="product-name">Product Name</label>
                    <input
                      id="product-name"
                      className="form-input"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Wireless Keyboard"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required" htmlFor="product-sku">SKU / Code</label>
                    <input
                      id="product-sku"
                      className="form-input"
                      name="sku"
                      value={form.sku}
                      onChange={handleChange}
                      placeholder="e.g. WK-001"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required" htmlFor="product-price">Price (₹)</label>
                    <input
                      id="product-price"
                      className="form-input"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required" htmlFor="product-quantity">Quantity in Stock</label>
                    <input
                      id="product-quantity"
                      className="form-input"
                      name="quantity"
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-description">Description</label>
                  <textarea
                    id="product-description"
                    className="form-textarea"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Optional product description..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  id="submit-product-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
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
              <p>Are you sure you want to delete product <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
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
