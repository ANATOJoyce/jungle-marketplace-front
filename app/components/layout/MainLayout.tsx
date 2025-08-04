// app/components/layout/MainLayout.tsx
import { ReactNode } from "react";
import { Header } from "../Header";
import { Sidebar } from "../Sidebar";
import { Outlet } from "@remix-run/react";

interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
} 