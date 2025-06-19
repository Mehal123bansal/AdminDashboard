import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import CVModal from './CVModal';

// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Status badge configuration
const STATUS_CONFIG = {
  New: { color: 'bg-red-100 text-red-700', icon: '🆕' },
  Interviewed: { color: 'bg-blue-100 text-blue-700', icon: '👥' },
  Hired: { color: 'bg-green-100 text-green-700', icon: '✅' },
  Rejected: { color: 'bg-gray-100 text-gray-700', icon: '❌' },
  default: { color: 'bg-gray-100 text-gray-700', icon: '📄' }
};


function CVLastMonth() {
  // State management
  const [selectedMonth, setSelectedMonth] = useState('');
  const [filteredCVs, setFilteredCVs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCV, setSelectedCV] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    interviewed: 0,
    hired: 0
  });
  

  // Get previous month in YYYY-MM format
  const getPreviousMonth = useCallback(() => {
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return `${year}-${(prevMonth + 1).toString().padStart(2, '0')}`;
  }, []);

  // Calculate statistics
  const calculateStats = useCallback((cvs) => {
    return cvs.reduce((acc, cv) => {
      acc.total++;
      acc[cv.status.toLowerCase()] = (acc[cv.status.toLowerCase()] || 0) + 1;
      return acc;
    }, { total: 0, new: 0, interviewed: 0, hired: 0 });
  }, []);

  // Fetch CVs by month
  const fetchCVsByMonth = useCallback(async (month) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE_URL}/cvs?month=${month}`);
      
      if (!Array.isArray(res.data)) {
        throw new Error('Invalid data format received from server');
      }

      const formattedCVs = res.data.map(cv => ({
        ...cv,
        date: cv.date ? new Date(cv.date).toISOString() : null,
        status: cv.status || 'New',
         fullName: `${cv.First_Name || ''} ${cv.Last_Name || ''}`,
        type: cv.type || 'N/A',
        number: cv.Ph_No || 'N/A',
        department: cv.department || 'N/A',
        email: cv.Email || 'N/A',
        skills: cv.skills || 'N/A',
        education: cv.Highest_Education || 'N/A',
        experience: cv.Experience || 'N/A',
        first_name: cv.First_Name || '',
        last_name: cv.Last_Name || '',
        dob: cv.Dob || 'N/A',
        address: cv.Address || 'N/A',
        designation: cv.designation || 'N/A',
        languages: cv.languages || [],
        additionalinfo: cv.additional_info,
        workExperience: cv.companies,
        expected_salary: cv.Expected_Salary || 'N/A',
        image: cv.photo || null
        
      }));

      setFilteredCVs(formattedCVs);
      setStats(calculateStats(formattedCVs));
    } catch (err) {
      console.error('Error fetching CVs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch CVs');
      setFilteredCVs([]);
      setStats({ total: 0, new: 0, interviewed: 0, hired: 0 });
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  // Initial fetch
  useEffect(() => {
    const prev = getPreviousMonth();
    setSelectedMonth(prev);
    fetchCVsByMonth(prev);
  }, [getPreviousMonth, fetchCVsByMonth]);

  // Handle CV deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this CV?")) return;
    
    try {
      setDeleteLoading(true);
      await axios.delete(`${API_BASE_URL}/cvs/${id}`);
      setFilteredCVs(prev => {
        const updated = prev.filter(cv => cv._id !== id);
        setStats(calculateStats(updated));
        return updated;
      });
      alert('CV deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.message || 'Failed to delete CV');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    fetchCVsByMonth(month);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

 // ... (previous imports and configurations remain the same)


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 md:py-8 lg:py-10 px-3 md:px-6 lg:px-8">
      <div className="max-w-[100%] mx-auto">
        {/* Header Section - Responsive */}
          <div className="flex items-center justify-center mb-10">
          <img
            src="/1.png"
            alt="Techchef India Logo"
            className="h-14 w-auto mr-4 drop-shadow-md"
          />
          <h1 className="text-4xl font-bold text-blue-800">
            HORECA  <span className="text-orange-400">ROZGAR</span>
          </h1>
        </div>
        <div className="text-center mb-6 md:mb-8 lg:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1a365d] mb-1 md:mb-2">
            CV Management Dashboard
          </h1>
          <p className="text-base md:text-lg text-[#64748b] max-w-2xl mx-auto">
            Track and manage candidate applications
          </p>
        </div>

        {/* Main Content - Responsive Container */}
        <div className="bg-white rounded-xl md:rounded-2xl lg:rounded-3xl shadow-lg md:shadow-xl lg:shadow-2xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
          {/* Controls Section - Responsive Layout */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Month Selector - Responsive Width */}
            <div className="w-full lg:w-auto lg:min-w-[280px]">
              <label htmlFor="month-select" className="block text-sm md:text-base font-medium text-[#2c3e50] mb-1.5">
                Select Month
              </label>
              <div className="relative">
                <input
                  id="month-select"
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="w-full border border-[#e2e8f0] rounded-lg md:rounded-xl px-4 py-2.5 text-base md:text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent transition-all"
                />
                {/* <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#64748b] text-lg">
                  📅
                </div> */}
              </div>
            </div>

            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full lg:w-auto">
              <div className="bg-[#f8fafc] p-3 md:p-4 rounded-lg md:rounded-xl text-center transform hover:scale-105 transition-transform">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-[#1a365d]">{stats.total}</div>
                <div className="text-xs md:text-sm text-[#64748b] mt-1">Total CVs</div>
              </div>
              <div className="bg-red-50 p-3 md:p-4 rounded-lg md:rounded-xl text-center transform hover:scale-105 transition-transform">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-red-600">{stats.new}</div>
                <div className="text-xs md:text-sm text-red-500 mt-1">New</div>
              </div>
              <div className="bg-blue-50 p-3 md:p-4 rounded-lg md:rounded-xl text-center transform hover:scale-105 transition-transform">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">{stats.interviewed}</div>
                <div className="text-xs md:text-sm text-blue-500 mt-1">Interviewed</div>
              </div>
              <div className="bg-green-50 p-3 md:p-4 rounded-lg md:rounded-xl text-center transform hover:scale-105 transition-transform">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600">{stats.hired}</div>
                <div className="text-xs md:text-sm text-green-500 mt-1">Hired</div>
              </div>
            </div>
          </div>

          {/* Loading State - Responsive */}
          {loading && (
            <div className="flex items-center justify-center py-8 md:py-12">
              <div className="flex items-center space-x-3 text-[#3498db]">
                <svg className="animate-spin h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24">
                  {/* ... (SVG paths remain the same) */}
                </svg>
                <span className="text-sm md:text-base">Loading CVs...</span>
              </div>
            </div>
          )}

          {/* Error Message - Responsive */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl mb-4 md:mb-6 flex items-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* ... (SVG paths remain the same) */}
              </svg>
              <span className="text-sm md:text-base break-words">{error}</span>
            </div>
          )}

          {/* CV Grid - Responsive Layout */}
          {!loading && filteredCVs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredCVs.map((cv) => (
                <div
                  key={cv._id}
                  className="bg-white border border-[#e2e8f0] rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex flex-col h-full">
                    {/* CV Header - Responsive */}
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <div className="flex-1 min-w-0 mr-3">
                        <h3 className="text-base md:text-lg font-semibold text-[#1a365d] mb-1 truncate">
                          {cv.First_Name} {cv.last_name}
                        </h3>
                        <p className="text-xs md:text-sm text-[#64748b]">
                          {formatDate(cv.date)}
                        </p>
                      </div>
                      {cv.image && (
                        <img
                          src={cv.photo}
                          alt={`${cv.name}'s profile`}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-[#3498db] flex-shrink-0"
                        />
                      )}
                    </div>

                    {/* CV Details - Responsive */}
                    <div className="flex-grow">
                      <div className="space-y-2 mb-3 md:mb-4">
                        <p className="text-xs md:text-sm text-[#2c3e50] truncate">
                          <span className="font-medium">Department:</span> {cv.department}
                        </p>
                        <p className="text-xs md:text-sm text-[#2c3e50] truncate">
                          <span className="font-medium">Designation:</span> {cv.designation}
                        </p>
                      </div>

                      {/* Status Badges - Responsive */}
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                        <span className={`text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full font-medium ${STATUS_CONFIG[cv.status]?.color || STATUS_CONFIG.default.color}`}>
                          {STATUS_CONFIG[cv.status]?.icon || STATUS_CONFIG.default.icon} {cv.status}
                        </span>
                        {cv.Address && (
                          <span className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {cv.Address}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - Responsive */}
                    <div className="flex gap-2 mt-auto pt-3 md:pt-4 border-t border-[#e2e8f0]">
                      <button
                        onClick={() => setSelectedCV(cv)}
                        className="flex-1 bg-[#3498db] hover:bg-[#2575fc] text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 md:gap-2"
                        disabled={deleteLoading}
                      >
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {/* ... (SVG paths remain the same) */}
                        </svg>
                        <span className="whitespace-nowrap">View Details</span>
                      </button>
                      <button
                        onClick={() => handleDelete(cv._id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 md:gap-2"
                        disabled={deleteLoading}
                      >
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {/* ... (SVG paths remain the same) */}
                        </svg>
                        <span className="whitespace-nowrap">
                          {deleteLoading ? 'Deleting...' : 'Delete'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-8 md:py-12 bg-[#f8fafc] rounded-lg md:rounded-xl">
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto text-[#cbd5e1] mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {/* ... (SVG paths remain the same) */}
                </svg>
                <p className="text-base md:text-lg font-medium text-[#64748b]">No CVs found for the selected month</p>
                <p className="text-sm text-[#94a3b8] mt-1 md:mt-2">Try selecting a different month</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* CV Details Modal */}
      {selectedCV && (
<CVModal
  cv={selectedCV}  // directly pass full object
  template="combination"
  onClose={() => setSelectedCV(null)}
/>

      )}
    </div>
  );
}

export default CVLastMonth;