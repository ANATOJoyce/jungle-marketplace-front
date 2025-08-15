import { useEffect, useState } from "react";

export const useProducts = () => {
  const token = localStorage.getItem('access_token');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProducts);
  }, [token]);

  return { products };
};