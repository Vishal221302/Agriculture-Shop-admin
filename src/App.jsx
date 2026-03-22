import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Core Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import BannerPage from './pages/Banner';
import CategoriesPage from './pages/Categories';
import ProductsPage from './pages/Products';
import OrdersPage from './pages/Orders';
import NotificationsPage from './pages/Notifications';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <NotificationProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/banner" element={<ProtectedRoute><BannerPage /></ProtectedRoute>} />
                        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
                        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </NotificationProvider>
            </BrowserRouter>
        </AuthProvider>
    );
}
