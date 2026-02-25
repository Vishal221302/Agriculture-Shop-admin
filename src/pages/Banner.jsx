import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout, useAuth } from '../App';
import { API_URL } from '../config';


const API = API_URL;
const UNITS = ['ml', 'L', 'KG', 'g'];

const BLANK = {
    banner_type: 'image',
    title_hi: '', title_en: '',
    description_hi: '', description_en: '',
    show_bg: '1', bg_color: '#14532d',
    video_url: '',
};

function PillToggle({ value, onChange, options }) {
    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {options.map(({ val, label, color }) => {
                const active = value === val;
                return (
                    <button key={val} type="button" onClick={() => onChange(val)} style={{
                        padding: '7px 16px', borderRadius: 999,
                        border: `2px solid ${active ? (color || 'var(--green-600)') : '#e5e7eb'}`,
                        background: active ? (color || 'var(--green-600)') : '#fff',
                        color: active ? '#fff' : '#374151',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
                    }}>{label}</button>
                );
            })}
        </div>
    );
}

/* ── Banner Card in the list ───────────────────────────────────────── */
function BannerCard({ b, onEdit, onActivate, onDelete, saving }) {
    const imgSrc = b.banner_image ? `${API}/uploads/${b.banner_image}` : null;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 14px', borderRadius: 12,
            border: `2px solid ${b.is_active ? 'var(--green-500)' : '#e5e7eb'}`,
            background: b.is_active ? '#f0fdf4' : '#fff',
            marginBottom: 10, transition: 'all 0.2s',
        }}>
            {/* Thumbnail */}
            <div style={{
                width: 64, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                background: b.bg_color || '#14532d', border: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {imgSrc
                    ? <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 22 }}>{b.banner_type === 'video' ? '🎬' : '🖼️'}</span>
                }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.title_en || b.title_hi || <span style={{ color: '#9ca3af' }}>Untitled Banner</span>}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 2 }}>
                    #{b.id} · {b.banner_type} · bg: {b.bg_color}
                </div>
            </div>

            {/* Active toggle */}
            <button
                onClick={() => onActivate(b.id, !b.is_active)}
                disabled={saving}
                style={{
                    padding: '5px 14px', borderRadius: 999, fontWeight: 700, fontSize: '0.78rem',
                    border: `2px solid ${b.is_active ? 'var(--green-500)' : '#d1d5db'}`,
                    background: b.is_active ? 'var(--green-600)' : '#f3f4f6',
                    color: b.is_active ? '#fff' : '#6b7280',
                    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
            >
                {b.is_active ? '✅ Active' : '○ Inactive'}
            </button>

            {/* Edit */}
            <button onClick={() => onEdit(b)} style={{
                padding: '5px 12px', borderRadius: 8, fontWeight: 700, fontSize: '0.78rem',
                border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer',
            }}>✏️ Edit</button>

            {/* Delete */}
            <button onClick={() => onDelete(b.id)} style={{
                padding: '5px 10px', borderRadius: 8, fontWeight: 700, fontSize: '0.78rem',
                border: '1.5px solid #fca5a5', background: '#fff', color: '#ef4444', cursor: 'pointer',
            }}>🗑️</button>
        </div>
    );
}

