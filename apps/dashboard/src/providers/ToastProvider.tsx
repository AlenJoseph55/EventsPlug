"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Notification Container Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slideIn cursor-pointer hover:translate-y-[-2px] ${
              toast.type === "success"
                ? "bg-success-bg/95 border-success-border text-success-text"
                : toast.type === "error"
                ? "bg-danger-bg/95 border-danger-border text-danger-text"
                : "bg-bg-panel/95 border-border-main text-text-primary"
            }`}
          >
            <span className="text-base select-none">
              {toast.type === "success" ? "✨" : toast.type === "error" ? "🚨" : "ℹ️"}
            </span>
            <div className="flex-1 text-[11px] font-semibold leading-relaxed">
              {toast.message}
            </div>
            <button className="text-text-secondary hover:text-text-primary font-bold text-[10px] select-none ml-1">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
