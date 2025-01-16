import React, {createContext, ReactNode, useContext, useState} from 'react';
import {AuthModel} from "@shared/models/AuthModel.ts";

interface AuthContextType {
  user: AuthModel | null;
  login: (user: AuthModel) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<AuthModel | null>(null);

  const login = (user: AuthModel) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

