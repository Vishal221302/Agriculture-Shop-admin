import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import AdminLayout from '../components/AdminLayout';

export default function NotificationsPage() {
    const { notifications, handleReadNotification, handleClearAll, handleDeleteNotification } = useNotification();
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

    // Derived filtered set
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    return (
        <AdminLayout pageTitle="Notifications History | सूचनाएं इतिहास">
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span>🔔 All Notifications ({notifications.length})</span>
                    {notifications.length > 0 && (
                        <button className="btn btn-secondary btn-sm" onClick={handleClearAll}>
                            Clear History
                        </button>
                    )}
                </div>

                {/* Filter Control */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--green-200)', background: filter === 'all' ? 'green' : 'var(--green-50)', color: filter === 'all' ? '#fff' : 'var(--green-800)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--green-200)', background: filter === 'unread' ? 'green' : 'var(--green-50)', color: filter === 'unread' ? '#fff' : 'var(--green-800)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
                    >
                        Unread
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--green-200)', background: filter === 'read' ? 'green' : 'var(--green-50)', color: filter === 'read' ? '#fff' : 'var(--green-800)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
                    >
                        Read
                    </button>
                </div>

                {filteredNotifications.length === 0 ? (
                    <div className="empty-table">
                        {filter === 'unread' ? 'No unread notifications right now.' : filter === 'read' ? 'You haven\'t read any notifications yet.' : 'You have no recorded notifications.'}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredNotifications.map(n => (
                            <div
                                key={n.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '16px', border: '1px solid var(--gray-200)',
                                    borderRadius: '8px', cursor: n.read ? 'default' : 'pointer',
                                    background: n.read ? 'var(--gray-50)' : 'var(--white)',
                                    opacity: n.read ? 0.75 : 1,
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => { if (!n.read) handleReadNotification(n.id); }}
                                onMouseOver={(e) => { if (!n.read) e.currentTarget.style.borderColor = 'var(--green-light)'; }}
                                onMouseOut={(e) => { if (!n.read) e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
                            >
                                <div style={{
                                    fontSize: '2rem', flexShrink: 0,
                                    filter: n.read ? 'grayscale(100%) opacity(70%)' : 'none'
                                }}>📦</div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 4px', color: 'var(--gray-900)' }}>New Order Received!</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                        Mobile: {n.mobile_number} • Items: {n.items_count}
                                    </p>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '4px', display: 'block' }}>
                                        Added: {new Date(n.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ fontSize: '0.8rem', color: n.read ? 'var(--gray-400)' : 'var(--green-dark)', fontWeight: '600' }}>
                                        {n.read ? 'Opened 👁️' : 'Click to view →'}
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteNotification(n.id); }}
                                        style={{ 
                                            background: 'transparent', border: '1px solid #ff4d4f', 
                                            color: '#ff4d4f', cursor: 'pointer', padding: '4px 8px', 
                                            fontSize: '0.9rem', borderRadius: '4px', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s', zIndex: 10
                                        }}
                                        title="Delete Notification"
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#ff4d4f'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ff4d4f'; }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
