import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SearchCV() {
  const [filters, setFilters] = useState({
    phone: '',
    designation: '',
    type: '',
    salary: '',
    status: '',
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchKeyword, setSearchKeyword] = useState('');

  const handleCommonSearch = async () => {
    if (!searchKeyword.trim()) {
      setError('⚠️ Please enter a keyword to search.');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await axios.post('http://localhost:5000/api/search-similar', {
        keyword: searchKeyword.trim()
      });

      if (Array.isArray(res.data)) {
        setResults(res.data);
        if (res.data.length === 0) {
          setError('🔍 No matching results found.');
        }
      } else {
        throw new Error('Unexpected server response');
      }
    } catch (err) {
      setError(`❌ Error: ${err.response?.data?.error || err.message || 'Server error during common search'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/update-status/${userId}`, {
        status: newStatus,
      });

      if (res.data.success) {
        setResults((prev) =>
          prev.map((cv) =>
            cv._id === userId ? { ...cv, status: newStatus } : cv
          )
        );
      } else {
        alert('❌ Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('⚠️ Something went wrong while updating status.');
    }
  };

  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/status-options');
        if (Array.isArray(res.data)) {
          setStatusOptions(res.data);
        }
      } catch (err) {
        console.error('Error fetching status options:', err);
      }
    };

    fetchStatusOptions();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    // This logic ensures only one filter input has a value at a time
    const newFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = key === name ? value : '';
      return acc;
    }, {});
    setFilters(newFilters);
  };

  const handleSearch = async () => {
    setError('');
    setLoading(true);
    setResults([]);

    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v.trim() !== '')
    );

    if (Object.keys(activeFilters).length !== 1) {
      setError('⚠️ Please fill only one field at a time to search.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/search-cvs', activeFilters);
      if (Array.isArray(res.data)) {
        setResults(res.data);
        if (res.data.length === 0) {
          setError('🔍 No matching CVs found.');
        }
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Server error during single search';
      setError(` Search failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters({ phone: '', designation: '', type: '', salary: '', status: '' });
    setResults([]);
    setError('');
    setSearchKeyword(''); // Clear common search keyword as well
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="bg-white rounded-4 shadow p-5">

        {/* 🔷 Logo and Title */}
        <div className="d-flex flex-column align-items-center mb-5">
          <div className="d-flex align-items-center justify-content-center mb-4">
            <img
              src="/1.png"
              alt="Techchef India Logo"
              style={{ height: '60px', width: 'auto', marginRight: '1rem', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))' }}
            />
            <h1 className="h2 fw-bold m-0" style={{ color: '#1E3A8A' }}>
              HORECA <span style={{ color: '#F97316' }}>ROZGAR</span>
            </h1>
          </div>

          {/* 🔍 Search Bar & Button */}
          <div className="row w-100 justify-content-center align-items-center mt-3">
            {/* Search Input */}
            <div className="col-md-7 col-sm-12 mb-3 mb-md-0">
              <input
                type="text"
                className="form-control form-control-lg border-2 border-primary rounded-pill px-4 shadow-sm"
                placeholder="🔍 Search by name, phone, city, state, status, department,designation etc."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  fontSize: '1.1rem',
                  backgroundColor: '#f0f8ff',
                  color: '#0f172a'
                }}
              />
            </div>

            {/* Search Button */}
            <div className="col-md-2 col-sm-6">
              <button
                className="btn btn-lg w-80 shadow-sm rounded-pill"
                onClick={handleCommonSearch}
                disabled={loading}
                style={{
                  backgroundColor: '#F98210',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.4rem'
                }}
              >
                {loading ? '🔄 Searching...' : '🔍 Search'}
              </button>
            </div>
          </div>
          <h2 className="display-5 fw-bold mt-3">
            <span className="text-danger">Search</span> <span className="text-primary">CV</span>
          </h2>
        </div>

        <div className="row g-3 mb-4">
          {[
            { key: 'phone', label: 'Phone' },
            { key: 'designation', label: 'Designation' },
            { key: 'type', label: 'Department' },
            { key: 'salary', label: 'Expected Salary' },
            { key: 'status', label: 'Status' },
          ].map(({ key, label }) => (
            <div className="col-md-4" key={key}>
              <input
                name={key}
                value={filters[key]}
                onChange={handleChange}
                type={key === 'salary' ? 'number' : 'text'}
                className="form-control form-control-lg border-primary"
                placeholder={`Enter ${label}`}
                autoComplete="on"
              />
            </div>
          ))}
        </div>

        {error && <div className="alert alert-warning text-center">{error}</div>}

        <div className="text-center mb-4">
          <button className="btn btn-primary btn-lg me-3 px-5" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button className="btn btn-outline-secondary btn-lg px-5" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        </div>

        {results.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-danger text-center">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Expected Salary</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((cv, index) => (
                  <tr key={cv._id || index} className="text-center">
                    <td>{index + 1}</td>
                    <td>{cv.full_name || `${cv.First_Name || ''} ${cv.Last_Name || ''}`}</td>
                    <td>{cv.Ph_No || 'N/A'}</td>
                    <td>{cv.department || 'N/A'}</td>
                    <td>{cv.designation || 'N/A'}</td>
                    <td>{cv.city || 'N/A'}</td>
                    <td>{cv.state || 'N/A'}</td>
                    <td>₹{cv.Expected_Salary || 'N/A'}</td>
                    <td>
                      <span className={`badge bg-${cv.status === 'Hired' ? 'success' : cv.status === 'Interview' ? 'primary' : 'secondary'}`}>
                        {cv.status || 'N/A'} {/* Corrected: display cv.status */}
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button
                          className="btn btn-outline-success btn-sm dropdown-toggle w-100"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Update
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          {statusOptions.map((status) => (
                            <li key={status.id}>
                              <button
                                className={`dropdown-item ${cv.status === status.Name ? 'active' : ''}`}
                                onClick={() => handleStatusChange(cv._id, status.Name)}
                              >
                                {status.Name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <p className="text-muted text-center mt-4">Please enter one field to search a CV.</p>
        )}
      </div>
    </div>
  );
}

export default SearchCV;