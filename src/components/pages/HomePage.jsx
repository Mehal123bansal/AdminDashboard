import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function HomePage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('total'); // 'total', 'date', 'status'
  const [filteredCVs, setFilteredCVs] = useState([]);
  const [graphData, setGraphData] = useState([]);

  // ✅ Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/summary');
        if (!res.ok) throw new Error('Failed to fetch summary');
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Error fetching summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // ✅ Fetch CV data for table + graph
  useEffect(() => {
    const fetchCVData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/cvs');
        if (!res.ok) throw new Error('Failed to fetch CV data');
        const data = await res.json();
        setFilteredCVs(data);

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const countsByDate = {};

        data.forEach(cv => {
          const dateObj = new Date(cv.Dob); // Use Dob (Date of Birth) instead of createdAt
          if (dateObj < oneMonthAgo) return;

          const dateKey = dateObj.toISOString().split('T')[0];
          if (!countsByDate[dateKey]) {
            countsByDate[dateKey] = { date: dateKey, New: 0, Interview: 0, Hired: 0 };
          }
          countsByDate[dateKey][cv.status] = (countsByDate[dateKey][cv.status] || 0) + 1;
        });

        const sortedGraphData = Object.values(countsByDate).sort((a, b) =>
          a.date.localeCompare(b.date)
        );
        setGraphData(sortedGraphData);
      } catch (err) {
        console.error('Error fetching CVs:', err.message);
      }
    };
    fetchCVData();
  }, []);

  // ✅ Filter CVs based on active tab
  let displayedCVs = filteredCVs;
  const today = new Date();

  if (filter === 'date') {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    displayedCVs = filteredCVs.filter(cv => {
      const cvDate = new Date(cv.Dob); // Use Dob (Date of Birth) instead of createdAt
      return (
        cvDate.toDateString() === today.toDateString() ||
        (cvDate >= startOfWeek && cvDate <= today)
      );
    });
  } else if (filter === 'status') {
    displayedCVs = filteredCVs.filter(cv => cv.status === 'Interview');
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">🏠 Home Page</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Welcome to the Horeca Admin Panel. Use the sidebar to navigate through CVs, reports, search features, and more.
      </p>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
      ) : error ? (
        <p className="text-red-500">⚠️ {error}</p>
      ) : summary && (
        <>
          {/* ✅ Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              label="Total CVs"
              value={summary.totalCVs}
              filter={filter}
              setFilter={setFilter}
              color="blue"
              type="total"
            />
            <Card
              label="Today's & This Week's CVs"
              value={summary.todayWeekCVs}
              filter={filter}
              setFilter={setFilter}
              color="green"
              type="date"
            />
            <Card
              label="Interview Status"
              value={summary.interview}
              filter={filter}
              setFilter={setFilter}
              color="yellow"
              type="status"
            />
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow text-blue-800 dark:text-white">
              <h3 className="text-sm font-medium">Hired</h3>
              <p className="text-2xl font-bold">{summary.hired}</p>
            </div>
          </div>

          {/* ✅ Bar Chart */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">📈 CVs Received (Last 1 Month)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={graphData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="New" fill="#3b82f6" />
                <Bar dataKey="Interview" fill="#facc15" />
                <Bar dataKey="Hired" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ✅ CV Table */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {filter === 'total' && 'All CVs'}
              {filter === 'date' && "Today's & This Week's CVs"}
              {filter === 'status' && 'CVs with Interview Status'}
            </h2>
            {displayedCVs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No CVs to display.</p>
            ) : (
              <table className="min-w-full bg-white dark:bg-gray-700 rounded shadow overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 uppercase text-sm">
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">Date Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCVs.map(cv => (
                    <tr key={cv.user_id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <td className="py-3 px-6">{cv.First_Name} {cv.Last_Name}</td>
                      <td className="py-3 px-6">{cv.status}</td>
                      <td className="py-3 px-6">{new Date(cv.Dob).toLocaleDateString()}</td> {/* Use Dob (Date of Birth) */}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ✅ Quick Links */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">📌 Quick Links</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
          <li>📄 View submitted CVs</li>
          <li>🔍 Search through CV database</li>
          <li>📊 Check monthly statistics</li>
          <li>📈 Track candidate status</li>
        </ul>
      </div>
    </div>
  );
}

// ✅ Reusable Card Component
const Card = ({ label, value, filter, setFilter, color, type }) => {
  const colorMap = {
    blue: ['bg-blue-100', 'bg-blue-300', 'dark:bg-blue-900', 'dark:bg-blue-700', 'text-blue-800'],
    green: ['bg-green-100', 'bg-green-300', 'dark:bg-green-900', 'dark:bg-green-700', 'text-green-800'],
    yellow: ['bg-yellow-100', 'bg-yellow-300', 'dark:bg-yellow-900', 'dark:bg-yellow-700', 'text-yellow-800'],
  };

  const isActive = filter === type;
  const [bg, activeBg, darkBg, darkActiveBg, text] = colorMap[color];

  return (
    <div
      onClick={() => setFilter(type)}
      className={`cursor-pointer p-4 rounded-lg shadow ${isActive ? `${activeBg} ${darkActiveBg}` : `${bg} ${darkBg}`} ${text} dark:text-white`}
    >
      <h3 className="text-sm font-medium">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default HomePage;
