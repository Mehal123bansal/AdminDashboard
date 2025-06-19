import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!password.trim()) {
      setError(' Password is required.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/login', { password });
      if (res.data.success) {
        localStorage.setItem('currentUser', JSON.stringify({ loggedIn: true }));
        navigate('/dashboard');
      } else {
        setError(' Invalid password.');
      }
    } catch (err) {
      console.error(err);
      setError(' Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-red-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-500 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 border border-blue-200 dark:border-red-400"
        aria-labelledby="login-title"
      >
        <h2
          id="login-title"
          className="text-3xl font-extrabold text-center text-red-600 dark:text-red-400 tracking-wide"
        >
          Admin Login
        </h2>

        {error && (
          <p
            className="text-sm text-center text-red-600 dark:text-red-400 font-medium"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-semibold transition duration-300 ease-in-out shadow-md ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-red-600 hover:from-red-600 hover:to-blue-600'
          }`}
          aria-busy={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
