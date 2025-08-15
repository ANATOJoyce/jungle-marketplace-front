// hooks/useStores.ts
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export function useStores() {
  const { isAuthenticated } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const fetchStores = async () => {
      try {
        const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/store/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erreur lors du chargement des boutiques");

        const data = await res.json();
        setStores(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Erreur de récupération des boutiques :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [isAuthenticated]);

  return { stores, loading };
}
