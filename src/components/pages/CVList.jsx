import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function CVList() {
  const [cvList, setCvList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [selectedCV, setSelectedCV] = useState(null);
  const modalRef = useRef(null);
  const buttonsRef = useRef(null);

  const statusMap = {
    1: "New",
    2: "Interview",
    3: "Hired"
  };

  const statusReverseMap = {
    "New": 1,
    "Interview": 2,
    "Hired": 3
  };

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/cvs');
        const formatted = res.data.map(cv => ({
          ...cv,
          Status_id: cv.Status_id || 1,
          StatusName: statusMap[cv.Status_id] || "New",
          date: cv.date?.slice(0, 10) || "N/A"
        }));
        setCvList(formatted);
        setFilteredList(formatted);
      } catch (err) {
        console.error("❌ Failed to fetch CVs:", err);
      }
    };
    fetchCVs();
  }, []);

  useEffect(() => {
    let filtered = [...cvList];
    if (searchDate) filtered = filtered.filter(cv => cv.date?.startsWith(searchDate));
    if (searchStatus) filtered = filtered.filter(cv => cv.StatusName?.toLowerCase() === searchStatus.toLowerCase());
    setFilteredList(filtered);
  }, [searchDate, searchStatus, cvList]);

const handleStatusChange = async (user_id, newStatus) => {
  try {
    const res = await axios.put(`http://localhost:5000/api/update-status/${user_id}`, {
      status: newStatus,
    });

    if (res.data.success) {
      setResults((prev) =>
        prev.map((cv) =>
          cv._id === user_id ? { ...cv, status: newStatus } : cv
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



  const handleDelete = async (user_id) => {
    if (!window.confirm("Are you sure you want to delete this CV?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/cvs/${user_id}`);
      setCvList(prev => prev.filter(cv => cv.user_id !== user_id));
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Delete failed.");
    }
  };

  const handleView = (cv) => {
    setSelectedCV(cv);
  };

  const handleDownloadFromTable = async (cv) => {
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.background = '#fff';
    container.innerHTML = `
      <h2 style="text-align:center;">${cv.First_Name} ${cv.Last_Name || ''}</h2>
      <p><strong>Email:</strong> ${cv.Email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${cv.Ph_No}</p>
      <p><strong>Department:</strong> ${cv.department}</p>
      <p><strong>Date:</strong> ${cv.date}</p>
      <p><strong>Status:</strong> ${cv.status}</p>
      <p><strong>Skills:</strong> ${cv.skills || 'N/A'}</p>
      <p><strong>Education:</strong> ${cv.Highest_Education || 'N/A'}</p>
      <p><strong>Experience:</strong> ${cv.Experience || 'N/A'}</p>
      <p><strong>Photo:</strong> ${cv.Photo ? `<img src="${cv.Photo}" width="100"/>` : 'N/A'}</p>
    `;
    document.body.appendChild(container);
    const canvas = await html2canvas(container);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${cv.First_Name}_CV.pdf`);
    document.body.removeChild(container);
  };

  const handleDownloadInModal = async () => {
    if (!modalRef.current) return;
    if (buttonsRef.current) buttonsRef.current.style.display = 'none';
    const canvas = await html2canvas(modalRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${selectedCV.First_Name}_CV.pdf`);
    if (buttonsRef.current) buttonsRef.current.style.display = 'flex';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setSelectedCV(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="border p-1" />
        <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} className="border p-1">
          <option value="">All</option>
          <option value="New">New</option>
          <option value="Interview">Interview</option>
          <option value="Hired">Hired</option>
        </select>
      </div>

      <table className="table-auto w-full border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Date</th>
            <th>Status</th>

            <th>Experience </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.map(cv => (
            <tr key={cv.user_id} className="text-center border-t">
              <td>{cv.First_Name} {cv.Last_Name || ''}</td>
              <td>{cv.Ph_No}</td>
              <td>{cv.department}</td>
              <td>{cv.date}</td>
              <td>
                <select value={cv.status} onChange={(e) => handleStatusChange(cv.user_id, e.target.value)}>
                  <option value="New">New</option>
                  <option value="Interview">Interview</option>
                  <option value="Hired">Hired</option>
                </select>
              </td>
              {/* <td>{cv.Photo ? <img src={cv.Photo} alt="Profile" width="50" /> : 'N/A'}</td> */}
              <td>{cv.Experience || '*****' }</td>
              <td className="flex flex-wrap justify-center gap-1">
                <button onClick={() => handleView(cv)} className="bg-blue-500 text-white px-2 py-1 rounded">View</button>
                <button onClick={() => handleDownloadFromTable(cv)} className="bg-green-600 text-white px-2 py-1 rounded">Download</button>
                <button onClick={() => handleDelete(cv.user_id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCV && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-2xl p-6 rounded shadow-lg relative" ref={modalRef}>
            <h2 className="text-2xl font-bold text-center mb-4">{selectedCV.First_Name} {selectedCV.Last_Name || ''}</h2>
            <p><strong>Email:</strong> {selectedCV.Email || 'N/A'}</p>
            <p><strong>Phone:</strong> {selectedCV.Ph_No}</p>
            <p><strong>Department:</strong> {selectedCV.Department}</p>
            <p><strong>Date:</strong> {selectedCV.date}</p>
            <p><strong>Status:</strong> {selectedCV.StatusName}</p>
            <p><strong>Skills:</strong> {selectedCV.skills || 'N/A'}</p>
            <p><strong>Education:</strong> {selectedCV.Highest_Education || 'N/A'}</p>
            <p><strong>Experience:</strong> {selectedCV.Experience || 'N/A'}</p>
            {/* <p><strong>Photo:</strong> {selectedCV.Photo ? <img src={selectedCV.Photo} alt="Profile" width="100" /> : 'N/A'}</p> */}
            <div className="flex justify-end gap-4 mt-6" ref={buttonsRef}>
              <button onClick={handleDownloadInModal} className="bg-green-600 text-white px-4 py-2 rounded">Download PDF</button>
              <button onClick={() => setSelectedCV(null)} className="bg-gray-700 text-white px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CVList;
