// components/Layout.js
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Layout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 to-red-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 transition-colors duration-500">
      {/* 🔹 Sidebar (fixed width) */}
      <Sidebar />

      {/* 🔸 Right Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden border-l border-blue-200 dark:border-red-500 shadow-md">

        {/* 🔼 Topbar */}
        <Topbar />

        {/* 📄 Main Page Content */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 px-4 md:px-6 py-4 transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
