import { Outlet, NavLink } from "@remix-run/react";

export default function SettingsLayout() {
  return (
    <div className="p-6 flex">
      {/* Sidebar latérale dans la page paramètres */}
      <nav className="flex flex-col w-48 mr-6 border-r pr-4">
        <h2 className="text-2xl font-semibold mb-4">Paramètres</h2>
        <NavLink
          to="/dashboard/setting/profile"
          className={({ isActive }) =>
            isActive
              ? "text-[#fbb344] font-semibold mb-2"
              : "text-gray-600 mb-2 hover:text-[#fbb344] transition-colors"
          }
        >
          Mon Profil
        </NavLink>
        <NavLink
          to="/dashboard/setting/store"
          className={({ isActive }) =>
            isActive
              ? "text-[#fbb344] font-semibold mb-2"
              : "text-gray-600 mb-2 hover:text-[#fbb344] transition-colors"
          }
        >
          Créer une boutique
        </NavLink>
      </nav>

      {/* Contenu chargé via Outlet */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
