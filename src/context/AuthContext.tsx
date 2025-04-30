import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
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

  // Use refs to track state without triggering re-renders
  const authCheckedRef = useRef(false);
  const lastLoggedStateRef = useRef("");

  // Memoize the checkAuth function to avoid recreation on each render
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Get token from localStorage
      const storedToken = localStorage.getItem("token");

      // Only log on actual changes to token state
      const tokenState = storedToken ? "exists" : "missing";
      if (lastLoggedStateRef.current !== tokenState) {
        console.log("AuthContext: Checking token exists:", !!storedToken);
        lastLoggedStateRef.current = tokenState;
      }

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
          // Don't set authenticated yet - wait for server verification
        }
      } catch (error) {
        console.error("Failed to parse token:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setToken(null);
        setUserId(null);
        setUser(null);
        return false;
      }

      // Skip server verification if we've already done it once
      if (authCheckedRef.current && isAuthenticated) {
        return true;
      }

      // Verify with server
      try {
        console.log(
          "AuthContext: Attempting server verification with URL:",
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/verify`
        );

        const verifyUrl = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/auth/verify`;

        const response = await fetch(verifyUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": storedToken,
            Authorization: `Bearer ${storedToken}`,
          },
          mode: "cors",
        });

        console.log("AuthContext: Verify response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("AuthContext: Verification successful, user data:", data);

          // Ensure we set these in the right order
          setUserId(data.user?.id || null);
          setUser(data.user || null);
          setIsAuthenticated(true);

          // Mark auth as checked
          authCheckedRef.current = true;

          console.log("AuthContext: Authentication state set to true");
          return true;
        } else {
          console.log(
            "AuthContext: Server rejected token, status:",
            response.status
          );
          // Try to read and log the error response
          try {
            const errorData = await response.json();
            console.log("AuthContext: Error response:", errorData);
          } catch (parseError) {
            console.log("AuthContext: Could not parse error response");
          }

          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setToken(null);
          setUserId(null);
          setUser(null);
          return false;
        }
      } catch (error) {
        // Network error - log more details
        console.warn("AuthContext: Network error during verification:", error);

        // Fall back to client-side validation but mark as not fully authenticated
        console.log("AuthContext: Falling back to client-side validation");
        return false;
      }
    } catch (error) {
      console.error("AuthContext: Error checking auth:", error);
      setIsAuthenticated(false);
      setToken(null);
      setUserId(null);
      setUser(null);
      return false;
    }
  }, [isAuthenticated]);

  // Check auth only once on mount
  useEffect(() => {
    if (!authCheckedRef.current) {
      const checkAuthOnMount = async () => {
        console.log("AuthContext: Initial auth check starting");
        const result = await checkAuth();
        console.log(
          "AuthContext: Initial auth check complete, authenticated:",
          result
        );
        setIsLoading(false);
      };

      checkAuthOnMount();
    }
  }, [checkAuth]);

  // When token changes, verify it with the server
  useEffect(() => {
    if (token) {
      // Store token in localStorage
      localStorage.setItem("token", token);
      console.log("AuthContext: Token updated in state and localStorage");

      // Extract user ID from token
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("AuthContext: Parsed token payload:", payload);
        if (payload.user) {
          setUserId(payload.user.id || null);
          setUser({
            id: payload.user.id,
            name: payload.user.name,
            email: payload.user.email,
          });
          setIsAuthenticated(true);
          console.log("AuthContext: User authenticated from token payload");
        }
      } catch (error) {
        console.error("Failed to parse token:", error);
        setIsAuthenticated(false);
        setUserId(null);
        setUser(null);
      }
    }
  }, [token]);

  const login = (newToken: string) => {
    console.log("AuthContext: Login called with new token");
    setToken(newToken);
    setIsAuthenticated(true);
    authCheckedRef.current = true; // Consider authentication checked after login
  };

  const logout = () => {
    console.log("AuthContext: Logout called");
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setToken(null);
    setUserId(null);
    setUser(null);
    authCheckedRef.current = false; // Reset auth check flag on logout
    window.location.href = import.meta.env.VITE_LANDING_PAGE_URL;
  };

  // Log the current auth state when it changes, but not on every render
  useEffect(() => {
    console.log("AuthContext: Auth state updated", {
      isAuthenticated,
      isLoading,
      userId,
      hasToken: !!token,
      hasUser: !!user,
    });
  }, [isAuthenticated, isLoading, userId, token, user]);

  // Memoize the context value to prevent unnecessary renders
  const contextValue = {
    isAuthenticated,
    isLoading,
    userId,
    token,
    user,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
