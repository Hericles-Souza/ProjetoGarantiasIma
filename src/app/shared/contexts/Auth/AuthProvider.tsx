import React, {ReactNode, useEffect, useState} from "react";
import {AuthModel} from "@shared/models/AuthModel.ts";
import {AuthService} from "@shared/services/AuthService.ts";
import {AuthContext} from "@shared/contexts/Auth/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import environment from "@env/environment.ts";
import {StaticPageLoading} from "@shared/components/static_page_loading/static_page_loading.tsx";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<AuthModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(environment.TOKEN);

    if (token) {
      // Tenta carregar o usuário a partir do token
      AuthService.getUserFromToken(token, (loggedInUser) => {
        setUser(loggedInUser);
        setLoading(false);
      });
    } else {
      setLoading(false); // Define como carregado mesmo que não haja token
      navigate("/login");
    }
  }, [navigate]);

  const login = (user: AuthModel) => {
    setUser(user);
    localStorage.setItem(environment.TOKEN, user.token); // Salva o token no localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(environment.TOKEN);
    navigate("/login");
  };

  if (loading) {
    return <StaticPageLoading/>;
  }

  return (
    <AuthContext.Provider value={{user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
