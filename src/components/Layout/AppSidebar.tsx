import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  BarChart,
  Settings,
  LogOut,
  Menu,
  User,
  X,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isSidebarCollapsed: boolean;
}

const SidebarLink = ({
  to,
  icon: Icon,
  label,
  isSidebarCollapsed,
}: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Icon size={20} />
            {!isSidebarCollapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        {isSidebarCollapsed && (
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export const AppSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  console.log("AppSidebar user data:", user);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const sidebarWidth = isCollapsed ? "w-[70px]" : "w-[240px]";

  // For mobile: full-screen overlay when open
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={toggleMobileMenu}
        >
          <Menu size={24} />
        </Button>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-sidebar z-40 animate-fade-in">
            <div className="flex justify-end p-4">
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X size={24} className="text-sidebar-foreground" />
              </Button>
            </div>

            <div className="flex flex-col h-full p-4">
              <div className="flex items-center gap-3 px-4 py-3 mb-6">
                <GraduationCap size={32} className="text-primary" />
                <span className="text-xl font-bold text-sidebar-foreground">
                  GradeAI
                </span>
              </div>

              <div className="flex-1 space-y-1">
                <SidebarLink
                  to="/"
                  icon={LayoutDashboard}
                  label="Dashboard"
                  isSidebarCollapsed={false}
                />
                <SidebarLink
                  to="/assignments"
                  icon={BookOpen}
                  label="Assignments"
                  isSidebarCollapsed={false}
                />
                <SidebarLink
                  to="/create-assignment"
                  icon={FileText}
                  label="Create Assignment"
                  isSidebarCollapsed={false}
                />
                <SidebarLink
                  to="/analytics"
                  icon={BarChart}
                  label="Analytics"
                  isSidebarCollapsed={false}
                />
                <SidebarLink
                  to="/settings"
                  icon={Settings}
                  label="Settings"
                  isSidebarCollapsed={false}
                />
              </div>

              <div className="mt-auto border-t border-sidebar-border pt-4">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground">
                      {user?.name || "Guest User"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70">
                      {user?.email || "Teacher"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 text-sidebar-foreground px-4 py-3 w-full hover:bg-sidebar-accent/50 rounded-lg transition-colors mt-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "h-screen bg-sidebar flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border",
        sidebarWidth
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5">
        <GraduationCap size={28} className="text-primary min-w-[28px]" />
        {!isCollapsed && (
          <span className="text-xl font-bold text-sidebar-foreground">
            GradeAI
          </span>
        )}
      </div>

      <div className="flex-1 space-y-1 px-2 py-4">
        <SidebarLink
          to="/"
          icon={LayoutDashboard}
          label="Dashboard"
          isSidebarCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/assignments"
          icon={BookOpen}
          label="Assignments"
          isSidebarCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/create-assignment"
          icon={FileText}
          label="Create Assignment"
          isSidebarCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/analytics"
          icon={BarChart}
          label="Analytics"
          isSidebarCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/settings"
          icon={Settings}
          label="Settings"
          isSidebarCollapsed={isCollapsed}
        />
      </div>

      <div className="mt-auto border-t border-sidebar-border px-2 py-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.name || "Guest User"}
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                {user?.email || "Teacher"}
              </p>
            </div>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center py-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{user?.name || "Guest User"}</p>
                <p className="text-xs">{user?.email || "Teacher"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {!isCollapsed && (
          <button
            onClick={logout}
            className="flex items-center gap-3 text-sidebar-foreground px-4 py-3 w-full hover:bg-sidebar-accent/50 rounded-lg transition-colors mt-2"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className="self-end p-2 m-2 rounded-full hover:bg-sidebar-accent/50 text-sidebar-foreground"
      >
        <Menu size={20} />
      </button>
    </div>
  );
};
