import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading indicator or nothing while auth is being checked
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login route (which then redirects externally)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
