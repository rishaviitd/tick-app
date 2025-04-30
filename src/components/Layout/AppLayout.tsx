import { Outlet, useLocation } from "react-router-dom";
import { MobileHeader } from "./MobileHeader";
import { cn } from "@/lib/utils";

export const AppLayout = () => {
  const location = useLocation();
  const isDashboard =
    location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {isDashboard && <MobileHeader />}
      <main
        className={cn(
          "flex-1 overflow-auto px-4 py-5 transition-all duration-300",
          !isDashboard && "pt-5" // Consistent padding when no header
        )}
      >
        <div className="mx-auto max-w-3xl pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
