import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, signupThunk, logout as logoutAction, fetchProfileThunk } from '../store/slices/authSlice';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = storage.getToken();
    if (token) {
      dispatch(fetchProfileThunk());
    } else {
      dispatch({ type: 'auth/fetchProfile/rejected' });
    }
  }, [dispatch]);

  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  return {
    user,
    loading,
    isAdmin: user?.role === 'Admin',
    login: (email, password) => dispatch(loginThunk({ email, password })).unwrap(),
    signup: (payload) => dispatch(signupThunk(payload)).unwrap(),
    logout: () => dispatch(logoutAction()),
  };
}
