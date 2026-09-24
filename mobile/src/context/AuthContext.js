import React, {createContext, useContext, useReducer, useEffect} from 'react';
import {authAPI} from '../api';
import {saveTokens, getTokens, clearTokens} from '../api/client';

const AuthContext = createContext(null);

const init = {user: null, loading: true};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':   return {user: action.payload, loading: false};
    case 'CLEAR_USER': return {user: null, loading: false};
    default:           return state;
  }
}

export function AuthProvider({children}) {
  const [state, dispatch] = useReducer(reducer, init);

  // Restore session on app launch
  useEffect(() => {
    (async () => {
      try {
        const tokens = await getTokens();
        if (!tokens?.refreshToken) return dispatch({type: 'CLEAR_USER'});
        const {data} = await authAPI.refresh(tokens.refreshToken);
        await saveTokens(data.accessToken, data.refreshToken);
        dispatch({type: 'SET_USER', payload: data.user});
      } catch {
        await clearTokens();
        dispatch({type: 'CLEAR_USER'});
      }
    })();
  }, []);

  const login = async (employee_id, pin) => {
    const {data} = await authAPI.login({employee_id, pin});
    await saveTokens(data.accessToken, data.refreshToken);
    dispatch({type: 'SET_USER', payload: data.user});
    return data.user;
  };

  const register = async formData => {
    const {data} = await authAPI.register(formData);
    await saveTokens(data.accessToken, data.refreshToken);
    dispatch({type: 'SET_USER', payload: data.user});
    return data.user;
  };

  const logout = async () => {
    try {
      const tokens = await getTokens();
      if (tokens?.refreshToken) await authAPI.logout(tokens.refreshToken);
    } catch {}
    await clearTokens();
    dispatch({type: 'CLEAR_USER'});
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        isHR: state.user?.role === 'HR_ADMIN',
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {throw new Error('useAuth must be inside AuthProvider');}
  return ctx;
};
