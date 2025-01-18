import {createContext} from "react";
import {AuthModel} from "@shared/models/AuthModel.ts";

interface AuthContextType {
  user: AuthModel | null;
  login: (user: AuthModel) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
