import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function AdminLayout({ children, pageTitle }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { 
        notifications,
        unreadCount,
        unreadNotifications,
        toasts, 
        showNotifyMenu, 
        setShowNotifyMenu, 
        handleReadNotification 
    } = useNotification();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/banner', icon: '🖼️', label: 'Banner | बैनर' },
        { to: '/categories', icon: '🗂️', label: 'Categories | श्रेणियां' },
        { to: '/products', icon: '💊', label: 'Products | दवाइयां' },
        { to: '/orders', icon: '📋', label: 'Orders | ऑर्डर' },
        { to: '/notifications', icon: '🔔', label: 'Notifications | सूचनाएं' },
    ];

    return (
        <div className="admin-layout">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">🌾</div>
                    <h2>Kisan Krishi Kendra</h2>
                    <p>Admin Panel</p>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-item-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <div className="admin-topbar">
                    {/* Hamburger — only visible on mobile */}
                    <button
                        className="hamburger-btn"
                        onClick={() => setSidebarOpen(v => !v)}
                        aria-label="Toggle menu"
                    >
                        {sidebarOpen ? '✕' : '☰'}
                    </button>
                    <h1>{pageTitle}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Notification Bell Menu */}
                        <div className="notification-wrapper">
                            <button 
                                className="notification-btn" 
                                onClick={() => setShowNotifyMenu(v => !v)}
                                aria-label="Notifications"
                            >
                                🔔
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>
                            
                            {showNotifyMenu && (
                                <div className="notification-menu">
                                    <div className="notification-menu-header">
                                        Unread Notifications
                                    </div>
                                    <div className="notification-menu-body">
                                        {unreadNotifications.length === 0 ? (
                                            <div className="no-notifications">No new notifications</div>
                                        ) : (
                                            unreadNotifications.map(n => (
                                                <div 
                                                    key={n.id} 
                                                    className="notification-item" 
                                                    onClick={() => handleReadNotification(n.id)}
                                                >
                                                    <div className="ni-icon">📦</div>
                                                    <div className="ni-text">
                                                        <strong>New Order Received!</strong>
                                                        <span>Mobile: {n.mobile_number} ({n.items_count} items)</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {/* Link to view all notifications history */}
                                    <div 
                                        onClick={() => { setShowNotifyMenu(false); navigate('/notifications'); }}
                                        style={{ 
                                            padding: '10px', textAlign: 'center', background: 'var(--gray-50)', 
                                            borderTop: '1px solid var(--gray-200)', fontSize: '0.8rem', 
                                            cursor: 'pointer', color: 'var(--green-light)', fontWeight: '600'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                                    >
                                        View All History
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className="topbar-badge">🌾 Admin</span>
                    </div>
                </div>
                <div className="admin-content">{children}</div>
            </main>

            {/* Toast Notifications container */}
            <div className="toast-container">
                {toasts.map(n => (
                    <div key={n.id} className="toast" onClick={() => handleReadNotification(n.id)}>
                        <div className="toast-icon">🛎️</div>
                        <div className="toast-content">
                            <strong>New Order Received!</strong>
                            <span>Mobile: {n.mobile_number} ({n.items_count} items)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
