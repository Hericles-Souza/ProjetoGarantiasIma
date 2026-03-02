import React, { ReactNode, useEffect, useState } from "react";
import { AuthModel } from "@shared/models/AuthModel.ts";
import { AuthService } from "@shared/services/AuthService.ts";
import { AuthContext } from "@shared/contexts/Auth/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import environment from "@env/environment.ts";
import { StaticPageLoading } from "@shared/components/static_page_loading/static_page_loading.tsx";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(environment.TOKEN);

      if (token) {
        try {
          const loggedInUser = await AuthService.getUserFromToken(token);
          setUser(loggedInUser);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setUser(null);
          localStorage.removeItem(environment.TOKEN);
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    };

    initializeAuth();
  }, [navigate]);

  const login = async (user: AuthModel) => {
    setUser(user);
    localStorage.setItem(environment.TOKEN, user.token); 
    navigate("/garantias");
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    navigate("/login");
  };

  if (loading) {
    return <StaticPageLoading />;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;