import { useState, useEffect } from 'react';

export const useMobileSidebar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  return {
    isMobile,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar
  };
};
