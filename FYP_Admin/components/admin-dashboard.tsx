"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { UsersList } from "@/components/users-list"
import { VendorsList } from "@/components/vendors-list"
import { Dashboard } from "@/components/dashboard"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "users":
        return <UsersList />
      case "vendors":
        return <VendorsList />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <Header onLogout={onLogout} />
          <main className="p-6">{renderContent()}</main>
        </div>
      </div>
    </div>
  )
}
