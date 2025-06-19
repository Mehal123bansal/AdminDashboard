import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user session
    localStorage.removeItem('currentUser');

    // Redirect to login page after 1.5 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-red-100 dark:from-gray-800 dark:to-gray-900 px-4 transition-all duration-500">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 text-center max-w-md w-full space-y-6">
        <div className="flex justify-center">
          <svg
            className="w-12 h-12 text-red-600 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v1m0 14v1m8-8h1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707M17.657 17.657l.707.707"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
          Logging you out...
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You’ll be redirected shortly to the login page.
        </p>
        <div className="flex justify-center pt-4">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce mx-1"></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce mx-1 delay-150"></div>
          <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce mx-1 delay-300"></div>
        </div>
      </div>
    </div>
  );
}

export default Logout;
