import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      console.log("PrivateRoute: Starting auth verification");
      // Run an additional check on component mount
      await checkAuth();
      setIsVerifying(false);
      console.log("PrivateRoute: Auth verification complete:", {
        isAuthenticated,
      });
    };

    verifyAuth();
  }, [checkAuth]);

  // Show a proper loading state
  if (isLoading || isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Verifying your authentication...</p>
      </div>
    );
  }

  // Log the state for debugging
  console.log("PrivateRoute: Rendering with auth state:", { isAuthenticated });

  if (!isAuthenticated) {
    console.log("PrivateRoute: User not authenticated, redirecting to login");
    // Redirect to login route (which then redirects externally)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
