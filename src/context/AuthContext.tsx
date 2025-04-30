import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check auth on mount
  useEffect(() => {
    const checkAuthOnMount = async () => {
      await checkAuth();
      setIsLoading(false);
    };

    checkAuthOnMount();
    // We want this effect to run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When token changes, verify it with the server
  useEffect(() => {
    if (token) {
      // Store token in localStorage
      localStorage.setItem("token", token);

      // Extract user ID from token
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.user) {
          setUserId(payload.user.id || null);
          setUser({
            id: payload.user.id,
            name: payload.user.name,
            email: payload.user.email,
          });
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse token:", error);
        setIsAuthenticated(false);
        setUserId(null);
        setUser(null);
      }
    }
  }, [token]);

  const checkAuth = async (): Promise<boolean> => {
    try {
      // Get token from localStorage
      const storedToken = localStorage.getItem("token");
      console.log("AuthContext: Checking token exists:", !!storedToken);

      if (!storedToken) {
        setIsAuthenticated(false);
        setToken(null);
        setUserId(null);
        setUser(null);
        return false;
      }

      // Update token state
      setToken(storedToken);

      // Basic client-side validation
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));

        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.log("AuthContext: Token expired");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setToken(null);
          setUserId(null);
          setUser(null);
          return false;
        }

        // Set user data from token payload
        if (payload.user) {
          setUserId(payload.user.id || null);
          setUser({
            id: payload.user.id,
            name: payload.user.name,
            email: payload.user.email,
          });
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse token:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setToken(null);
        setUserId(null);
        setUser(null);
        return false;
      }

      // Verify with server
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL || ""}/api/v1/auth/verify`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": storedToken,
              Authorization: `Bearer ${storedToken}`,
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserId(data.user?.id || null);
          setUser(data.user || null);
          setIsAuthenticated(true);
          return true;
        } else {
          console.log("AuthContext: Server rejected token");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setToken(null);
          setUserId(null);
          setUser(null);
          return false;
        }
      } catch (error) {
        // Network error - fall back to client-side validation
        console.warn("AuthContext: Network error, using client validation");
        // We've already validated the token client-side above
        return isAuthenticated;
      }
    } catch (error) {
      console.error("AuthContext: Error checking auth:", error);
      setIsAuthenticated(false);
      setToken(null);
      setUserId(null);
      setUser(null);
      return false;
    }
  };

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setToken(null);
    setUserId(null);
    setUser(null);
    window.location.href = import.meta.env.VITE_LANDING_PAGE_URL;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userId,
        token,
        user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
