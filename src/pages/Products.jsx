import React, { useState, useEffect } from 'react';
import { AdminLayout, useAuth } from '../App';
import { API_URL } from '../config';


export default function ProductsPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const BLANK = {
        category_id: '', medicine_name_hi: '', medicine_name_en: '', company_name: '',
        disease_name_hi: '', disease_name_en: '', dosage_per_bigha: '',
        price: '', show_price: '0', show_quantity: '0',
        package_qty: '', package_unit: 'ml',
        usage_hi: '', usage_en: '', video_type: 'youtube', video_url: '',
        is_active: '1'
    };
    const [form, setForm] = useState(BLANK);
    const [productImg, setProductImg] = useState(null);
    const [certImgs, setCertImgs] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [imgPreview, setImgPreview] = useState(null);

    const authH = { Authorization: `Bearer ${token}` };

    const fetchAll = () => {
        setLoading(true);
        Promise.all([
            fetch(`${API_URL}/api/admin/products`, { headers: authH }).then(r => r.json()),
            fetch(`${API_URL}/api/admin/categories`, { headers: authH }).then(r => r.json()),
        ]).then(([p, c]) => {
            setProducts(p.data || []);
            setCategories(c.data || []);
        }).catch(() => showAlert('error', 'Failed to load data'))
            .finally(() => setLoading(false));
    };
    useEffect(() => { fetchAll(); }, []);

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert(null), 4000);
    };

    const openAdd = () => {
        setForm(BLANK); setEditId(null);
        setProductImg(null); setCertImgs(null); setVideoFile(null); setImgPreview(null);
        setShowForm(true);
    };
    const openEdit = (p) => {
        setForm({
            category_id: String(p.category_id),
            medicine_name_hi: p.medicine_name_hi, medicine_name_en: p.medicine_name_en,
            company_name: p.company_name || '',
            disease_name_hi: p.disease_name_hi || '', disease_name_en: p.disease_name_en || '',
            dosage_per_bigha: p.dosage_per_bigha || '',
            price: p.price != null ? String(p.price) : '',
            show_price: String(p.show_price || 0),
            show_quantity: String(p.show_quantity || 0),
            package_qty: p.package_qty != null ? String(p.package_qty) : '',
            package_unit: p.package_unit || 'ml',
            usage_hi: p.usage_hi || '', usage_en: p.usage_en || '',
            video_type: p.video_type || 'youtube',
            video_url: p.video_type !== 'upload' ? (p.video_url || '') : '',
            is_active: String(p.is_active)
        });
        setEditId(p.id); setProductImg(null); setCertImgs(null); setVideoFile(null);
        setImgPreview(p.product_image ? `${API_URL}/uploads/${p.product_image}` : null);
        setShowForm(true);
    };
    const closeForm = () => { setShowForm(false); setEditId(null); setProductImg(null); setCertImgs(null); setVideoFile(null); setImgPreview(null); };

    const handleSubmit = async () => {
        if (!form.category_id || !form.medicine_name_hi || !form.medicine_name_en) {
            showAlert('error', 'Category and both name fields are required'); return;
        }
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (productImg) fd.append('product_image', productImg);
        if (certImgs) Array.from(certImgs).forEach(f => fd.append('certification_images', f));
        if (videoFile && form.video_type === 'upload') fd.append('video_file', videoFile);
        const url = editId ? `${API_URL}/api/admin/products/${editId}` : `${API_URL}/api/admin/products`;
        const method = editId ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, { method, headers: authH, body: fd });
            const data = await res.json();
            if (data.success) { showAlert('success', editId ? 'Product updated!' : 'Product added!'); closeForm(); fetchAll(); }
            else showAlert('error', data.message);
        } catch { showAlert('error', 'Server error'); }
    };

    const handleDelete = async (id) => {
        if (!deleteId) { setDeleteId(id); return; }
        try {
            const res = await fetch(`${API_URL}/api/admin/products/${id}`, { method: 'DELETE', headers: authH });
            const data = await res.json();
            if (data.success) { showAlert('success', 'Product deleted'); fetchAll(); }
            else showAlert('error', data.message);
        } catch { showAlert('error', 'Server error'); }
        setDeleteId(null);
    };

    const fld = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const Toggle = ({ field, label }) => (
        <div className="form-group">
            <label>{label}</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                {[['1', '✅ Yes'], ['0', '🚫 No']].map(([val, lbl]) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                        <input type="radio" name={field} value={val} checked={form[field] === val} onChange={() => fld(field, val)} />
                        {lbl}
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <AdminLayout pageTitle="💊 Products | दवाइयां">
            {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn btn-primary" onClick={openAdd}>➕ Add Product</button>
            </div>

            {/* ——— FORM ——— */}
            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-title">{editId ? '✏️ Edit Product' : '➕ New Product'}</div>

                    {/* BASIC INFO */}
                    <div className="form-section-title">1. Basic Info</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Category *</label>
                            <select value={form.category_id} onChange={e => fld('category_id', e.target.value)}>
                                <option value="">— Select Category —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_hi} / {c.name_en}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={form.is_active} onChange={e => fld('is_active', e.target.value)}>
                                <option value="1">✅ Active</option>
                                <option value="0">🚫 Inactive</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Medicine Name (Hindi) *</label>
                            <input type="text" placeholder="डीएपी खाद" value={form.medicine_name_hi} onChange={e => fld('medicine_name_hi', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Medicine Name (English) *</label>
                            <input type="text" placeholder="DAP Fertilizer" value={form.medicine_name_en} onChange={e => fld('medicine_name_en', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>🏭 Company Name (कंपनी का नाम) — optional</label>
                            <input type="text" placeholder="e.g. Bayer, Syngenta, IFFCO..." value={form.company_name} onChange={e => fld('company_name', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Disease / Problem (Hindi)</label>
                            <input type="text" placeholder="पत्ती मुड़ना, झुलसा" value={form.disease_name_hi} onChange={e => fld('disease_name_hi', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Disease / Problem (English)</label>
                            <input type="text" placeholder="Leaf curl, Blight" value={form.disease_name_en} onChange={e => fld('disease_name_en', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Dosage per Bigha</label>
                            <input type="text" placeholder="1 पैकेट / 1 Packet" value={form.dosage_per_bigha} onChange={e => fld('dosage_per_bigha', e.target.value)} />
                        </div>
                    </div>

                    {/* PRICE & QUANTITY CONTROLS */}
                    <div className="form-section-title">2. Price & Quantity Controls</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Price (₹) — leave blank if not applicable</label>
                            <input type="number" min="0" step="0.01" placeholder="e.g. 250.00" value={form.price} onChange={e => fld('price', e.target.value)} />
                        </div>
                        <Toggle field="show_price" label="Show Price on Website?" />
                        <Toggle field="show_quantity" label="Show Quantity Selector on Website?" />

                        {/* Package Size */}
                        <div className="form-group">
                            <label>📦 Package Size — leave blank if not applicable</label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="e.g. 500"
                                    value={form.package_qty}
                                    onChange={e => fld('package_qty', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <div style={{ display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                                    {['ml', 'L', 'KG', 'g'].map(u => (
                                        <button
                                            key={u}
                                            type="button"
                                            onClick={() => fld('package_unit', u)}
                                            style={{
                                                padding: '8px 12px',
                                                fontWeight: 700,
                                                fontSize: '0.82rem',
                                                border: 'none',
                                                borderRight: u !== 'g' ? '1px solid #e5e7eb' : 'none',
                                                background: form.package_unit === u ? 'var(--green-700)' : '#fff',
                                                color: form.package_unit === u ? '#fff' : '#374151',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                            }}
                                        >{u}</button>
                                    ))}
                                </div>
                            </div>
                            {form.package_qty && (
                                <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--green-700)', fontWeight: 600 }}>
                                    Preview: 📦 {form.package_qty} {form.package_unit}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* USAGE */}
                    <div className="form-section-title">3. Usage Instructions</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Usage (Hindi) — एक लाइन = एक चरण</label>
                            <textarea rows={4} placeholder="1. पानी में मिलाएं&#10;2. छिड़काव करें" value={form.usage_hi} onChange={e => fld('usage_hi', e.target.value)} style={{ resize: 'vertical' }} />
                        </div>
                        <div className="form-group">
                            <label>Usage (English) — one line = one step</label>
                            <textarea rows={4} placeholder="1. Mix in water&#10;2. Spray on crops" value={form.usage_en} onChange={e => fld('usage_en', e.target.value)} style={{ resize: 'vertical' }} />
                        </div>
                    </div>

                    {/* IMAGES */}
                    <div className="form-section-title">4. Product Image</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Product Image</label>
                            <input type="file" accept="image/*" onChange={e => {
                                setProductImg(e.target.files[0]);
                                if (e.target.files[0]) {
                                    const r = new FileReader(); r.onload = ev => setImgPreview(ev.target.result); r.readAsDataURL(e.target.files[0]);
                                }
                            }} />
                            {imgPreview && <img src={imgPreview} alt="Preview" style={{ marginTop: 8, width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8 }} />}
                        </div>
                        <div className="form-group">
                            <label>Certification Images (up to 5)</label>
                            <input type="file" accept="image/*,application/pdf" multiple onChange={e => setCertImgs(e.target.files)} />
                            {certImgs && certImgs.length > 0 && (
                                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {Array.from(certImgs).map((f, i) => (
                                        <span key={i} style={{ fontSize: '0.72rem', background: 'var(--green-100)', padding: '2px 8px', borderRadius: 6, color: 'var(--green-800)' }}>
                                            📄 {f.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* VIDEO */}
                    <div className="form-section-title">5. Product Video</div>
                    <div className="form-group" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                        {[['youtube', '▶️ YouTube Link'], ['upload', '📤 Upload MP4']].map(([val, label]) => (
                            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700 }}>
                                <input type="radio" name="video_type" value={val} checked={form.video_type === val} onChange={() => { fld('video_type', val); setVideoFile(null); }} />
                                {label}
                            </label>
                        ))}
                    </div>
                    {form.video_type === 'youtube' ? (
                        <div className="form-group">
                            <label>YouTube Video URL</label>
                            <input type="url" placeholder="https://youtu.be/..." value={form.video_url} onChange={e => fld('video_url', e.target.value)} />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Upload Video File (MP4 — max 50MB)</label>
                            <input type="file" accept="video/mp4,video/webm" onChange={e => setVideoFile(e.target.files[0])} />
                            {videoFile && <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--green-700)', fontWeight: 600 }}>✅ {videoFile.name}</div>}
                        </div>
                    )}

                    <div className="form-actions">
                        <button className="btn btn-primary" onClick={handleSubmit}>💾 Save Product</button>
                        <button className="btn btn-secondary" onClick={closeForm}>Cancel</button>
                    </div>
                </div>
            )}

            {/* ——— TABLE ——— */}
            {loading ? <div className="loading-text"><div className="spinner" /> Loading...</div> : (
                <div className="card">
                    <div className="card-title">📋 All Products ({products.length})</div>
                    {products.length === 0 ? (
                        <div className="empty-state">No products yet. Add your first medicine!</div>
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Video</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id} style={{ verticalAlign: 'middle' }}>
                                            <td style={{ padding: '6px 8px' }}>
                                                {p.product_image ? (
                                                    <img src={`${API_URL}/uploads/${p.product_image}`} alt={p.medicine_name_en}
                                                        style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                                                ) : <span style={{ opacity: 0.4, fontSize: '0.75rem' }}>No img</span>}
                                            </td>
                                            <td style={{ padding: '6px 8px', maxWidth: 200 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.medicine_name_hi}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.medicine_name_en}</div>
                                                {p.company_name && (
                                                    <div style={{ fontSize: '0.68rem', color: 'var(--green-700)', fontWeight: 600, marginTop: 1 }}>🏭 {p.company_name}</div>
                                                )}
                                                {p.package_qty && (
                                                    <div style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 600, marginTop: 1 }}>📦 {p.package_qty} {p.package_unit}</div>
                                                )}
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>{p.category_name_hi}</td>
                                            <td style={{ fontSize: '0.82rem' }}>
                                                {p.price ? `₹${p.price}` : '—'}
                                                {p.price && <span style={{ marginLeft: 4, fontSize: '0.7rem', color: p.show_price ? 'var(--green-700)' : '#9ca3af' }}>{p.show_price ? '👁️ Visible' : '🙈 Hidden'}</span>}
                                            </td>
                                            <td style={{ fontSize: '0.8rem' }}>
                                                {p.video_url ? (p.video_type === 'youtube' ? '▶️ YouTube' : '📤 Upload') : '—'}
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: p.is_active ? 'var(--green-700)' : '#ef4444' }}>
                                                    {p.is_active ? '✅ Active' : '🚫 Off'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="btn-icon" onClick={() => openEdit(p)} title="Edit">✏️</button>
                                                    {deleteId === p.id ? (
                                                        <>
                                                            <button className="btn-icon danger" onClick={() => handleDelete(p.id)}>✅</button>
                                                            <button className="btn-icon" onClick={() => setDeleteId(null)}>✖️</button>
                                                        </>
                                                    ) : (
                                                        <button className="btn-icon danger" onClick={() => handleDelete(p.id)}>🗑️</button>
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
