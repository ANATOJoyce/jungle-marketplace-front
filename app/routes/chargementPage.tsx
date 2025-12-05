import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/Button";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/dashboard");
    }, 10000); // 10 secondes

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Logo principal */}
      <img
        src="/VendorCustomer.png"
        alt="Logo Jungle"
        className="w-50 h-auto animate-bounce mb-6 drop-shadow-lg"
      />   
      <p>Patienté</p>
   <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full"></div>
        <p className="text-gray-600 font-medium">Nous créons votre expace de travail...</p>
      </div>
    </div>
    </div>
  );
}