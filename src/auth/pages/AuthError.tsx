import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const AuthError: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("Authentication failed");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    switch (error) {
      case "no_code":
        setErrorMessage("Authorization code is missing");
        break;
      case "token_exchange_failed":
        setErrorMessage("Failed to exchange authorization code");
        break;
      case "user_info_failed":
        setErrorMessage("Failed to get user info");
        break;
      case "server_error":
        setErrorMessage("Server error occurred during authentication");
        break;
      case "auth_failed":
        setErrorMessage("Authentication failed");
        break;
      default:
        setErrorMessage("An unexpected error occurred during sign in");
    }
  }, [location]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-100">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600 text-center mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
