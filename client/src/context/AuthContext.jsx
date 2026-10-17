import { createContext, useContext, useState } from 'react';
import { MOCK_CURRENT_USER, MOCK_ADMIN_USER } from '../data/mockUsers';
import { mockAuthService } from '../services/mockAuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Pre-hydrated with demo student so user can immediately experience all interactive views
  const [user, setUser] = useState(MOCK_CURRENT_USER);
  const [role, setRole] = useState('student'); // 'student' | 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (email, password) => {
    const res = await mockAuthService.login(email, password);
    if (res.success) {
      setUser(res.user);
      setRole(res.role);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const register = async (formData) => {
    const res = await mockAuthService.register(formData);
    if (res.success) {
      setUser(res.user);
      setRole(res.role);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: 'Registration failed' };
  };

  const logout = () => {
    mockAuthService.logout();
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const switchDemoRole = (newRole) => {
    if (newRole === 'admin') {
      setUser(MOCK_ADMIN_USER);
      setRole('admin');
      setIsAuthenticated(true);
    } else {
      setUser(MOCK_CURRENT_USER);
      setRole('student');
      setIsAuthenticated(true);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        register,
        logout,
        switchDemoRole,
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
