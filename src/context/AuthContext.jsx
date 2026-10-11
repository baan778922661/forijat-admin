import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('forijat_admin_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('forijat_admin_user'));
    } catch {
      return null;
    }
  });

  const login = useCallback(async (phone, password) => {
    const { data } = await apiLogin(phone, password);
    if (data.user?.role !== 'admin') {
      throw new Error('هذا الحساب ليس حساب إدارة');
    }
    localStorage.setItem('forijat_admin_token', data.token);
    localStorage.setItem('forijat_admin_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('forijat_admin_token');
    localStorage.removeItem('forijat_admin_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthed: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
