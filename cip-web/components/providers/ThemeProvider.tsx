"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  // Set mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#F8FAFC');
    }
  }, [theme, mounted]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
