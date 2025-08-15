import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  sub: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  first_name?: string;
  last_name?: string;
};

export function useAuth() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true); // ⏳ nouvel état

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      setLoading(false); //  fin du chargement même si pas de token
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      // Vérifie expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.warn("Token expiré");
        localStorage.removeItem("access_token");
        setUser(null);
      } else {
        setUser(decoded);
      }
    } catch (error) {
      console.error("Erreur de décodage du token :", error);
      setUser(null);
    }

    setLoading(false); // ✅ fin du chargement
  }, []);

  const isAuthenticated = !!user;

  return { user, isAuthenticated, loading }; // ✅ on expose loading
}
