import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const NotificationContext = createContext(null);
export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]); // Temporary for popups
    const [showNotifyMenu, setShowNotifyMenu] = useState(false);

    // Fetch initial notifications from database
    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Parse is_read from tinyint (0/1) to boolean
                setNotifications(data.data.map(n => ({ ...n, read: !!n.is_read })));
            }
        } catch (err) { console.error('Failed to fetch notifications:', err); }
    };

    useEffect(() => {
        fetchNotifications();
    }, [token]);

    // SSE connection for live updates overlaying DB
    useEffect(() => {
        if (!token) return;
        
        const source = new EventSource(`${API_URL}/api/admin/orders/notifications?token=${token}`);
        
        source.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                // Note: backend SSE explicitly outputs { id, order_id, mobile_number, items_count, is_read, created_at }
                const notifyObj = { ...data, read: !!data.is_read };
                
                // Add to persistent menu
                setNotifications(prev => [notifyObj, ...prev]);
                // Add to temporary toast
                setToasts(prev => [...prev, notifyObj]);
                
                setTimeout(() => {
                    setToasts(prev => prev.filter(n => n.id !== notifyObj.id));
                }, 5000);
            } catch (err) {}
        };

        return () => {
            source.close();
        };
    }, [token]);

    const handleReadNotification = async (id) => {
        // Mark locally immediately for snappy UI
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setToasts(prev => prev.filter(n => n.id !== id));
        setShowNotifyMenu(false);
        navigate('/orders');
        
        // Push update to DB silently
        try {
            await fetch(`${API_URL}/api/admin/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {}
    };

    const handleClearAll = async () => {
        // Clear locally immediately
        setNotifications([]);
        setShowNotifyMenu(false);
        
        // Push wipe to DB silently
        try {
            await fetch(`${API_URL}/api/admin/notifications`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {}
    };

    const handleDeleteNotification = async (id) => {
        // Optimistically remove from state locally
        setNotifications(prev => prev.filter(n => n.id !== id));
        setToasts(prev => prev.filter(n => n.id !== id));
        
        try {
            await fetch(`${API_URL}/api/admin/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {}
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const unreadNotifications = notifications.filter(n => !n.read);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            unreadNotifications,
            toasts,
            showNotifyMenu,
            setShowNotifyMenu,
            handleReadNotification,
            handleClearAll,
            handleDeleteNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
}
