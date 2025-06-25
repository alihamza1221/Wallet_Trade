"use client";

import type React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type ToastType = "success" | "error" | "loading" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => string; // Return toast ID
  hideToast: (id: string) => void;
  showLoadingToast: (
    title: string,
    message?: string,
    duration?: number
  ) => string;
  updateToastToSuccess: (id: string, title: string, message?: string) => void;
  updateToastToError: (id: string, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration (except for loading toasts)
    if (toast.type !== "loading" && toast.duration !== 0) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration || 4000);
    }

    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showLoadingToast = useCallback((title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      type: "loading",
      title,
      message,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const updateToastToSuccess = useCallback(
    (id: string, title: string, message?: string) => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id
            ? { ...toast, type: "success" as ToastType, title, message }
            : toast
        )
      );

      // Auto remove success toast after 4 seconds
      setTimeout(() => {
        hideToast(id);
      }, 4000);
    },
    [hideToast]
  );

  const updateToastToError = useCallback(
    (id: string, title: string, message?: string) => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id
            ? { ...toast, type: "error" as ToastType, title, message }
            : toast
        )
      );

      // Auto remove error toast after 4 seconds
      setTimeout(() => {
        hideToast(id);
      }, 4000);
    },
    [hideToast]
  );

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "loading":
        return <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />;
      case "info":
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-green-400/20 bg-green-400/10";
      case "error":
        return "border-red-400/20 bg-red-400/10";
      case "loading":
        return "border-yellow-400/20 bg-yellow-400/10";
      case "info":
        return "border-blue-400/20 bg-blue-400/10";
      default:
        return "border-gray-400/20 bg-gray-400/10";
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        showLoadingToast,
        updateToastToSuccess,
        updateToastToError,
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-[80%] max-w-md space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              relative p-4 rounded-lg border backdrop-blur-sm
              ${getToastStyles(toast.type)}
              animate-in slide-in-from-top-2 duration-300
              shadow-lg
            `}
          >
            <div className="flex items-start gap-3">
              {getToastIcon(toast.type)}

              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm">
                  {toast.title}
                </div>
                {toast.message && (
                  <div className="text-gray-300 text-xs mt-1">
                    {toast.message}
                  </div>
                )}
              </div>

              {toast.type !== "loading" && (
                <button
                  onClick={() => hideToast(toast.id)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Progress bar for loading toasts */}
            {toast.type === "loading" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg overflow-hidden">
                <div className="h-full bg-yellow-400 animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
