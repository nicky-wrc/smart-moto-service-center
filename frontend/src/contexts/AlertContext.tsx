import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertModal } from '../components/AlertModal';

type AlertMessage = { title: string; desc?: string };

interface AlertContextType {
  showAlert: (title: string, desc?: string) => void;
  showError: (err: any, defaultTitle?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const showAlert = (title: string, desc?: string) => {
    setAlert({ title, desc });
  };

  const showError = (err: any, defaultTitle = 'เกิดข้อผิดพลาด') => {
    const msg = err?.response?.data?.message || err?.message || String(err);
    setAlert({ title: defaultTitle, desc: msg });
  };

  return (
    <AlertContext.Provider value={{ showAlert, showError }}>
      {children}
      {alert && (
        <AlertModal
          title={alert.title}
          description={alert.desc}
          onClose={() => setAlert(null)}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
