import * as React from 'react';
import { NavLink } from 'react-router-dom';
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
  
  if (!state.user) return null;

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
        title: 'Certificate Requests', 
        url: '/dashboard/certificates', 
        icon: Award,
        show: permissions.canRequestCertificate 
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
        <SidebarGroup className="pb-4">
        <SidebarGroupLabel className="flex items-center gap-2 mb-4">
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
        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="mb-2">Main</SidebarGroupLabel>
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
          <SidebarGroup className="py-2">
            <SidebarGroupLabel className="mb-2">Management</SidebarGroupLabel>
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
          <SidebarGroup className="py-2">
            <SidebarGroupLabel className="mb-2">Administration</SidebarGroupLabel>
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
      </SidebarContent>
    </Sidebar>
  );
};