import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';

export const AppLayout: React.FC = () => {
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