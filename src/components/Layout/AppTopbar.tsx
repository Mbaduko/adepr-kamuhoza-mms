"use client"

import type * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import logoImage from "@/assets/logo.png"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export const AppTopbar: React.FC = () => {
  const { state, logout } = useAuth()
  const navigate = useNavigate()

  if (!state.user) return null

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleDisplay = (role: string) => {
    return role
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <header className="sticky top-0 z-50 h-16 w-full flex items-center justify-between px-4 border-b border-border bg-card/95 supports-[backdrop-filter]:bg-card backdrop-blur shadow-sm">
      {/* Left side - Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img src={logoImage || "/placeholder.svg"} alt="Church Logo" className="h-8 w-auto" />
          <h1 className="text-lg font-semibold text-foreground">ADEPR Muhoza</h1>
        </div>
      </div>

      {/* Right side - User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-4 cursor-pointer">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{state.user.name}</p>
              <p className="text-xs text-muted-foreground">{getRoleDisplay(state.user.role)}</p>
            </div>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={state.user.profileImage || "/placeholder.svg"} alt={state.user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(state.user.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm">{state.user.name}</p>
              <p className="w-[200px] truncate text-xs text-muted-foreground">{state.user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </header>
  )
}
