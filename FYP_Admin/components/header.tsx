"use client"

import { Bell, Search, LogOut } from "lucide-react"

interface HeaderProps {
  onLogout?: () => void
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
            />
          </div>

          {/* <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button> */}

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <img
                src="/placeholder.svg?height=32&width=32&text=Admin"
                alt="Admin Avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="font-medium">Admin</span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
