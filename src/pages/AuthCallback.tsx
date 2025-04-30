import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        try {
          // Store token in localStorage with correct key name
          localStorage.setItem("token", token);

          // Then call login to update context
          login(token);

          console.log("Auth data stored successfully");

          // Redirect to dashboard
          navigate("/dashboard");
        } catch (error) {
          console.error("Error handling token:", error);
          navigate("/auth/error");
        }
      } else {
        // Handle error
        navigate("/auth/error");
      }
    };

    handleCallback();
  }, [location, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Completing sign in...
        </h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
