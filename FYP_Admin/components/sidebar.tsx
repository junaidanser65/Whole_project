"use client"

import { Users, Store, LayoutDashboard, ShoppingCart } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "vendors", label: "Vendors", icon: Store },
  ]

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          {/* <ShoppingCart className="h-8 w-8" /> */}
          <img src="/logo.png" alt="" />
          {/* <h1 className="text-xl font-bold">Fiesta Carts</h1> */}
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
