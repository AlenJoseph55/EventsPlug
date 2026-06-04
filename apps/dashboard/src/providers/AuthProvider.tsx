"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface SessionUser {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  defaultThemeId?: string | null;
  defaultLayout?: string;
  defaultLimit?: number | null;
}

interface AuthContextType {
  token: string | null;
  user: SessionUser | null;
  adminTheme: "dark" | "light";
  activeTab: string;
  viewMode: "organizer" | "system" | "attendee";
  systemTab: "tenants" | "themes";
  authLoading: boolean;
  authError: string | null;
  apiBase: string;
  setActiveTab: (tab: string) => void;
  setViewMode: (mode: "organizer" | "system" | "attendee") => void;
  setSystemTab: (tab: "tenants" | "themes") => void;
  toggleAdminTheme: () => void;
  handleLogin: (e: React.FormEvent, emailInput: string, passwordInput: string) => Promise<boolean>;
  handleLogout: () => void;
  clearAuthError: () => void;
  setUser: React.Dispatch<React.SetStateAction<SessionUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const apiBase = "http://localhost:5001/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [adminTheme, setAdminTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [viewMode, setViewMode] = useState<"organizer" | "system" | "attendee">("organizer");
  const [systemTab, setSystemTab] = useState<"tenants" | "themes">("tenants");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Sync admin theme class on the <html> element for global CSS variable scoping
  useEffect(() => {
    if (!isThemeLoaded) return;
    const root = document.documentElement;
    root.classList.remove('light-admin', 'dark-admin');
    root.classList.add(adminTheme === 'light' ? 'light-admin' : 'dark-admin');
  }, [adminTheme, isThemeLoaded]);

  // Sync token, user, and theme preference from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const savedTheme = localStorage.getItem("eventsplug-admin-theme-preference");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }

    if (savedTheme === "light" || savedTheme === "dark") {
      setAdminTheme(savedTheme);
    }
    setIsThemeLoaded(true);
  }, []);

  const toggleAdminTheme = useCallback(() => {
    setAdminTheme((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("eventsplug-admin-theme-preference", nextTheme);
      return nextTheme;
    });
  }, []);

  const handleLogin = async (e: React.FormEvent, emailInput: string, passwordInput: string): Promise<boolean> => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });

      if (!res.ok) {
        throw new Error("Invalid email or password combination.");
      }

      const data = await res.json();
      const sessionUser: SessionUser = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        organizationId: data.organization.id,
        organizationSlug: data.organization.slug,
        organizationName: data.organization.name,
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(sessionUser));
      
      setToken(data.token);
      setUser(sessionUser);
      return true;
    } catch (err: any) {
      setAuthError(err.message || "Unable to connect to service.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setActiveTab("overview");
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        adminTheme,
        activeTab,
        viewMode,
        systemTab,
        authLoading,
        authError,
        apiBase,
        setActiveTab,
        setViewMode,
        setSystemTab,
        toggleAdminTheme,
        handleLogin,
        handleLogout,
        clearAuthError,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
