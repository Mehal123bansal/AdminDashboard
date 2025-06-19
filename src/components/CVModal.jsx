import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

// 📌 Work Experience Component
export const CVWorkExperience = ({ userId }) => {
  const [workExperience, setWorkExperience] = useState([]);

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:5000/api/cvs/${userId}/workexperience`)
        .then((res) => setWorkExperience(res.data))
        .catch((err) => console.error("Error fetching work experience:", err));
    }
  }, [userId]);

  return (
    <section>
      <h2 className="text-[#234E95] text-lg font-bold tracking-widest border-b-2 border-[#234E95] mb-2">WORK EXPERIENCE</h2>
      {workExperience.length > 0 ? (
        workExperience.map((exp, idx) => (
          <div key={idx} className="mb-2 text-sm">
            <p><strong>{exp.Company_name}</strong> | {exp.job_positions} | {exp.property_type}</p>
            <p>{exp.Start_Date} to {exp.End_Date} ({exp.Experience})</p>
            <hr className="my-1 border-gray-400" />
          </div>
        ))
      ) : (
        <p>No previous work experience provided.</p>
      )}
    </section>
  );
};

// 📌 Main CV Modal
const CVModal = ({ cv, onClose }) => {
  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('cv-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#87CEEB',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.setFontSize(8);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pdfWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      pdf.save(`${cv.full_name?.replace(/ /g, '_') || 'My_CV'}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to download PDF. Try again.');
    }
  };

  if (!cv) return null;

  const formatList = (data) => Array.isArray(data)
    ? data
    : typeof data === 'string'
      ? data.split(',').map((item) => item.trim())
      : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 h-full flex items-start justify-center p-6 overflow-auto">
      <div className="bg-#87CEEB rounded-xl shadow-2xl w-full max-w-[900px] relative">
        {/* ❌ Close Button */}
        <button onClick={onClose} className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow">
          ×
        </button>
        <div id="cv-content" className="font-sans bg-white">
          {/* ✅ Top Bar */}
          <div className=" items-center justify-center bg-[#234E95] text-white py-10 px-10 rounded-tr-xl">
            <h1 className="items-center justify-center text-4xl font-bold uppercase">
              {cv.full_name || `${cv.First_Name || ''} ${cv.Last_Name || ''}`}
            </h1>
            <p className=" flex text-x  items-center justify-left tracking-wider">
              {cv.designation || 'Computer Science Student'}
            </p>
          </div>

          {/* ✅ Top + Sidebar Layout */}
          {/* <div id="cv-content" className="font-sans bg-white"> */}
<div className="grid md:grid-cols-[300px_1fr] print:grid-cols-1">  {/* 🟣 Sidebar */}
            <div className="bg-white text-black p-4 space-y-6 border-r-4 border-blue-800 relative z-10">
              {/* 👤 Overlapping Profile Image */}
              {cv.photo && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 md:static md:transform-none md:flex md:justify-center mb-3">
                <img
  src={`http://localhost:5000/user_images/${cv.photo}`}
  alt="Profile"
  className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
/>

                </div>
              )}


              {/* 📞 CONTACT */}
              <div>
                <h3 className="text-[#234E95] text-lg font-bold text-m tracking-widest border-b-2 border-blue-800 pb-1 mb-2">CONTACT</h3>
                <p className="text-sm flex items-start gap-2 mb-1"> <strong>Phone No:</strong>{cv.Ph_No}</p>
                <p className="text-sm flex items-start gap-2 mb-1"><strong>Email:</strong> {cv.Email}</p>
                <p className="text-sm flex items-start gap-2 mb-1"><strong>Dob:</strong> {cv.Dob}</p>
                <p className="text-sm flex items-start gap-2 mb-1"><strong>Address:</strong>  {cv.Address}</p>
                <p className="text-sm flex items-start gap-2 mb-1"><strong>Department:</strong> {cv.department}</p>
                <p className="text-sm flex items-start gap-2 mb-1"><strong>Expected-Salary:</strong> ₹{cv.Expected_Salary}</p>
                {/* <p className="text-sm/ flex items-start gap-2 mb-1"><span>🌐</span> www.reallygreatsite.com</p> */}
              </div>

              {/* ✨ Soft Skills */}
              <div>
                <h3 className="text-[#234E95] text-lg font-bold text-m tracking-widest border-b-2 border-blue-800 pb-1 mb-2">SKILLS</h3>
                <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                  {formatList(cv.skills)?.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
              </div>

              {/* 🛠 Tech Skills */}
              <div>
                <h3 className="text-[#234E95] text-lg font-bold text-m tracking-widest border-b-2 border-blue-800 pb-1 mb-2">SUB SKILLS</h3>
                <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                  {formatList(cv.subskills)?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>

              {/* 🌍 LANGUAGES */}
              <div>
                <h3 className="text-[#234E95] text-lg font-bold text-m tracking-widest border-b-2 border-blue-800 pb-1 mb-2">LANGUAGES</h3>
                <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                  {formatList(cv.languages)?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>

            {/* 🟣 Main Section */}
            <div className="bg-[#f8f9fa] p-6 space-y-6">
              <section>
                <h2 className="text-[#234E95] text-lg font-bold tracking-widest border-b-2 border-[#234E95] mb-1">PROFILE</h2>
                <p>{cv.objective || 'Motivated and dedicated individual seeking growth opportunities.'}</p>
              </section>

              <section>
                <h2 className="text-[#234E95] text-lg font-bold tracking-widest border-b-2 border-[#234E95] mb-1">EDUCATION</h2>
                <p><strong>{cv.Highest_Education}</strong> — {cv.Educational_Year}</p>
              </section>

              <CVWorkExperience userId={cv.id} />

              {/* <section>
                <h2 className="text-[#234E95] text-lg font-bold border-b-2 border-[#234E95] mb-1">Skills</h2>
                <ul className="list-disc ml-5 text-sm">
                  {formatList(cv.skills)?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </section> */}

              <section>
                <h2 className="text-[#234E95] text-lg tracking-widest font-bold border-b-2 border-[#234E95] mb-1">CERTIFICATES</h2>
                <ul className="list-disc ml-5 text-sm">
                  {formatList(cv.certificates)?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </section>

              <section>
                <h2 className="text-[#234E95] text-lg font-bold tracking-widest border-b-2 border-[#234E95] mb-1">HOBBIES</h2>
                <ul className="list-disc ml-5 text-sm">
                  {formatList(cv.hobbies)?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </section>

              <section>
                <h2 className="text-[#234E95] text-lg font-bold tracking-widest border-b-2 border-[#234E95] mb-1">EXTRA-CURRICULAR ACTIVITIES</h2>
                <p className="text-sm">{cv.extra_activities || 'N/A'}</p>
              </section>

              <section>
                <h2 className="text-[#234E95] text-lg font-bold tracking-widest border-b-2 border-[#234E95] mb-1">ADDITIONAL INFORMATION</h2>
                <p className="text-sm">{cv.additional_info || 'N/A'}</p>
              </section>

              <section>
                <h2 className="text-[#234E95] text-lg font-bold tracking-widest border-b-2 border-[#234E95] mb-1">DECLARATION</h2>
                <p className="text-sm">I hereby declare that the above information is true to the best of my knowledge.</p>
              </section>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 px-6 py-3 bg-gray-100 print:hidden rounded-b-xl">
          <button onClick={() => window.print()} className="btn btn-primary">🖨 Print</button>
          <button onClick={handleDownloadPDF} className="btn btn-success">⬇ Download PDF</button>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CVModal;
