"use client"

import { useState } from "react"
import LoginPage from "@/components/login-page"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}
