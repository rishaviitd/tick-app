import { Outlet } from "react-router-dom";
import { MobileHeader } from "./MobileHeader";
import { AppSidebar } from "./AppSidebar";

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col flex-1">
        <MobileHeader />
        <main className="flex-1 overflow-auto px-4 py-5 transition-all duration-300">
          <div className="mx-auto max-w-3xl pb-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
