import * as React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Home, 
  User, 
  FileText, 
  Users, 
  MapPin, 
  BarChart3, 
  Award,
  Shield,
  UserCheck,
  Crown,
  LogOut,
  Settings
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { getUserPermissions } from '@/data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const AppSidebar: React.FC = () => {
  const { state: sidebarState } = useSidebar();
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  
  if (!state.user) return null;

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const getInitials = (name: string) => {
    // Use first and last name if available, otherwise fallback to name splitting
    if (state.user.firstName && state.user.lastName) {
      return `${state.user.firstName[0]}${state.user.lastName[0]}`.toUpperCase();
    }
    
    // Fallback to original logic
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

  const permissions = getUserPermissions(state.user.role);

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { 
        title: 'Dashboard', 
        url: '/dashboard', 
        icon: Home,
        show: true 
      },
      { 
        title: 'My Profile', 
        url: '/dashboard/profile', 
        icon: User,
        show: permissions.canViewOwnProfile 
      },
      { 
        title: state.user.role === 'parish-pastor' ? 'Certificate Approvals' : 'Certificate Requests', 
        url: '/dashboard/certificates', 
        icon: Award,
        show: permissions.canRequestCertificate || permissions.canApproveLevel1 || permissions.canApproveLevel2 || permissions.canApproveLevel3
      },
    ];

    const adminItems = [
      { 
        title: 'Members', 
        url: '/dashboard/members', 
        icon: Users,
        show: permissions.canViewZoneMembers || permissions.canViewAllMembers 
      },
      { 
        title: 'Zones', 
        url: '/dashboard/zones', 
        icon: MapPin,
        show: permissions.canManageZones 
      },
      { 
        title: 'Statistics', 
        url: '/dashboard/statistics', 
        icon: BarChart3,
        show: permissions.canViewStats || permissions.canViewGlobalStats 
      },
    ];

    const superAdminItems = [
      { 
        title: 'Pastors', 
        url: '/dashboard/pastors', 
        icon: Crown,
        show: permissions.canManagePastors 
      },
    ];

    return {
      main: baseItems.filter(item => item.show),
      admin: adminItems.filter(item => item.show),
      superAdmin: superAdminItems.filter(item => item.show),
    };
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Sidebar Toggle */}
        <div className="p-3">
          <SidebarTrigger />
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="mb-3 px-3">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink 
                    to={item.url} 
                    end={item.url === '/dashboard'}
                  >
                    {({ isActive }) => (
                      <SidebarMenuButton 
                        isActive={isActive}
                        className={isActive ? "!bg-primary !text-primary-foreground !font-bold py-3 px-4 rounded-lg shadow-lg border border-primary/20 transition-all duration-200" : ""}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {sidebarState === 'expanded' && <span>{item.title}</span>}
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {navigationItems.admin.length > 0 && (
          <SidebarGroup className="py-3">
            <SidebarGroupLabel className="mb-3 px-3">Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navigationItems.admin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/dashboard'}
                    >
                      {({ isActive }) => (
                        <SidebarMenuButton 
                          isActive={isActive}
                          className={isActive ? "!bg-primary !text-primary-foreground !font-bold py-3 px-4 rounded-lg shadow-lg border border-primary/20 transition-all duration-200" : "hover:bg-primary/80 hover:text-primary-foreground transition-all duration-200"}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {sidebarState === 'expanded' && <span>{item.title}</span>}
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Super Admin Navigation */}
        {navigationItems.superAdmin.length > 0 && (
          <SidebarGroup className="py-3">
            <SidebarGroupLabel className="mb-3 px-3">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navigationItems.superAdmin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/dashboard'}
                    >
                      {({ isActive }) => (
                        <SidebarMenuButton 
                          isActive={isActive}
                          className={isActive ? "!bg-primary !text-primary-foreground !font-bold py-3 px-4 rounded-lg shadow-lg border border-primary/20 transition-all duration-200" : "hover:bg-primary/80 hover:text-primary-foreground transition-all duration-200"}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {sidebarState === 'expanded' && <span>{item.title}</span>}
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Info - Improved to match top bar */}
        <SidebarGroup className="mt-auto pt-6">
          <div className="px-3 pb-3">
            {sidebarState === 'expanded' ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={state.user.profileImage} alt={state.user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(state.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-sidebar-foreground">{state.user.name}</span>
                      <span className="text-xs text-sidebar-muted-foreground">{getRoleDisplay(state.user.role)}</span>
                    </div>
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
                  <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="cursor-pointer">
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
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 mx-auto">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={state.user.profileImage} alt={state.user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(state.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">{state.user.name}</p>
                      <p className="w-[200px] truncate text-xs text-muted-foreground">{state.user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="cursor-pointer">
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
            )}
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};