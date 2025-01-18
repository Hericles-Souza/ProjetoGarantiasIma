import React, {ReactNode, useEffect, useState} from "react";
import {AuthModel} from "@shared/models/AuthModel.ts";
import {AuthService} from "@shared/services/AuthService.ts";
import {AuthContext} from "@shared/contexts/Auth/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import environment from "@env/environment.ts";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<AuthModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);  // Adicionando estado de carregamento
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(environment.TOKEN);

    if (token) {
      // Se o token estiver no localStorage, tenta carregar o usuário
      AuthService.getUserFromToken(token, (loggedInUser) => {
        setUser(loggedInUser);
        setLoading(false);  // Após carregar o usuário, define o loading como false
      });
    } else {
      // Se não houver token, redireciona para o login
      setLoading(false);  // Define o loading como false mesmo que não haja token
      navigate("/login");
    }
  }, [navigate]);

  const login = (user: AuthModel) => setUser(user);
  const logout = () => {
    setUser(null);
    localStorage.removeItem(environment.TOKEN);
    navigate("/login");
  };

  if (loading) {
    return <>{children}</>
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;