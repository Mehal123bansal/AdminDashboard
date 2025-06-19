import React, { useEffect, useState } from 'react';
import { FiHome, FiSearch, FiBarChart2, FiClock } from 'react-icons/fi';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import axios from 'axios';
import {Chart as ChartJS,CategoryScale,LinearScale,BarElement,LineElement,PointElement,Tooltip,Legend,} from 'chart.js';

// Import your components
import Topbar from './Topbar';
import CVList from './pages/CVList'; // Assuming CVList is in ./pages/CVList.jsx
import CVLastMonth from './CVLastMonth'; // Assuming CVLastMonth is in the same directory
import SearchCV from './pages/SearchCV'; // Assuming SearchCV is in ./pages/SearchCV.jsx
import Status from './pages/Status'; // Assuming Status is in ./pages/Status.jsx

// Register Chart.js components
ChartJS.register(CategoryScale,LinearScale,BarElement,LineElement,PointElement,Tooltip,Legend);

function Dashboard() {
  // State for fetched data
  const [infoCards, setInfoCards] = useState([]);
  const [monthlyData, setMonthlyData] = useState({ labels: [], datasets: [] });
  const [weeklyData, setWeeklyData] = useState({ labels: [], datasets: [] });

  // State for loading indicators
  const [loading, setLoading] = useState({
    info: true, // Set to true initially to show loading on first render
    monthly: true,
    weekly: true,
  });

  // State for errors
  const [error, setError] = useState(null);

  // Effect hook to fetch data when the component mounts
  useEffect(() => {
    fetchAllDashboardData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to fetch all dashboard data concurrently
  const fetchAllDashboardData = async () => {
    try {
      setError(null); // Clear previous errors
      // Set all loading states to true before fetching
      setLoading({ info: true, monthly: true, weekly: true });

      // Use Promise.all to fetch data from all endpoints concurrently
      const [infoRes, monthlyRes, weeklyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/info-cards'),
        axios.get('http://localhost:5000/api/monthly-cv-count'),
        axios.get('http://localhost:5000/api/weekly-cv-count')
      ]);

      // Update state with fetched data, using default empty values if response data is null/undefined
      setInfoCards(infoRes.data || []);
      setMonthlyData(monthlyRes.data || { labels: [], datasets: [] });
      setWeeklyData(weeklyRes.data || { labels: [], datasets: [] });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Set a user-friendly error message
      setError('Failed to load dashboard data. Please check the server and try again.');
    } finally {
      // Set all loading states to false after fetching is complete (whether successful or not)
      setLoading({ info: false, monthly: false, weekly: false });
    }
  };

  // Chart options (defined outside the return statement as they don't depend on state changes)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#444', // Consider dynamic color based on theme (dark/light)
          font: { size: 14 },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#666', font: { size: 12 } }, // Consider dynamic color
        grid: { color: '#eee' }, // Consider dynamic color
      },
      y: {
        ticks: { color: '#666', font: { size: 12 }, beginAtZero: true }, // Consider dynamic color
        grid: { color: '#eee' }, // Consider dynamic color
      },
    },
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Sidebar */}
<aside className="w-64 min-h-screen bg-white dark:bg-darkbg shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out">
  {/* Logo Section */}
  <div className="flex items-center gap-3 p-4 mb-4 border-b border-gray-100 dark:border-gray-700">
    <img src="/1.png" alt="Horeca Rozgar Logo" className="w-10 h-10 rounded-full shadow-sm" />
    <span className="text-xl font-bold text-primary dark:text-white">Horeca Rozgar</span>
  </div>

  {/* Navigation Links */}
  <nav className="flex flex-col px-4 gap-2 text-sm" aria-label="Main Navigation">
    {[
      { to: '/dashboard/home', icon: <FiHome />, label: 'Home' },
      { to: '/dashboard/last', icon: <FiClock />, label: 'Last Month' },
      { to: '/dashboard/search', icon: <FiSearch />, label: 'CV Search' },
      { to: '/dashboard/reports', icon: <FiBarChart2 />, label: 'Status' },
    ].map(({ to, icon, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out ${
            isActive
              ? 'bg-blue-100 dark:bg-blue-600 text-primary dark:text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-accent'
          }`
        }
        aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
      >
        <span className="text-lg">{icon}</span>
        {label}
      </NavLink>
    ))}
  </nav>
</aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar onSearchResults={(results) => {
  console.log("Received in parent:", results);
  setSearchResults(results); // or update the list
}} />
 {/* Assuming Topbar is correctly implemented */}
        <main className="p-6 flex flex-col gap-8 overflow-y-auto flex-grow"> {/* Added padding and flex-grow */}
          <Routes>
            {/* Redirect from /dashboard to /dashboard/home */}
            <Route path="/" element={<Navigate to="home" replace />} />

            <Route
              path="/home"
              element={
                <>
                  <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Admin Dashboard</h2> {/* Added text color */}

                  {/* Display error message if data fetching failed */}
                  {error && (
                    <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded mb-6" role="alert" aria-live="assertive"> {/* Added padding and dark styles */}
                      {error}
                    </div>
                  )}

                  {/* Info Cards Section */}
                  <section aria-labelledby="info-cards-heading">
                    <h3 id="info-cards-heading" className="sr-only">Summary Information Cards</h3> {/* Accessible heading */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {loading.info ? (
                        <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">Loading info cards...</p> // Centered and spans columns
                      ) : infoCards.length > 0 ? (
                        infoCards.map((card, idx) => (
                          <div
                            key={idx} // Using index as key is acceptable if list order is static and items are not added/removed/reordered
                            className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md flex flex-col items-center transform hover:scale-105 transition border border-gray-200 dark:border-gray-700" // Refined styling
                            role="region"
                            aria-label={`${card.title} Card`}
                          >
                            <div className="text-4xl mb-2 text-blue-600 dark:text-blue-400">{card.icon || '📄'}</div> {/* Use icon from backend if available, default to 📄 */}
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{card.title}</h4>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{card.value}</p>
                          </div>
                        ))
                      ) : (
                        !loading.info && <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">No info card data available.</p> // Show message only if not loading and no data
                      )}
                    </div>
                  </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Monthly Chart Section */}
  <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-[340px]" aria-labelledby="monthly-chart-heading">
    <h3 id="monthly-chart-heading" className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Monthly Data</h3>
    {loading.monthly ? (
      <p className="text-center text-gray-600 dark:text-gray-400">Loading monthly chart...</p>
    ) : monthlyData.labels.length > 0 ? (
      <Bar data={monthlyData} options={chartOptions} />
    ) : (
      !loading.monthly && <p className="text-center text-gray-600 dark:text-gray-400">No monthly data available.</p>
    )}
  </section>

  {/* Weekly Chart Section */}
  <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-[340px]" aria-labelledby="weekly-chart-heading">
    <h3 id="weekly-chart-heading" className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Weekly Data</h3>
    {loading.weekly ? (
      <p className="text-center text-gray-600 dark:text-gray-400">Loading weekly chart...</p>
    ) : weeklyData.labels.length > 0 ? (
      <Line data={weeklyData} options={chartOptions} />
    ) : (
      !loading.weekly && <p className="text-center text-gray-600 dark:text-gray-400">No weekly data available.</p>
    )}
  </section>
</div>

                  {/* CV List Section - This component will fetch and display CVs */}
                   {/* <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" aria-labelledby="cv-list-heading">
                     <h3 id="cv-list-heading" className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">CV List</h3>
                    <CVList /> 
                  </section> */}
                </>
              }
            />

            {/* Routes for other pages */}
            <Route
              path="/last"
              element={
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex-grow"> {/* Added flex-grow */}
                  <CVLastMonth />
                </section>
              }
            />
            <Route
              path="/search"
              element={
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex-grow"> {/* Added flex-grow */}
                  <SearchCV />
                </section>
              }
            />
            <Route
              path="/reports"
              element={
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex-grow"> {/* Added flex-grow */}
                  <Status />
                </section>
              }
            />

             {/* Fallback route for any unmatched paths */}
            <Route path="*" element={<Navigate to="home" replace />} /> {/* Redirects unknown paths to home */}

          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;