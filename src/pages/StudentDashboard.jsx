import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDate, formatFileUrl, getGreeting, formatTodayDate } from '../utils/helpers';

const ExpandedDetails = ({ app }) => (
  <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-700 animate-fade-in-up">
    <div className="md:col-span-2 text-indigo-800 font-extrabold pb-2 border-b border-slate-200">Full Application Details</div>
    <div><strong className="text-slate-900">Student Name:</strong> {app.studentId?.name || 'N/A'}</div>
    <div><strong className="text-slate-900">Roll Number:</strong> {app.rollNumber}</div>
    <div><strong className="text-slate-900">Course/Branch:</strong> {app.degreeCourse} in {app.branch} {app.currentYear ? `(${app.currentYear}, ${app.yearSession})` : `(${app.yearSession})`}</div>
    <div><strong className="text-slate-900">Latest CPI & Contact:</strong> {app.latestCPI} | Ph: {app.contactNo}</div>
    <div className="md:col-span-2"><strong className="text-slate-900">Internship Type:</strong> {app.internshipType}{app.otherInternshipDescription ? ` (${app.otherInternshipDescription})` : ''}</div>
    {app.sopText && (
      <div className="md:col-span-2">
        <strong className="text-slate-900">Statement of Purpose:</strong>
        <p className="mt-1 text-slate-600 whitespace-pre-wrap">{app.sopText}</p>
      </div>
    )}
    <div className="md:col-span-2"><strong className="text-slate-900">Org Address:</strong> {app.organizationAddress}</div>

    <div className="pt-4 mt-2 border-t border-slate-200">
      <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-xs mb-2">Mentor / H.O.D. / Contact Person Details</h4>
      <p className="font-medium">{app.mentorName} ({app.mentorDesignation})</p>
      <p className="text-slate-500">{app.mentorEmail} | {app.mentorContact}</p>
    </div>
    <div className="pt-4 mt-2 border-t border-slate-200">
      <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-xs mb-2">Addressee Details</h4>
      <p className="font-medium">{app.addresseeName} ({app.addresseeDesignation})</p>
      <p className="text-slate-500">{app.addresseeEmail} | {app.addresseeContact}</p>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [formData, setFormData] = useState({
    departmentId: '', rollNumber: '', degreeCourse: 'B.Tech', branch: '', currentYear: '3rd Year', yearSession: '', latestCPI: '', contactNo: '',
    internshipType: 'Regular Internship (6 weeks duration)', durationFrom: '', durationTo: '',
    companyName: '', organizationAddress: '', mentorName: '', mentorDesignation: '', mentorContact: '', mentorEmail: '',
    addresseeName: '', addresseeDesignation: '', addresseeContact: '', addresseeEmail: '',
    offerLetter: null, statementOfObjective: null, nocFormat: null, marksheet: null, sopText: '', otherInternshipDescription: '', studentMessage: ''
  });
  const [loading, setLoading] = useState(false);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const [fetching, setFetching] = useState(true);

  const stats = {
    total: applications.length,
    approved: applications.filter(app => app.status.includes('APPROVED') || app.status.includes('READY') || app.status === 'COLLECTED').length,
    pending: applications.filter(app => !app.status.includes('APPROVED') && !app.status.includes('READY') && !app.status.includes('REJECTED') && app.status !== 'COLLECTED').length,
    rejected: applications.filter(app => app.status.includes('REJECTED')).length
  };

  useEffect(() => {
    document.title = 'RGIPT NOC — Student Dashboard';
    fetchApplications();
    fetchDepartments();
  }, []);

  const fetchApplications = async () => {
    try {
      setFetching(true);
      const res = await api.get('/student/applications');
      // Backend returns { applications, total, page, pages } — extract the array
      setApplications(res.data.applications ?? res.data);
    } catch (e) {
      console.error('Failed to fetch applications:', e);
    } finally {
      setFetching(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/student/departments');
      setDepartments(res.data);
      if (res.data.length > 0 && !formData.departmentId) {
        setFormData(prev => ({ ...prev, departmentId: res.data[0]._id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.marksheet) {
      toast.error('Please upload the Previous Semester Marksheet');
      return;
    }
    if (!formData.sopText.trim()) {
      toast.error('Please enter your Statement of Purpose');
      return;
    }
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (!['offerLetter', 'statementOfObjective', 'nocFormat', 'marksheet', 'sopText', 'otherInternshipDescription'].includes(key)) {
        data.append(key, formData[key]);
      }
    });
    if (formData.offerLetter) data.append('offerLetter', formData.offerLetter);
    if (formData.statementOfObjective) data.append('statementOfObjective', formData.statementOfObjective);
    if (formData.nocFormat) data.append('nocFormat', formData.nocFormat);
    if (formData.marksheet) data.append('marksheet', formData.marksheet);
    data.append('sopText', formData.sopText);
    data.append('otherInternshipDescription', formData.otherInternshipDescription);

    try {
      await api.post('/student/apply', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Application submitted successfully');
      setFormData({
        departmentId: departments.length > 0 ? departments[0]._id : '',
        rollNumber: '', degreeCourse: 'B.Tech', branch: '', currentYear: '3rd Year', yearSession: '', latestCPI: '', contactNo: '',
        internshipType: 'Regular Internship (6 weeks duration)', durationFrom: '', durationTo: '',
        companyName: '', organizationAddress: '', mentorName: '', mentorDesignation: '',
        mentorContact: '', mentorEmail: '', addresseeName: '', addresseeDesignation: '',
        addresseeContact: '', addresseeEmail: '', offerLetter: null, statementOfObjective: null,
        nocFormat: null, marksheet: null, sopText: '', otherInternshipDescription: '', studentMessage: ''
      });
      fetchApplications();
      setActiveTab('dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error applying for NOC');
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = (app) => {
    setFormData({
      departmentId: app.departmentId?._id || (departments.length > 0 ? departments[0]._id : ''),
      rollNumber: app.rollNumber || '',
      degreeCourse: app.degreeCourse || 'B.Tech',
      branch: app.branch || '',
      currentYear: app.currentYear || '3rd Year',
      yearSession: app.yearSession || '',
      latestCPI: app.latestCPI || '',
      contactNo: app.contactNo || '',
      internshipType: app.internshipType || 'Regular Internship (6 weeks duration)',
      durationFrom: app.durationFrom ? app.durationFrom.substring(0, 10) : '',
      durationTo: app.durationTo ? app.durationTo.substring(0, 10) : '',
      companyName: app.companyName || '',
      organizationAddress: app.organizationAddress || '',
      mentorName: app.mentorName || '',
      mentorDesignation: app.mentorDesignation || '',
      mentorContact: app.mentorContact || '',
      mentorEmail: app.mentorEmail || '',
      addresseeName: app.addresseeName || '',
      addresseeDesignation: app.addresseeDesignation || '',
      addresseeContact: app.addresseeContact || '',
      addresseeEmail: app.addresseeEmail || '',
      offerLetter: null,
      statementOfObjective: null,
      nocFormat: null,
      marksheet: null,
      sopText: '',
      otherInternshipDescription: '',
      studentMessage: ''
    });
    setActiveTab('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status) => {
    if (status.includes('APPROVED') || status.includes('READY')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (status.includes('REJECTED')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (status === 'COLLECTED') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Header with Dynamic Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{getGreeting()}, {user?.name}</h1>
          <p className="text-slate-500 mt-1 font-medium">{formatTodayDate()}</p>
        </div>
      </div>

      {/* iOS-Style Segmented Tabs */}
      <div className="flex justify-start">
        <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-inner">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2.5 text-sm transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-indigo-700 font-bold rounded-lg' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
          >
            My Dashboard & History
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-6 py-2.5 text-sm transition-all duration-200 ${activeTab === 'apply' ? 'bg-white shadow-sm text-indigo-700 font-bold rounded-lg' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
          >
            Apply for New NOC
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="space-y-8">
          {/* Applications List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-200 pb-3">My Applications Pipeline</h2>
            {applications.length === 0 && (
              <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-[2rem] p-12 text-center shadow-sm">
                <svg className="mx-auto h-16 w-16 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No applications found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">You haven't applied for a No Objection Certificate yet. Ready to start your internship journey?</p>
                <button
                  onClick={() => setActiveTab('apply')}
                  className="inline-flex items-center px-8 py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 transform transition-all hover:-translate-y-1 shadow-lg shadow-indigo-100"
                >
                  Start New Application →
                </button>
              </div>
            )}

            {applications.map(app => (
              <div key={app._id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col lg:flex-row justify-between relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex-1 pl-4">
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-1">{app.companyName}</h3>
                  <p className="text-sm font-medium text-indigo-600 mb-4 tracking-wide uppercase">{app.internshipType}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-600">
                    <div><span className="font-bold text-slate-400 mr-2">Duration</span> <span className="text-slate-800 font-medium">{app.durationFrom} to {app.durationTo}</span></div>
                    <div><span className="font-bold text-slate-400 mr-2">Mentor</span> <span className="text-slate-800 font-medium">{app.mentorName} ({app.mentorEmail})</span></div>
                    <div className="md:col-span-2 line-clamp-1"><span className="font-bold text-slate-400 mr-2">Location</span> <span className="text-slate-800 font-medium">{app.organizationAddress}</span></div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => setExpandedAppId(expandedAppId === app._id ? null : app._id)} className="inline-flex items-center text-indigo-600 text-xs font-bold uppercase tracking-widest hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg active:bg-indigo-100">
                      {expandedAppId === app._id ? 'Close Details ▲' : 'View Full Details ▼'}
                    </button>
                    {app.approvedAt && app.status.includes('APPROVED') && (
                      <span className="inline-flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        Approved On: {formatDate(app.approvedAt)}
                      </span>
                    )}
                  </div>

                  {expandedAppId === app._id && <ExpandedDetails app={app} />}

                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-6 text-sm">
                    {app.marksheet && <a href={formatFileUrl(app.marksheet)} target="_blank" rel="noreferrer" className="inline-flex items-center text-rose-600 font-bold hover:text-rose-800 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Marksheet</a>}
                    {app.mandatoryDocument && <a href={formatFileUrl(app.mandatoryDocument)} target="_blank" rel="noreferrer" className="inline-flex items-center text-rose-600 font-bold hover:text-rose-800 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View SOP/Marksheet</a>}
                    {app.offerLetter && <a href={formatFileUrl(app.offerLetter)} target="_blank" rel="noreferrer" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Offer Letter</a>}
                    {app.statementOfObjective && <a href={formatFileUrl(app.statementOfObjective)} target="_blank" rel="noreferrer" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Statement</a>}
                    {app.nocFormat && <a href={formatFileUrl(app.nocFormat)} target="_blank" rel="noreferrer" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View NOC Format</a>}
                  </div>
                </div>

                <div className="mt-8 lg:mt-0 lg:ml-10 flex flex-col justify-center items-end bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full lg:w-80 flex-shrink-0">
                  <span className={`px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest font-extrabold w-full text-center border ${getStatusColor(app.status)}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  {app.remarks && (
                    <div className="mt-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-left w-full relative">
                      <div className="absolute -top-2 left-4 bg-white px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Officer Note</div>
                      "{app.remarks}"
                    </div>
                  )}
                  {app.status.includes('REJECTED') && (
                    <button onClick={() => handleResubmit(app)} className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md flex justify-center items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Edit & Resubmit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Application Form Tab */
        <div id="noc-form-section" className="space-y-10 animate-fade-in-up">
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Requisition Form for NOC</h2>
            <p className="text-slate-500 mt-3 font-bold text-lg max-w-2xl mx-auto">Fill out the detailed application below. Mandatory fields marked with <span className="text-rose-500">*</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1: Academic & Student Details */}
            <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-black text-sm">1</div>
                <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">Academic & Student Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Select Department <span className="text-rose-500">*</span></label>
                  <select name="departmentId" value={formData.departmentId} onChange={handleInputChange} required className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold">
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Roll Number <span className="text-rose-500">*</span></label>
                  <input type="text" name="rollNumber" placeholder="e.g. 21CS101" required className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.rollNumber} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Degree / Course <span className="text-rose-500">*</span></label>
                  <select name="degreeCourse" value={formData.degreeCourse} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold">
                    <option value="B.Tech">B.Tech</option>
                    <option value="MBA">MBA</option>
                    <option value="M.Tech">M.Tech</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Branch <span className="text-rose-500">*</span></label>
                  <input type="text" name="branch" required placeholder="e.g. Computer Science" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.branch} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Current Year <span className="text-rose-500">*</span></label>
                  <select name="currentYear" value={formData.currentYear} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold">
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Year / Session <span className="text-rose-500">*</span></label>
                  <input type="text" name="yearSession" placeholder="e.g. 2023-2024" required className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.yearSession} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Latest CPI <span className="text-rose-500">*</span></label>
                  <input type="number" step="0.01" name="latestCPI" required placeholder="e.g. 8.5" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.latestCPI} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Mobile / Contact No. <span className="text-rose-500">*</span></label>
                  <input type="text" name="contactNo" required placeholder="10-digit number" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.contactNo} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Section 2: Internship Details */}
            <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 font-black text-sm">2</div>
                <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">Internship Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Type of Internship Programme <span className="text-rose-500">*</span></label>
                  <select name="internshipType" value={formData.internshipType} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold">
                    <option value="Embedded Internship (14 weeks duration)">B.Tech - Embedded Internship (14 weeks)</option>
                    <option value="Regular Internship (6 weeks duration)">B.Tech - Regular Internship (6 weeks)</option>
                    <option value="MBA Internship (6-8 weeks duration)">MBA - Summer Internship (6-8 weeks)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {formData.internshipType === 'Other' && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Describe Internship Type <span className="text-slate-400">(Optional)</span></label>
                    <input type="text" name="otherInternshipDescription" placeholder="Briefly describe the internship type" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.otherInternshipDescription} onChange={handleInputChange} />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Duration From <span className="text-rose-500">*</span></label>
                  <input type="date" name="durationFrom" required className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.durationFrom} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Duration To <span className="text-rose-500">*</span></label>
                  <input type="date" name="durationTo" required className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.durationTo} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Section 3: Organization Details */}
            <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-black text-sm">3</div>
                <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">Organization Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Organization Name <span className="text-rose-500">*</span></label>
                  <input type="text" name="companyName" required placeholder="e.g. Google India" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.companyName} onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Organization Address <span className="text-rose-500">*</span></label>
                  <textarea name="organizationAddress" required placeholder="Full physical address of internship location" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold resize-none" rows="3" value={formData.organizationAddress} onChange={handleInputChange}></textarea>
                </div>
              </div>
            </div>

            {/* Section 4 & 5: Contact Person & Addressee Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Person / Mentor Details */}
              <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-sm">4</div>
                  <h3 className="font-black text-base text-slate-800 uppercase tracking-tight">Mentor / H.O.D. / Contact Person Details</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Full Name (Prefix required) <span className="text-rose-500">*</span></label>
                    <input type="text" name="mentorName" required placeholder="e.g. Dr. Jane Smith" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.mentorName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Designation <span className="text-rose-500">*</span></label>
                    <input type="text" name="mentorDesignation" required placeholder="e.g. HR Manager" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.mentorDesignation} onChange={handleInputChange} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Contact No. <span className="text-rose-500">*</span></label>
                      <input type="text" name="mentorContact" required className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.mentorContact} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">E-mail <span className="text-rose-500">*</span></label>
                      <input type="email" name="mentorEmail" required className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.mentorEmail} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Addressee Details */}
              <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-2">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 font-black text-sm">5</div>
                  <h3 className="font-black text-base text-slate-800 uppercase tracking-tight">Addressee Details (Optional)</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Name / Dept Name</label>
                    <input type="text" name="addresseeName" placeholder="e.g. HR Department" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.addresseeName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Designation</label>
                    <input type="text" name="addresseeDesignation" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.addresseeDesignation} onChange={handleInputChange} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Contact No.</label>
                      <input type="text" name="addresseeContact" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.addresseeContact} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">E-mail</label>
                      <input type="email" name="addresseeEmail" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" value={formData.addresseeEmail} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: Attachments */}
            <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-8 space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-2">
                <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 font-black text-sm">6</div>
                <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">Required Attachments</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Previous Semester Marksheet (PDF) <span className="text-rose-500">*</span></label>
                  <input type="file" name="marksheet" accept=".pdf" required className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold" onChange={(e) => setFormData({ ...formData, marksheet: e.target.files[0] })} />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Statement of Purpose <span className="text-rose-500">*</span></label>
                  <textarea name="sopText" required placeholder="Write your Statement of Purpose here..." className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-bold resize-none" rows="5" value={formData.sopText} onChange={handleInputChange}></textarea>
                </div>

                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Offer Letter (Optional)</label>
                  <div className="relative">
                    <input type="file" accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => setFormData({ ...formData, offerLetter: e.target.files[0] })} />
                    <div className={`p-4 border-2 border-dashed rounded-xl text-center transition-all ${formData.offerLetter ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50/20'}`}>
                      <p className="text-xs font-bold text-slate-700 truncate px-2">{formData.offerLetter ? formData.offerLetter.name : 'Upload PDF'}</p>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Required NOC Format (Optional)</label>
                  <div className="relative">
                    <input type="file" accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => setFormData({ ...formData, nocFormat: e.target.files[0] })} />
                    <div className={`p-4 border-2 border-dashed rounded-xl text-center transition-all ${formData.nocFormat ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50/20'}`}>
                      <p className="text-xs font-bold text-slate-700 truncate px-2">{formData.nocFormat ? formData.nocFormat.name : 'Upload PDF'}</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Message for the Approver (Optional)</label>
                  <textarea name="studentMessage" placeholder="e.g., Requesting urgent processing for visa requirements..." className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 block w-full p-3 outline-none font-medium resize-none" rows="3" value={formData.studentMessage} onChange={handleInputChange}></textarea>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-2xl shadow-indigo-100 uppercase tracking-widest text-lg disabled:opacity-50 disabled:hover:translate-y-0">
                {loading ? 'Submitting Application...' : 'Submit NOC Requisition Form →'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
