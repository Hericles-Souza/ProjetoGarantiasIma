import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModel } from "@shared/models/AuthModel.ts";
import { AuthService } from "@shared/services/AuthService.ts";
import { AuthContext } from "@shared/contexts/Auth/AuthContext.tsx";
import environment from "@env/environment.ts";
import { homePathFor } from "@app/routes/homePath";
import { StaticPageLoading } from "@shared/components/static_page_loading/static_page_loading.tsx";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(environment.TOKEN);

    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    AuthService.getUserFromToken(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(environment.TOKEN);
        navigate("/login");
      })
      .finally(() => setLoading(false));
    // Só na montagem: o navigate muda de referência a cada rota e refazia o /auth/me.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    (loggedUser: AuthModel) => {
      setUser(loggedUser);
      localStorage.setItem(environment.TOKEN, loggedUser.token);
      navigate(homePathFor(loggedUser));
    },
    [navigate]
  );

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  if (loading) {
    return <StaticPageLoading />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
