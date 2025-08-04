import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "@remix-run/react";

// Types JWT + utilisateur avec token
type JwtPayload = {
  sub: string;
  email?: string;
  role?: string;
  exp?: number;
};

type AuthUser = JwtPayload & {
  token: string;
};

// Type du contexte
type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Récupération du token dans localStorage au démarrage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("access_token");
      if (storedToken) setTokenState(storedToken);
    }
  }, []);

  // Déconnexion complète
  const logout = useCallback(() => {
    setTokenState(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    navigate("/login");
  }, [navigate]);

  // Décodage JWT + vérification expiration
  const decodeAndSetUser = useCallback(
    (tok: string | null) => {
      if (!tok) {
        setUser(null);
        return;
      }
      try {
        const decoded = jwtDecode<JwtPayload>(tok);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          logout();
          return;
        }
        setUser({ ...decoded, token: tok });
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", tok);
        }
      } catch {
        logout();
      }
    },
    [logout]
  );

  // Setter de token (public)
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    decodeAndSetUser(newToken);
    if (typeof window !== "undefined") {
      if (!newToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } else {
        localStorage.setItem("access_token", newToken);
      }
    }
  };

  // Connexion API + stockage token
  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login: email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la connexion");
      }

      const accessToken = data.access_token;
      setToken(accessToken);
      navigate("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  // Recalcul de l'utilisateur à chaque changement de token
  useEffect(() => {
    decodeAndSetUser(token);
  }, [token, decodeAndSetUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        setToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour consommer le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
