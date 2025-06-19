import { useState, useEffect } from 'react';
import axios from 'axios';

function Status() {
  const [status, setStatus] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [cvList, setCvList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cityData, setCityData] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);

  // 🔹 Fetch status options from DB
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/status-options')
      .then((res) => setStatusOptions(res.data))
      .catch((err) => console.error('❌ Failed to fetch status options:', err));
  }, []);

  // 🔹 Load city JSON data
  useEffect(() => {
    fetch('/Indian_Cities_In_States_JSON.json')
      .then((res) => res.json())
      .then((data) => setCityData(data))
      .catch((err) => console.error('❌ Failed to load city JSON:', err));
  }, []);

  // 🔹 Filter cities based on selected state
  useEffect(() => {
    if (selectedState) {
      const found = cityData.find((item) => item.state === selectedState);
      setFilteredCities(found ? found.city : []);
    } else {
      setFilteredCities([]);
    }
  }, [selectedState, cityData]);

  // 🔹 Fetch CV list based on selected status
  useEffect(() => {
    if (!status) {
      setCvList([]);
      return;
    }

    setLoading(true);
    axios
      .post('http://localhost:5000/api/status1-cvs', { status })
      .then((res) => {
        setCvList(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error fetching CVs:', err);
        setCvList([]);
        setLoading(false);
      });
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-white via-blue-100 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-6 font-sans text-gray-800 dark:text-white">
      <div className="max-w-10xl mx-auto">

        {/* 🔷 Logo Header */}
        <div className="flex items-center justify-center mb-10">
          <img src="/1.png" alt="Logo" className="h-14 w-auto mr-4 drop-shadow-md" />
          <h1 className="text-4xl font-bold text-blue-800">
            HORECA <span className="text-orange-400">ROZGAR</span>
          </h1>
        </div>

        {/* 🔶 Status Filter */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-orange-300 dark:border-blue-600 mb-10">
          <h2 className="text-2xl font-semibold text-orange-600 mb-4">
            📁 Filter CVs by Status
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="text-lg font-medium">Choose Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-orange-400 dark:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              {statusOptions.map((s) => (
                <option key={s.id} value={s.Name}>
                  {s.Name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 📄 Table Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-blue-200 dark:border-orange-700">
          {loading ? (
            <div className="text-center text-lg font-semibold text-blue-600 dark:text-orange-300 py-10 animate-pulse">
              🔄 Loading CVs...
            </div>
          ) : status && cvList.length > 0 ? (
            <div className="overflow-auto rounded-lg">
              <table className="min-w-full text-sm table-auto">
                <thead className="bg-orange-100 dark:bg-blue-800 text-orange-900 dark:text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">State</th>
                    <th className="px-4 py-3 text-left">Expected Salary</th>
                    <th className="px-4 py-3 text-left">Experience</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {cvList.map((cv, index) => (
                    <tr
                      key={cv._id || index}
                      className="hover:bg-orange-100 dark:hover:bg-blue-900 border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{cv.First_Name} {cv.Last_Name}</td>
                      <td className="px-4 py-2">{cv.Ph_No}</td>
                      <td className="px-4 py-2">{cv.department || '—'}</td>
                      <td className="px-4 py-2">{cv.city || '—'}</td>
                      <td className="px-4 py-2">{cv.state || '—'}</td>
                      <td className="px-4 py-2">₹{cv.Expected_Salary || '—'}</td>
                      <td className="px-4 py-2">{cv.Experience || '—'}</td>
                      <td className="px-4 py-2">{cv.date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            status && (
              <div className="text-center text-gray-600 dark:text-gray-400 py-10 text-lg">
                ⚠️ No CVs found for <strong>{status}</strong> status.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Status;
