import { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import ReservationRequestsPanel from './ReservationRequestsPanel';
import ConfirmedReservationsPanel from './ConfirmedReservationsPanel';
import FullyPaidPanel from './FullyPaidPanel';
import ArchivedReservationsPanel from './ArchivedReservationsPanel';
import BlockedDatesPanel from './BlockedDatesPanel';
import PricingPanel from './PricingPanel';

const NAV_ITEMS = [
    { to: '/centralni-mozek-stranky', label: 'Overview', icon: '◈' },
    { to: '/centralni-mozek-stranky/requests', label: 'Requests', icon: '◇' },
    { to: '/centralni-mozek-stranky/confirmed', label: 'Confirmed', icon: '◆' },
    { to: '/centralni-mozek-stranky/fully-paid', label: 'Fully Paid', icon: '✓' },
    { to: '/centralni-mozek-stranky/blocked-dates', label: 'Blocked Days', icon: '⊘' },
    { to: '/centralni-mozek-stranky/pricing', label: 'Pricing', icon: '€' },
    { to: '/centralni-mozek-stranky/history', label: 'History', icon: '▣' },
];

export default function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function handleLogout() {
        logout();
        navigate('/centralni-mozek-stranky/vchod');
    }

    return (
        <div className="admin-shell">
            {/* Mobile toggle */}
            <button
                className="admin-sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
            >
                {sidebarOpen ? '✕' : '☰'}
            </button>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
                <div className="admin-sidebar__brand">
                    <span className="admin-sidebar__logo">P</span>
                    <div>
                        <h2 className="admin-sidebar__title">Paraíso</h2>
                        <p className="admin-sidebar__badge">Admin</p>
                    </div>
                </div>

                <nav className="admin-sidebar__nav">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/centralni-mozek-stranky'}
                            className={({ isActive }) =>
                                `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="admin-nav-item__icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <a href="/" className="admin-nav-item admin-nav-item--muted">
                        <span className="admin-nav-item__icon">←</span>
                        View Site
                    </a>
                    <button onClick={handleLogout} className="admin-nav-item admin-nav-item--muted admin-nav-item--button">
                        <span className="admin-nav-item__icon">⏻</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main content */}
            <main className="admin-main">
                <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="requests" element={<ReservationRequestsPanel />} />
                    <Route path="confirmed" element={<ConfirmedReservationsPanel />} />
                    <Route path="fully-paid" element={<FullyPaidPanel />} />
                    <Route path="blocked-dates" element={<BlockedDatesPanel />} />
                    <Route path="pricing" element={<PricingPanel />} />
                    <Route path="history" element={<ArchivedReservationsPanel />} />
                    <Route path="*" element={<Navigate to="/centralni-mozek-stranky" replace />} />
                </Routes>
            </main>
        </div>
    );
}
