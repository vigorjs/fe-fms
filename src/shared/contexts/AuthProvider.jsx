import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import authService from "../api/auth-service";

// For debugging
console.log('AuthProvider initialized');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // Verify token by fetching current user profile
      authService.getProfile()
        .catch(() => {
          // If the token is invalid, log the user out
          logout();
        });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify({
        ...result.user,
        token: result.token
      }));
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify({
        ...result.user,
        token: result.token
      }));
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
