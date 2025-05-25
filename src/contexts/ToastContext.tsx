import React, { createContext, useContext, useState } from "react"
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider as ToastProviderComponent,
  ToastTitle,
  ToastViewport,
} from "../components/ui/toast"

interface ToastContextType {
  showToast: (props: {
    title: string
    description?: string
    variant?: "default" | "destructive" | "success"
  }) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{
    id: string
    title: string
    description?: string
    variant?: "default" | "destructive" | "success"
  }>>([])

  const showToast = ({
    title,
    description,
    variant = "default",
  }: {
    title: string
    description?: string
    variant?: "default" | "destructive" | "success"
  }) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, title, description, variant }])

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastProviderComponent>
        {children}
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.variant}>
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
            <ToastAction altText="Close">Close</ToastAction>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProviderComponent>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
} 