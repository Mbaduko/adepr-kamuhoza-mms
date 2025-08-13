import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';

export const AppLayout: React.FC = () => {
  React.useEffect(() => {
    // Add dashboard-layout class to body when in dashboard
    document.body.classList.add('dashboard-layout');
    
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('dashboard-layout');
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        {/* Top bar spans full width - sticky */}
        <AppTopbar />
        
        {/* Main content area with sidebar and content */}
        <div className="flex h-[calc(100vh-4rem)]">
          <AppSidebar />
          <main className="flex-1 p-6 pt-8 bg-background overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};