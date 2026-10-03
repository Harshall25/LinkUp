import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAPI } from '../api/auth';
import { usersAPI } from '../api/users';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

const toSessionUser = (user) => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  avatar: user.avatar || null,
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(readStoredUser);

  const saveUser = useCallback((next) => {
    const sessionUser = toSessionUser(next);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setUser(sessionUser);
  }, []);

  const startSession = useCallback(
    (response) => {
      localStorage.setItem('token', response.token);
      setToken(response.token);
      saveUser(response.user);
      return response;
    },
    [saveUser]
  );

  // Sessions saved by older builds lack id/name/avatar; refresh from the API.
  const refreshUser = useCallback(async () => {
    const { user: me } = await usersAPI.getCurrentUser();
    saveUser(me);
    return me;
  }, [saveUser]);

  useEffect(() => {
    if (token) refreshUser().catch(() => {});
  }, [token, refreshUser]);

  const signin = async (email, password) => startSession(await authAPI.signin(email, password));

  const signup = async (name, email, password) => startSession(await authAPI.signup(name, email, password));

  const signinWithGoogle = async (credential) => startSession(await authAPI.google(credential));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.google?.accounts?.id?.disableAutoSelect();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    signup,
    signin,
    signinWithGoogle,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
