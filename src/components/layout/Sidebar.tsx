'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarContext.Provider
      value={{
        open,
        toggle: () => setOpen((prev) => !prev),
        close: () => setOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};
