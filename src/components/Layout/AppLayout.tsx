import { Outlet, useLocation } from "react-router-dom";
import { MobileHeader } from "./MobileHeader";
import { AppSidebar } from "./AppSidebar";

export const AppLayout = () => {
  const location = useLocation();

  // Check if the current page is the FeedbackPage
  const isFeedbackPage = location.pathname.includes("/feedback");

  // Use different max-width based on the page
  const maxWidthClass = isFeedbackPage ? "max-w-6xl" : "max-w-4xl";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col flex-1">
        <MobileHeader />
        <main className="flex-1 overflow-auto px-2 py-3 transition-all duration-300">
          <div className={`mx-auto ${maxWidthClass} pb-4`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
