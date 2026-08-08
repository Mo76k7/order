import React, { useState, useEffect } from 'react';
import MenuApp from './pages/menu';
import KitchenApp from './pages/kitchen';
import AdminApp from './pages/admin';
import WaiterApp from './pages/waiter';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', onLocationChange);

    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  if (currentPath.includes('/kitchen')) {
    return <KitchenApp />;
  }

  if (currentPath.includes('/admin')) {
    return <AdminApp />;
  }

  if (currentPath.includes('/waiter')) {
    return <WaiterApp />;
  }

  // Default to MenuApp
  return <MenuApp />;
}
