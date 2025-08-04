import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/Button";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/Acueille");
    }, 5000); // 5 secondes

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Logo principal */}
      <img
        src="/Jungle_logo05.png"
        alt="Logo Jungle"
        className="w-50 h-auto animate-bounce mb-6 drop-shadow-lg"
      />   
    </div>
  );
}