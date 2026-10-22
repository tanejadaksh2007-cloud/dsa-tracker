import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ToastContainer from './ToastContainer';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div id="app">
      <Sidebar isOpen={sidebarOpen} onNavigate={closeSidebar} />

      <button
        type="button"
        className="hamburger"
        aria-label="Menu"
        onClick={() => setSidebarOpen((open) => !open)}
      >
        <span /><span /><span />
      </button>

      <main id="main">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
