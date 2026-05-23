import { useEffect, useState } from "react";
import { api } from "../api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================
     🔐 LOGIN
  ========================= */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.auth.login(credentials);

      console.log("LOGIN RESPONSE:", data); // 🔍 debug

      // ✅ handle different backend formats
      const nextToken =
          data?.accessToken ||
          data?.token ||
          data?.jwt ||
          data?.data?.token;

      if (!nextToken) {
        throw new Error("Token not found in response");
      }

      // ✅ save token
      localStorage.setItem("token", nextToken);
      setTokenState(nextToken);

      // ✅ set user
      setUser(data?.user ?? { email: credentials.email });

      return data;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     📝 REGISTER
  ========================= */
  const register = async (body) => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.auth.register(body);

      const nextToken =
          data?.accessToken ||
          data?.token ||
          data?.jwt ||
          data?.data?.token;

      if (!nextToken) {
        throw new Error("Token not found in register response");
      }

      localStorage.setItem("token", nextToken);
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      setTokenState(nextToken);
      setUser(data?.user ?? { email: body.email });

      return data;
    } catch (err) {
      setError(err.message || "Register failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🚪 LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    setTokenState(null);
    setUser(null);
  };

  /* =========================
     🔄 AUTO LOGIN
  ========================= */
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const data = await api.auth.me();

        // ✅ set user from backend
        setUser(data ?? { email: "Authenticated user" });
      } catch (err) {
        console.log("Auto login failed:", err);
        logout(); // invalid token
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setTokenState(null);
      setUser(null);
    };

    window.addEventListener("foodbox:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("foodbox:unauthorized", handleUnauthorized);
  }, []);

  /* =========================
     📤 CONTEXT VALUE
  ========================= */
  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,

    // 🔥 KEY FIX
    isAuthenticated: !!token || !!user,
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
}
