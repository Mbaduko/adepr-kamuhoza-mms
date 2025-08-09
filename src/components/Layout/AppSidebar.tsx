import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Crown
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { getUserPermissions } from '@/data/mockData';

export const AppSidebar: React.FC = () => {
  const { state: sidebarState } = useSidebar();
  const { state } = useAuth();
  const location = useLocation();
  
  if (!state.user) return null;

  const permissions = getUserPermissions(state.user.role);
  const currentPath = location.pathname;

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

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
        url: '/profile', 
        icon: User,
        show: permissions.canViewOwnProfile 
      },
      { 
        title: 'Certificate Requests', 
        url: '/certificates', 
        icon: Award,
        show: permissions.canRequestCertificate 
      },
    ];

    const adminItems = [
      { 
        title: 'Members', 
        url: '/members', 
        icon: Users,
        show: permissions.canViewZoneMembers || permissions.canViewAllMembers 
      },
      { 
        title: 'Zones', 
        url: '/zones', 
        icon: MapPin,
        show: permissions.canManageZones 
      },
      { 
        title: 'Statistics', 
        url: '/statistics', 
        icon: BarChart3,
        show: permissions.canViewStats || permissions.canViewGlobalStats 
      },
    ];

    const superAdminItems = [
      { 
        title: 'Pastors', 
        url: '/pastors', 
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

  const getRoleIcon = () => {
    switch (state.user.role) {
      case 'member': return User;
      case 'zone-leader': return UserCheck;
      case 'pastor': return Crown;
      case 'parish-pastor': return Shield;
      default: return User;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Sidebar Toggle */}
        <div className="p-2">
          <SidebarTrigger />
        </div>
        {/* User Info */}
        <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
            <RoleIcon className="h-4 w-4" />
            {sidebarState === 'expanded' && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">{state.user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {state.user.role.replace('-', ' ')}
                </span>
              </div>
            )}
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {sidebarState === 'expanded' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {navigationItems.admin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.admin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {sidebarState === 'expanded' && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Super Admin Navigation */}
        {navigationItems.superAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.superAdmin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {sidebarState === 'expanded' && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};