"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-context";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  FileText,
  UserCircle,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Package,
  Settings,
  BarChart,
  Award,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const menuItems = {
  ADMINISTRADOR: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/postulantes", label: "Postulantes", icon: Users },
    { href: "/unidades", label: "Unidades", icon: Building2 },
    { href: "/usuarios", label: "Usuarios", icon: UserCircle },
    { href: "/modalidades", label: "Modalidades", icon: Settings },
    { href: "/dashboard/tramites", label: "Gestión Trámites", icon: FileText },
    { href: "/dashboard/materiales", label: "Materiales", icon: Package },
    { href: "/licenciados", label: "Licenciados", icon: Award },
    { href: "/auditoria", label: "Auditoría", icon: Terminal },
  ],
  DIRECTOR: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/postulantes", label: "Postulantes", icon: Users },
    { href: "/unidades", label: "Unidades", icon: Building2 },
    { href: "/usuarios", label: "Usuarios", icon: UserCircle },
    { href: "/modalidades", label: "Modalidades", icon: Settings },
    { href: "/dashboard/tramites", label: "Gestión Trámites", icon: FileText },
    { href: "/dashboard/materiales", label: "Materiales", icon: Package },
    { href: "/licenciados", label: "Licenciados", icon: Award },
    { href: "/auditoria", label: "Auditoría", icon: Terminal },
  ],
  MEDICO: [
    { href: "/evaluaciones", label: "Evaluaciones", icon: ClipboardCheck },
    { href: "/postulantes", label: "Lista de Postulantes", icon: Users },
  ],
  SUPERVISOR: [
    { href: "/evaluaciones", label: "Evaluaciones", icon: ClipboardCheck },
    { href: "/postulantes", label: "Lista de Postulantes", icon: Users },
  ],
  POSTULANTE: [
    { href: "/mi-estado", label: "Mi Estado", icon: UserCircle },
    { href: "/mis-tramites", label: "Mis Trámites", icon: FileText },
  ],
  JEFE_UNIDAD: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/postulantes", label: "Postulantes", icon: Users },
    { href: "/modalidades", label: "Modalidades", icon: Settings },
    { href: "/dashboard/materiales", label: "Materiales", icon: Package },
  ],
  LICENCIADO: [
    { href: "/mis-tramites", label: "Mis Trámites", icon: FileText },
  ],
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const items = menuItems[user?.rol] || [];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-foreground"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <Image
            src="/images/image.png"
            alt="Dirección General Territorial Militar"
            width={40}
            height={40}
            className="object-contain shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">SIREM</span>
              <span className="text-xs text-sidebar-foreground/70">
                Reclutamiento Militar
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-sidebar-border">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <UserCircle className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.nombre}</span>
                <span className="text-xs text-sidebar-foreground/70">
                  {user.rol}
                </span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">Cerrar Sesión</span>}
          </Button>
        </div>

        {/* Collapse Button (Desktop only) */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </aside>
    </>
  );
}
