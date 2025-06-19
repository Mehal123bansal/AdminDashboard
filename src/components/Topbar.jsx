import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiSun, FiMoon, FiLogIn } from 'react-icons/fi';

function Topbar() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('currentUser')));

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const updated = !prev;
      localStorage.setItem('darkMode', String(updated));
      return updated;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleLogin = () => navigate('/login');

  useEffect(() => {
    const syncLoginStatus = () => setIsLoggedIn(Boolean(localStorage.getItem('currentUser')));
    window.addEventListener('storage', syncLoginStatus);
    return () => window.removeEventListener('storage', syncLoginStatus);
  }, []);

  return (
    <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-blue-700 to-orange-500 dark:from-gray-900 dark:to-gray-800 text-white shadow-md px-4 md:px-6 py-3 flex items-center justify-between transition-all duration-500">
      
      {/* 🔷 Logo / Company Name */}
      <div className="flex items-center gap-3">
        <img src="/1.png" alt="Horeca Rozgar Logo" className="w-10 h-10 rounded-full shadow-md" />
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">
          Horeca Rozgar
        </h1>
      </div>

      {/* 🔸 Controls */}
      <nav className="flex items-center gap-4">
        {/* 🌗 Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          title="Toggle Theme"
          className="text-white text-xl hover:text-yellow-300 dark:hover:text-blue-300 transition"
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        {/* 🔐 Auth Button */}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-100 font-medium px-3 py-1.5 rounded-lg shadow transition"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-100 font-medium px-3 py-1.5 rounded-lg shadow transition"
          >
            <FiLogIn />
            <span>Login</span>
          </button>
        )}
      </nav>
    </header>
  );
}

export default Topbar;
