import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';


const API = API_URL;
const STATUS_OPTIONS = ['pending', 'confirmed', 'delivered', 'cancelled'];

function OrderCard({ order, onStatusChange, onDelete }) {
    const [expanded, setExpanded] = useState(false);

    const totalQty = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;
    const totalPrice = order.items?.reduce((s, i) => {
        const price = i.item_price ?? i.product_price ?? null;
        return s + (price ? Number(price) * (i.quantity || 1) : 0);
    }, 0);
    const hasPrice = order.items?.some(i => (i.item_price ?? i.product_price));

    const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const statusColor = {
        pending: '#f59e0b',
        confirmed: '#10b981',
        delivered: '#3b82f6',
        cancelled: '#ef4444'
    };

    return (
        <div className="order-card" style={{ marginBottom: 16, border: '1.5px solid var(--gray-200)', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
            {/* Compact header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f9fafb', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: 'var(--gray-700)', fontSize: '0.82rem', minWidth: 40 }}>#{order.id}</span>

                <a href={`tel:${order.mobile_number}`} style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                    📱 {order.mobile_number}
                </a>

                <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--gray-600)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🏠 {order.address}
                </span>

                <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                    {formatDate(order.created_at)}
                </span>

                <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                    fontSize: '0.7rem', fontWeight: 700, background: statusColor[order.order_status] + '22',
                    color: statusColor[order.order_status], border: `1.5px solid ${statusColor[order.order_status]}55`
                }}>
                    {order.order_status}
                </span>

                <select
                    value={order.order_status}
                    onChange={e => onStatusChange(order.id, e.target.value)}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1.5px solid var(--gray-200)', fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                    {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>

                {/* Summary chips */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: 6, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {order.items?.length || 0} items
                    </span>
                    <span style={{ background: '#f0fdf4', color: '#15803d', borderRadius: 6, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
                        qty: {totalQty}
                    </span>
                    {hasPrice && (
                        <span style={{ background: '#fefce8', color: '#854d0e', borderRadius: 6, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
                            ₹{totalPrice.toLocaleString('en-IN')}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                    <button
                        onClick={() => setExpanded(v => !v)}
                        style={{ background: 'none', border: '1.5px solid var(--gray-300)', borderRadius: 7, padding: '3px 10px', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--gray-600)', fontWeight: 600 }}
                    >
                        {expanded ? '▲' : '▼ Items'}
                    </button>
                    <button
                        onClick={() => onDelete(order.id)}
                        style={{ background: 'none', border: '1.5px solid #fca5a5', borderRadius: 7, padding: '3px 10px', cursor: 'pointer', fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {/* Expandable items table */}
            {expanded && (
                <div style={{ padding: '0 16px 16px' }}>
                    <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                            <thead>
                                <tr style={{ background: '#f0fdf4' }}>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#15803d' }}>💊 Medicine</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#15803d' }}>Qty</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>Unit Price</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, idx) => {
                                    const unitPrice = item.item_price ?? item.product_price ?? null;
                                    const subtotal = unitPrice ? Number(unitPrice) * (item.quantity || 1) : null;
                                    const imgSrc = item.product_image
                                        ? `${API}/uploads/${item.product_image}`
                                        : null;
                                    return (
                                        <tr key={item.item_id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb', borderTop: '1px solid var(--gray-100)' }}>
                                            <td style={{ padding: '10px 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    {imgSrc ? (
                                                        <img src={imgSrc} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--gray-200)' }} />
                                                    ) : (
                                                        <span style={{ fontSize: 24 }}>💊</span>
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{item.medicine_name_hi}</div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>{item.medicine_name_en}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                <span style={{ display: 'inline-block', background: '#f0fdf4', color: '#15803d', border: '1.5px solid #bbf7d0', borderRadius: 6, padding: '2px 10px', fontWeight: 700 }}>
                                                    {item.quantity || 1}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--gray-600)', fontSize: '0.82rem' }}>
                                                {unitPrice ? `₹${Number(unitPrice).toLocaleString('en-IN')}` : '—'}
                                            </td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: subtotal ? '#15803d' : 'var(--gray-400)' }}>
                                                {subtotal ? `₹${subtotal.toLocaleString('en-IN')}` : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {hasPrice && (
                                <tfoot>
                                    <tr style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                                        <td colSpan={3} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                                            Total ({totalQty} items)
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: '#15803d' }}>
                                            ₹{totalPrice.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrdersPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [filter, setFilter] = useState('all');

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchOrders = () => {
        setLoading(true);
        fetch(`${API_URL}/api/admin/orders`, { headers: authHeader })
            .then(r => r.json())
            .then(data => setOrders(data.data || []))
            .catch(() => showAlert('error', 'Failed to load orders'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchOrders(); }, []);

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { ...authHeader, 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                showAlert('success', 'Order status updated!');
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
            } else {
                showAlert('error', data.message);
            }
        } catch { showAlert('error', 'Server error'); }
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm(`Delete order #${orderId}? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
                method: 'DELETE', headers: authHeader
            });
            const data = await res.json();
            if (data.success) {
                showAlert('success', `Order #${orderId} deleted`);
                setOrders(prev => prev.filter(o => o.id !== orderId));
            } else showAlert('error', data.message);
        } catch { showAlert('error', 'Server error'); }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.order_status === filter);

    const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = orders.filter(o => o.order_status === s).length;
        return acc;
    }, {});

    return (
        <AdminLayout pageTitle="Orders | ऑर्डर">
            {alert && (
                <div className={`alert alert-${alert.type}`}>
                    {alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
                    <div className="stat-value">{orders.length}</div>
                    <div className="stat-label">📋 Total Orders</div>
                </div>
                <div className="stat-card yellow" onClick={() => setFilter('pending')} style={{ cursor: 'pointer' }}>
                    <div className="stat-value">{statusCounts.pending || 0}</div>
                    <div className="stat-label">⏳ Pending</div>
                </div>
                <div className="stat-card" onClick={() => setFilter('confirmed')} style={{ cursor: 'pointer' }}>
                    <div className="stat-value">{statusCounts.confirmed || 0}</div>
                    <div className="stat-label">✅ Confirmed</div>
                </div>
                <div className="stat-card red" onClick={() => setFilter('cancelled')} style={{ cursor: 'pointer' }}>
                    <div className="stat-value">{statusCounts.cancelled || 0}</div>
                    <div className="stat-label">❌ Cancelled</div>
                </div>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {['all', ...STATUS_OPTIONS].map(s => (
                    <button
                        key={s}
                        className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter(s)}
                    >
                        {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        {s !== 'all' && ` (${statusCounts[s] || 0})`}
                    </button>
                ))}
                <button className="btn btn-sm btn-secondary" onClick={fetchOrders} style={{ marginLeft: 'auto' }}>
                    🔄 Refresh
                </button>
            </div>

            {/* Orders */}
            <div className="card">
                <div className="card-title">
                    📋 {filter === 'all' ? 'All Orders' : filter.charAt(0).toUpperCase() + filter.slice(1) + ' Orders'} ({filteredOrders.length})
                </div>
                {loading ? (
                    <div className="loading-text"><div className="spinner" /> Loading...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-table">No {filter === 'all' ? '' : filter} orders found.</div>
                ) : (
                    <div style={{ padding: '8px 0' }}>
                        {filteredOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
