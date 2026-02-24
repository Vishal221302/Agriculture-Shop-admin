import React, { useState, useEffect } from 'react';
import { AdminLayout, useAuth } from '../App';

export default function CategoriesPage() {
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const BLANK = { name_hi: '', name_en: '', icon: '🌾' };
    const [form, setForm] = useState(BLANK);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const authH = { Authorization: `Bearer ${token}` };

    const fetchCategories = () => {
        setLoading(true);
        fetch('/api/admin/categories', { headers: authH })
            .then(r => r.json()).then(d => setCategories(d.data || []))
            .catch(() => showAlert('error', 'Failed to fetch categories'))
            .finally(() => setLoading(false));
    };
    useEffect(() => { fetchCategories(); }, []);

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert(null), 3500);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        const r = new FileReader();
        r.onload = ev => setImagePreview(ev.target.result);
        r.readAsDataURL(file);
    };

    const openAdd = () => { setForm(BLANK); setEditId(null); setImageFile(null); setImagePreview(null); setShowForm(true); };
    const openEdit = (cat) => {
        setForm({ name_hi: cat.name_hi, name_en: cat.name_en, icon: cat.icon || '🌾' });
        setEditId(cat.id);
        setImageFile(null);
        setImagePreview(cat.category_image ? `/uploads/${cat.category_image}` : null);
        setShowForm(true);
    };
    const closeForm = () => { setShowForm(false); setEditId(null); setImageFile(null); setImagePreview(null); };

    const handleSubmit = async () => {
        if (!form.name_hi || !form.name_en) { showAlert('error', 'Both name fields required'); return; }
        const fd = new FormData();
        fd.append('name_hi', form.name_hi);
        fd.append('name_en', form.name_en);
        fd.append('icon', form.icon);
        if (imageFile) fd.append('category_image', imageFile);

        const url = editId ? `/api/admin/categories/${editId}` : '/api/admin/categories';
        const method = editId ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, { method, headers: authH, body: fd });
            const data = await res.json();
            if (data.success) { showAlert('success', editId ? 'Category updated!' : 'Category created!'); closeForm(); fetchCategories(); }
            else showAlert('error', data.message);
        } catch { showAlert('error', 'Server error'); }
    };

    const handleDelete = async (id) => {
        if (!deleteId) { setDeleteId(id); return; }
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', headers: authH });
            const data = await res.json();
            if (data.success) { showAlert('success', 'Category deleted'); fetchCategories(); }
            else showAlert('error', data.message);
        } catch { showAlert('error', 'Server error'); }
        setDeleteId(null);
    };

    return (
        <AdminLayout pageTitle="🗂️ Categories | श्रेणियां">
            {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn btn-primary" onClick={openAdd}>➕ Add Category</button>
            </div>

            {/* FORM */}
            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-title">{editId ? '✏️ Edit Category' : '➕ New Category'}</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Hindi Name (हिंदी) *</label>
                            <input type="text" placeholder="गेहूं" value={form.name_hi} onChange={e => setForm({ ...form, name_hi: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>English Name *</label>
                            <input type="text" placeholder="Wheat" value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Emoji Icon (fallback)</label>
                            <input type="text" placeholder="🌾" value={form.icon} maxLength={4} onChange={e => setForm({ ...form, icon: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Category Image (optional)</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" style={{ marginTop: 8, width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green-200)' }} />
                            )}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-primary" onClick={handleSubmit}>💾 Save</button>
                        <button className="btn btn-secondary" onClick={closeForm}>Cancel</button>
                    </div>
                </div>
            )}

            {/* TABLE */}
            {loading ? <div className="loading-text"><div className="spinner" /> Loading...</div> : (
                <div className="card">
                    <div className="card-title">📋 All Categories ({categories.length})</div>
                    {categories.length === 0 ? (
                        <div className="empty-state">No categories yet. Add your first category!</div>
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Image</th><th>Icon</th><th>Hindi</th><th>English</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {categories.map(cat => (
                                        <tr key={cat.id} style={{ verticalAlign: 'middle' }}>
                                            <td style={{ padding: '5px 8px' }}>
                                                {cat.category_image ? (
                                                    <img src={`/uploads/${cat.category_image}`} alt={cat.name_en}
                                                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--green-100)' }} />
                                                ) : <span style={{ opacity: 0.4, fontSize: '0.75rem' }}>—</span>}
                                            </td>
                                            <td style={{ fontSize: '1.2rem', padding: '5px 8px' }}>{cat.icon}</td>
                                            <td style={{ fontWeight: 600, fontSize: '0.88rem', padding: '5px 8px' }}>{cat.name_hi}</td>
                                            <td style={{ fontSize: '0.85rem', padding: '5px 8px' }}>{cat.name_en}</td>
                                            <td style={{ padding: '5px 8px' }}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="btn-icon" onClick={() => openEdit(cat)} title="Edit">✏️</button>
                                                    {deleteId === cat.id ? (
                                                        <>
                                                            <button className="btn-icon danger" onClick={() => handleDelete(cat.id)}>✅ Confirm</button>
                                                            <button className="btn-icon" onClick={() => setDeleteId(null)}>✖️</button>
                                                        </>
                                                    ) : (
                                                        <button className="btn-icon danger" onClick={() => handleDelete(cat.id)} title="Delete">🗑️</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