/* ── Main Component ─────────────────────────────────────────────────── */
export default function BannerPage() {
    const { token } = useAuth();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null); // null = new
    const [form, setForm] = useState(BLANK);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);

    const fileRef = useRef();
    const authH = { Authorization: `Bearer ${token}` };
    const fld = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert(null), 3500);
    };

    const fetchBanners = () => {
        setLoading(true);
        fetch(`${API_URL}/api/admin/banners`, { headers: authH })
            .then(r => r.json())
            .then(d => setBanners(d.data || []))
            .catch(() => showAlert('error', 'Failed to load banners'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchBanners(); }, []);

    const openNew = () => {
        setEditId(null);
        setForm(BLANK);
        setMediaFile(null); setMediaPreview(null);
        setShowForm(true);
    };

    const openEdit = (b) => {
        setEditId(b.id);
        setForm({
            banner_type: b.banner_type || 'image',
            title_hi: b.title_hi || '', title_en: b.title_en || '',
            description_hi: b.description_hi || '', description_en: b.description_en || '',
            show_bg: String(b.show_bg ?? 1), bg_color: b.bg_color || '#14532d',
            video_url: b.banner_type !== 'upload' ? (b.video_url || '') : '',
        });
        setMediaFile(null);
        setMediaPreview(b.banner_image ? `${API}/uploads/${b.banner_image}` : null);
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (mediaFile) fd.append(form.banner_type === 'video' ? 'banner_video' : 'banner_image', mediaFile);

            const url = editId ? `${API_URL}/api/admin/banners/${editId}` : `${API_URL}/api/admin/banners`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: authH, body: fd });
            const data = await res.json();
            if (data.success) {
                showAlert('success', editId ? 'Banner updated ✅' : 'Banner created ✅');
                setShowForm(false);
                fetchBanners();
            } else {
                showAlert('error', data.message);
            }
        } catch { showAlert('error', 'Server error'); }
        finally { setSaving(false); }
    };

    const handleActivate = async (id, makeActive) => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/banners/${id}/activate`, {
                method: 'PUT',
                headers: { ...authH, 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: makeActive ? 1 : 0 }),
            });
            const data = await res.json();
            if (data.success) {
                setBanners(prev => prev.map(b => ({
                    ...b,
                    is_active: makeActive ? (b.id === id ? 1 : 0) : (b.id === id ? 0 : b.is_active),
                })));
                showAlert('success', makeActive ? 'Banner activated ✅' : 'Banner deactivated');
            } else showAlert('error', data.message);
        } catch { showAlert('error', 'Server error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/banners/${id}`, { method: 'DELETE', headers: authH });
            const data = await res.json();
            if (data.success) {
                setBanners(prev => prev.filter(b => b.id !== id));
                showAlert('success', 'Banner deleted');
                if (editId === id) setShowForm(false);
            } else showAlert('error', data.message);
        } catch { showAlert('error', 'Server error'); }
    };

    const onFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setMediaFile(f);
        setMediaPreview(URL.createObjectURL(f));
    };

    // ── Preview bg ──────────────────────────────────────────────────
    const previewStyle = form.show_bg === '1' && form.bg_color
        ? { background: form.bg_color }
        : { background: 'transparent', border: '2px dashed #d1fae5' };

    return (
        <AdminLayout pageTitle="Banners | बैनर">
            {alert && (
                <div className={`alert alert-${alert.type}`}>
                    {alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}
                </div>
            )}

            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* ── LEFT: Banner List ───────────────────────────── */}
                <div style={{ flex: '1 1 340px', minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827', margin: 0 }}>
                            🖼️ All Banners ({banners.length})
                        </h2>
                        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add New</button>
                    </div>

                    {loading ? (
                        <div className="loading-text"><div className="spinner" /> Loading...</div>
                    ) : banners.length === 0 ? (
                        <div className="empty-table" style={{ textAlign: 'center', padding: 32 }}>
                            No banners yet.<br />
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={openNew}>+ Add First Banner</button>
                        </div>
                    ) : (
                        banners.map(b => (
                            <BannerCard
                                key={b.id}
                                b={b}
                                onEdit={openEdit}
                                onActivate={handleActivate}
                                onDelete={handleDelete}
                                saving={saving}
                            />
                        ))
                    )}
                </div>

                {/* ── RIGHT: Form ─────────────────────────────────── */}
                {showForm && (
                    <div style={{ flex: '1 1 360px', minWidth: 300 }} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div className="card-title" style={{ margin: 0 }}>
                                {editId ? '✏️ Edit Banner' : '➕ New Banner'}
                            </div>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                        </div>

                        <form onSubmit={handleSave}>
                            {/* Preview */}
                            <div style={{
                                ...previewStyle,
                                borderRadius: 12, overflow: 'hidden',
                                minHeight: 80, marginBottom: 18, position: 'relative',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {mediaPreview && form.banner_type === 'image' && (
                                    <img src={mediaPreview} alt="" style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                                )}
                                {!mediaPreview && (
                                    <span style={{ color: form.show_bg === '1' ? 'rgba(255,255,255,0.7)' : '#9ca3af', fontSize: '0.8rem' }}>
                                        Preview
                                    </span>
                                )}
                            </div>

                            {/* Type */}
                            <div className="form-group">
                                <label>Banner Type</label>
                                <PillToggle
                                    value={form.banner_type}
                                    onChange={v => { fld('banner_type', v); setMediaFile(null); setMediaPreview(null); }}
                                    options={[
                                        { val: 'image', label: '🖼️ Image' },
                                        { val: 'video', label: '🎬 YouTube' },
                                        { val: 'upload', label: '📁 Upload Video' },
                                    ]}
                                />
                            </div>

                            {/* Media */}
                            {form.banner_type === 'image' && (
                                <div className="form-group">
                                    <label>Banner Image</label>
                                    <input type="file" accept="image/*" ref={fileRef} onChange={onFileChange} style={{ display: 'none' }} />
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}>
                                        📁 {mediaFile ? mediaFile.name : 'Choose Image'}
                                    </button>
                                </div>
                            )}
                            {form.banner_type === 'video' && (
                                <div className="form-group">
                                    <label>YouTube URL</label>
                                    <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={form.video_url} onChange={e => fld('video_url', e.target.value)} />
                                </div>
                            )}
                            {form.banner_type === 'upload' && (
                                <div className="form-group">
                                    <label>Upload Video</label>
                                    <input type="file" accept="video/*" ref={fileRef} onChange={onFileChange} style={{ display: 'none' }} />
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}>
                                        📁 {mediaFile ? mediaFile.name : 'Choose Video'}
                                    </button>
                                </div>
                            )}

                            {/* Titles */}
                            <div className="form-group">
                                <label>Title (Hindi)</label>
                                <input value={form.title_hi} onChange={e => fld('title_hi', e.target.value)} placeholder="किसान केंद्र में स्वागत है" />
                            </div>
                            <div className="form-group">
                                <label>Title (English)</label>
                                <input value={form.title_en} onChange={e => fld('title_en', e.target.value)} placeholder="Welcome to Kisan Kendra" />
                            </div>
                            <div className="form-group">
                                <label>Description (Hindi)</label>
                                <textarea rows={2} value={form.description_hi} onChange={e => fld('description_hi', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Description (English)</label>
                                <textarea rows={2} value={form.description_en} onChange={e => fld('description_en', e.target.value)} />
                            </div>

                            {/* Background */}
                            <div className="form-group">
                                <label>Background</label>
                                <PillToggle
                                    value={form.show_bg}
                                    onChange={v => fld('show_bg', v)}
                                    options={[
                                        { val: '1', label: '🎨 Colored BG', color: 'var(--green-600)' },
                                        { val: '0', label: '🌿 No BG', color: '#6b7280' },
                                    ]}
                                />
                            </div>
                            {form.show_bg === '1' && (
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <label style={{ margin: 0 }}>Color</label>
                                    <input type="color" value={form.bg_color} onChange={e => fld('bg_color', e.target.value)} style={{ width: 44, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                                    <input value={form.bg_color} onChange={e => fld('bg_color', e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} placeholder="#14532d" />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Saving...' : (editId ? '💾 Update Banner' : '➕ Create Banner')}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
