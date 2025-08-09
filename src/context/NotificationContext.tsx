import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'error' | 'warning') => void;
  showEmailNotification: (to: string, subject: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    toast({
      title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Warning',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  const showEmailNotification = (to: string, subject: string, message: string) => {
    console.log(`📧 Email Notification:
To: ${to}
Subject: ${subject}
Message: ${message}`);
    
    showNotification(`Email sent to ${to}`, 'success');
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showEmailNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};