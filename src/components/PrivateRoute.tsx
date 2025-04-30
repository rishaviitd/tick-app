import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { Loader } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const hasVerifiedRef = useRef(false);
  const lastRenderedStateRef = useRef("");

  // Only verify once on mount, not on every render
  useEffect(() => {
    const verifyAuth = async () => {
      // Only run verification if not already done
      if (!hasVerifiedRef.current) {
        console.log("PrivateRoute: Starting auth verification");
        // Run an additional check on component mount
        await checkAuth();
        setIsVerifying(false);
        hasVerifiedRef.current = true;
        console.log("PrivateRoute: Auth verification complete:", {
          isAuthenticated,
        });
      }
    };

    verifyAuth();
  }, [checkAuth, isAuthenticated]);

  // Show a proper loading state
  if (isLoading || isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Verifying your authentication...</p>
      </div>
    );
  }

  // Log the state only when it changes, not on every render
  const currentState = `auth:${isAuthenticated}`;
  if (lastRenderedStateRef.current !== currentState) {
    console.log("PrivateRoute: Rendering with auth state:", {
      isAuthenticated,
    });
    lastRenderedStateRef.current = currentState;
  }

  if (!isAuthenticated) {
    console.log("PrivateRoute: User not authenticated, redirecting to login");
    // Redirect to login route (which then redirects externally)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
