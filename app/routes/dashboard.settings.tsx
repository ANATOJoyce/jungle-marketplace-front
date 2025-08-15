import { useNavigate, useLocation, Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRoute, setSelectedRoute] = useState("");

  // Met à jour l'option sélectionnée lors du changement de route
  useEffect(() => {
    if (location.pathname.includes("/dashboard/setting/profile")) {
      setSelectedRoute("/dashboard/setting/profile");
    } else if (location.pathname.includes("/dashboard/setting/store")) {
      setSelectedRoute("/dashboard/setting/store");
    }
  }, [location.pathname]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRoute(value);
    navigate(value);
  };

  return (
    <div className="p-6 flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <h2 className="text-2xl font-semibold mb-2 sm:mb-0">Paramètres</h2>

        <select
          value={selectedRoute}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fbb344] focus:border-transparent"
        >
          <option value="/dashboard/setting/profile">Mon Profil</option>
          <option value="/dashboard/setting/store">Créer une boutique</option>
        </select>
      </div>

      {/* Contenu dynamique */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
