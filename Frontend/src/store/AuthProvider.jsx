import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

 // AuthProvider.jsx

const refreshAuth = async () => {
  const token = localStorage.getItem("token"); // ← ADD THIS
  if (!token) {                                 // ← ADD THIS
    setIsLoading(false);                        // ← ADD THIS
    return null;                                // ← ADD THIS
  }                                             // ← ADD THIS
  try {
    const response = await axiosInstance.get("/auth/me");
    setUser(response.data.data);
    return response.data.data;
  } catch (error) {
    localStorage.removeItem("token");           // ← ADD THIS (clear bad token)
    setUser(null);
    return null;
  } finally {
    setIsLoading(false);
  }
};
  useEffect(() => {
    refreshAuth();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      navigate("/admin/login", { replace: true });
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
     async login(payload) {
  const response = await axiosInstance.post("/auth/login", payload);
  localStorage.setItem("token", response.data.data.token); // ← ADD THIS LINE
  setUser(response.data.data.user);
  return response.data;
},
      async register(payload) {
        const response = await axiosInstance.post("/auth/register", payload);
        setUser(response.data.data.user);
        return response.data;
      },
      async logout() {
        try {
          await axiosInstance.post("/auth/logout");
        } catch (_) {
          // ignore — clear local state regardless
        } finally {
          localStorage.removeItem("token");
          setUser(null);
          navigate("/admin/login", { replace: true });
        }
      },
      refreshAuth,
    }),
    [isLoading, navigate, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}
