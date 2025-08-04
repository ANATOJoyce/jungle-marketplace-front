// app/components/Header.tsx
import { useNavigate } from "@remix-run/react";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <button
        onClick={() => navigate("/settings/profile")}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        Mon Profil
      </button>
    </header>
  );
}
