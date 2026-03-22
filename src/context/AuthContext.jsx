import React, { useState, createContext, useContext } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
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
