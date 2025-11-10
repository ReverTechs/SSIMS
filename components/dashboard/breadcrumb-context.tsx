"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BreadcrumbContextType {
  dynamicBreadcrumbName: string | null;
  setDynamicBreadcrumbName: (name: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [dynamicBreadcrumbName, setDynamicBreadcrumbName] = useState<string | null>(null);

  return (
    <BreadcrumbContext.Provider value={{ dynamicBreadcrumbName, setDynamicBreadcrumbName }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    // Return a default context if not within provider (for graceful degradation)
    return {
      dynamicBreadcrumbName: null,
      setDynamicBreadcrumbName: () => {},
    };
  }
  return context;
}

