import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on initial mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('nestmatch_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getCurrentUser();
        if (res.data?.user) {
          setUser(res.data.user);
          setRole(res.data.user.role);
          setIsAuthenticated(true);
          localStorage.setItem('nestmatch_user', JSON.stringify(res.data.user));
        } else {
          localStorage.removeItem('nestmatch_token');
          localStorage.removeItem('nestmatch_user');
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
        }
      } catch {
        localStorage.removeItem('nestmatch_token');
        localStorage.removeItem('nestmatch_user');
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Listen for unauthorized 401 events dispatched by Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('nestmatch_token');
      localStorage.removeItem('nestmatch_user');
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.data?.token && res.data?.user) {
        localStorage.setItem('nestmatch_token', res.data.token);
        localStorage.setItem('nestmatch_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setRole(res.data.user.role);
        setIsAuthenticated(true);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Unable to sign in. Please verify your credentials.';
      return { success: false, message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authService.register(formData);
      if (res.data?.token && res.data?.user) {
        localStorage.setItem('nestmatch_token', res.data.token);
        localStorage.setItem('nestmatch_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setRole(res.data.user.role);
        setIsAuthenticated(true);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed. Please check form values.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('nestmatch_token');
      localStorage.removeItem('nestmatch_user');
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return updatedFields;
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('nestmatch_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
