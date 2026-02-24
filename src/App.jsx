import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/Login';
import BannerPage from './pages/Banner';
import CategoriesPage from './pages/Categories';
import ProductsPage from './pages/Products';
import OrdersPage from './pages/Orders';

// ============================
// Auth Context
// ============================
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('agri_admin_token'));

    const login = (tok) => {
        localStorage.setItem('agri_admin_token', tok);
        setToken(tok);
    };

    const logout = () => {
        localStorage.removeItem('agri_admin_token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, isLoggedIn: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================
// Protected Route
// ============================
function ProtectedRoute({ children }) {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// ============================
// Sidebar Layout
// ============================
function AdminLayout({ children, pageTitle }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                    <span className="topbar-badge">🌾 Admin</span>
                </div>
                <div className="admin-content">{children}</div>
            </main>
        </div>
    );
}

export { AdminLayout };

/* ── Pure SVG Bar Chart (7-day orders) ─────────────────────────── */
function BarChart({ data }) {
    const W = 420, H = 130, PAD = 32, BAR_GAP = 8;
    if (!data || !data.length) return null;
    const maxV = Math.max(...data.map(d => d.cnt), 1);
    const barW = (W - PAD * 2 - BAR_GAP * (data.length - 1)) / data.length;
    const fmt = d => {
        const dt = new Date(d.day + 'T00:00:00');
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };
    return (
        <svg viewBox={`0 0 ${W} ${H + 28}`} style={{ width: '100%', maxWidth: W, overflow: 'visible' }}>
            {/* Grid lines */}
            {[0, 0.5, 1].map(f => {
                const y = PAD + (1 - f) * (H - PAD);
                return <line key={f} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4,3" />;
            })}
            {data.map((d, i) => {
                const barH = maxV === 0 ? 0 : ((d.cnt / maxV) * (H - PAD));
                const x = PAD + i * (barW + BAR_GAP);
                const y = H - barH;
                const isToday = i === data.length - 1;
                return (
                    <g key={d.day}>
                        <rect x={x} y={y} width={barW} height={barH} rx={4}
                            fill={isToday ? 'var(--green-600)' : '#86efac'}
                            style={{ transition: 'all 0.4s ease' }} />
                        {d.cnt > 0 && (
                            <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                                fontSize={9} fontWeight={700} fill="#15803d">{d.cnt}</text>
                        )}
                        <text x={x + barW / 2} y={H + 14} textAnchor="middle"
                            fontSize={9} fill="#6b7280">{fmt(d)}</text>
                    </g>
                );
            })}
        </svg>
    );
}

/* ── Pure SVG Donut Chart ───────────────────────────────────────── */
function DonutChart({ data }) {
    const COLORS = { pending: '#f59e0b', confirmed: '#10b981', delivered: '#3b82f6', cancelled: '#ef4444' };
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    if (total === 0) return <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: 32 }}>No orders yet</div>;
    const R = 52, CX = 70, CY = 70, STROKE = 22;
    const circ = 2 * Math.PI * R;
    let offset = 0;
    const segments = Object.entries(data).map(([key, val]) => {
        const pct = val / total;
        const seg = { key, val, pct, offset, dash: pct * circ, gap: circ };
        offset += pct * circ;
        return seg;
    });
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <svg viewBox="0 0 140 140" style={{ width: 120, flexShrink: 0 }}>
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth={STROKE} />
                {segments.map(s => (
                    <circle key={s.key} cx={CX} cy={CY} r={R} fill="none"
                        stroke={COLORS[s.key]} strokeWidth={STROKE}
                        strokeDasharray={`${s.dash} ${s.gap}`}
                        strokeDashoffset={-s.offset}
                        transform={`rotate(-90 ${CX} ${CY})`}
                        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                ))}
                <text x={CX} y={CY + 2} textAnchor="middle" fontSize={16} fontWeight={800} fill="#111827">{total}</text>
                <text x={CX} y={CY + 14} textAnchor="middle" fontSize={8} fill="#6b7280">orders</text>
            </svg>
            <div style={{ flex: 1 }}>
                {segments.map(s => (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[s.key], flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: '#374151', textTransform: 'capitalize', flex: 1 }}>{s.key}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: COLORS[s.key] }}>{s.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, accent }) {
    const styles = {
        green: { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
        yellow: { bg: '#fefce8', border: '#fde047', text: '#a16207' },
        blue: { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' },
        purple: { bg: '#f5f3ff', border: '#c4b5fd', text: '#6d28d9' },
        red: { bg: '#fff1f2', border: '#fca5a5', text: '#b91c1c' },
    };
    const s = styles[accent] || styles.green;
    return (
        <div style={{
            background: s.bg, border: `1.5px solid ${s.border}`,
            borderRadius: 14, padding: '16px 20px', flex: '1 1 140px', minWidth: 130,
            display: 'flex', flexDirection: 'column', gap: 4,
        }}>
            <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: s.text, lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>{label}</div>
            {sub && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

/* ── Dashboard Page ─────────────────────────────────────────────── */
function DashboardPage() {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = () => {
        setLoading(true);
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setData(d.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchStats(); }, [token]);

    const fmtRupee = v => v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${v}`;

    return (
        <AdminLayout pageTitle="Dashboard | डैशबोर्ड">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
                <button className="btn btn-secondary btn-sm" onClick={fetchStats}>🔄 Refresh</button>
            </div>

            {loading ? (
                <div className="loading-text"><div className="spinner" /> Loading...</div>
            ) : !data ? (
                <div className="empty-table">Failed to load stats. Check backend connection.</div>
            ) : (
                <>
                    {/* ── Stat Cards ── */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                        <StatCard icon="🗂️" label="Categories" value={data.categories} accent="green" />
                        <StatCard icon="💊" label="Products" value={data.products} accent="blue" />
                        <StatCard icon="📋" label="Total Orders" value={data.orders} accent="purple" />
                        <StatCard icon="⏳" label="Pending" value={data.statusBreakdown?.pending || 0} accent="yellow" />
                        <StatCard
                            icon="💰" label="Revenue"
                            value={data.revenue > 0 ? fmtRupee(data.revenue) : '—'}
                            sub="from priced orders"
                            accent="green"
                        />
                    </div>

                    {/* ── Two columns: bar chart + donut ── */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>

                        {/* Orders last 7 days — Bar Chart */}
                        <div className="card" style={{ flex: '2 1 280px', minWidth: 260 }}>
                            <div className="card-title" style={{ marginBottom: 12 }}>
                                📈 Orders — Last 7 Days
                                <span style={{ marginLeft: 8, fontSize: '0.72rem', color: '#9ca3af', fontWeight: 400 }}>
                                    ({data.daily?.reduce((s, d) => s + d.cnt, 0) || 0} total)
                                </span>
                            </div>
                            <BarChart data={data.daily} />
                        </div>

                        {/* Order Status Donut */}
                        <div className="card" style={{ flex: '1 1 220px', minWidth: 200 }}>
                            <div className="card-title" style={{ marginBottom: 12 }}>🍩 Order Status</div>
                            <DonutChart data={data.statusBreakdown || {}} />
                        </div>
                    </div>

                    {/* ── Top Products ── */}
                    {data.topProducts?.length > 0 && (
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: 12 }}>🏆 Top 5 Products (by quantity ordered)</div>
                            {(() => {
                                const maxQ = Math.max(...data.topProducts.map(p => Number(p.total_qty)), 1);
                                return data.topProducts.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                        <span style={{
                                            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                            background: ['#14532d', '#15803d', '#22c55e', '#86efac', '#dcfce7'][i],
                                            color: i <= 1 ? '#fff' : '#15803d',
                                            fontWeight: 800, fontSize: '0.72rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>{i + 1}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {p.medicine_name_hi} <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.75rem' }}>/ {p.medicine_name_en}</span>
                                            </div>
                                            <div style={{ height: 7, borderRadius: 99, background: '#f0fdf4', marginTop: 4, overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%', borderRadius: 99,
                                                    width: `${(Number(p.total_qty) / maxQ) * 100}%`,
                                                    background: 'var(--green-600)',
                                                    transition: 'width 0.6s ease',
                                                }} />
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--green-700)', flexShrink: 0 }}>
                                            {p.total_qty} qty
                                        </span>
                                    </div>
                                ));
                            })()}
                        </div>
                    )}

                    {/* ── Quick Info ── */}
                    <div className="card" style={{ marginTop: 16, background: '#f8fffe' }}>
                        <div className="card-title">ℹ️ Quick Info</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                            {[
                                ['🔑', 'Admin Login', 'admin / admin123'],
                                ['🌐', 'Backend API', 'localhost:5000'],
                                ['🛒', 'Customer Site', 'localhost:5173'],
                                ['📁', 'Uploads', 'backend/uploads/'],
                            ].map(([icon, label, val]) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                                    <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{label}</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>{val}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}

// ============================
// App
// ============================
export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/banner" element={<ProtectedRoute><BannerPage /></ProtectedRoute>} />
                    <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
                    <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
