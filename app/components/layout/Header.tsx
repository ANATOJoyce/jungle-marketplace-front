import { Link } from "@remix-run/react";
import { Logo } from "../auth/logo";
import { UserNav } from "./user-nav";


export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-4">
          {/* Logo et nom de l'application */}
          <Logo size="sm" />
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          {/* Navigation utilisateur */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}