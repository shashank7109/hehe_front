import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';
import { formatDate, formatFileUrl, calculateDuration, calculateStudentYear, formatTodayDate, getGreeting } from '../utils/helpers';

const ExpandedDetails = ({ app }) => (
  <div className="mt-6 p-8 bg-slate-50 border border-slate-200 rounded-2xl space-y-8 animate-fade-in text-left">
    {/* Student & Academic Info */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Information</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-900">{app.studentId?.name}</p>
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{app.currentYear || calculateStudentYear(app.rollNumber)}</span>
          </div>
          <p className="text-xs text-slate-500">{app.studentId?.email}</p>
          <p className="text-xs font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded">Roll: {app.rollNumber}</p>
        </div>
      </div>
      <div className="space-y-4 md:col-span-2">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Academic Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">Course & Branch</p>
            <p className="text-sm font-semibold text-slate-800">{app.degreeCourse} / {app.branch}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">CPI</p>
            <p className="text-sm font-semibold text-slate-800">{app.latestCPI}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Internship Details */}
    <div className="space-y-4">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Internship Overview</h4>
      <div className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-slate-500">Organization</p>
          <p className="text-sm font-bold text-slate-900">{app.companyName}</p>
          <p className="text-xs text-slate-500 mt-1">{app.organizationAddress}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Type & Duration</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-indigo-700">{app.internshipType}{app.otherInternshipDescription ? ` (${app.otherInternshipDescription})` : ''}</p>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest border border-slate-200">{calculateDuration(app.durationFrom, app.durationTo)}</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">{app.durationFrom} to {app.durationTo}</p>
        </div>
      </div>
    </div>

    {/* Student Remarks - Highly Visible */}
    {app.studentMessage && (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Message from Student</h4>
        <p className="text-sm text-blue-900 font-medium italic leading-relaxed">"{app.studentMessage}"</p>
      </div>
    )}

    {/* Attachments */}
    <div className="space-y-4">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Review Documents</h4>
      <div className="flex flex-wrap gap-3">
        {app.marksheet && (
          <a href={formatFileUrl(app.marksheet)} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2.5 bg-white border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Marksheet
          </a>
        )}
        {app.mandatoryDocument && (
          <a href={formatFileUrl(app.mandatoryDocument)} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2.5 bg-white border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            SOP / Marksheet (Legacy)
          </a>
        )}
        {app.offerLetter && (
          <a href={formatFileUrl(app.offerLetter)} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Offer Letter
          </a>
        )}
        {app.statementOfObjective && (
          <a href={formatFileUrl(app.statementOfObjective)} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Statement of Objective
          </a>
        )}
        {app.nocFormat && (
          <a href={formatFileUrl(app.nocFormat)} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            NOC Format
          </a>
        )}
      </div>
    </div>

    {/* Statement of Purpose */}
    {app.sopText && (
      <div className="md:col-span-2">
        <strong className="text-slate-900">Statement of Purpose:</strong>
        <p className="mt-1 text-slate-600 whitespace-pre-wrap">{app.sopText}</p>
      </div>
    )}

    {/* Mentor & Addressee */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Internal Mentor</h4>
        <p className="text-sm font-bold text-slate-800">{app.mentorName}</p>
        <p className="text-xs text-slate-500">{app.mentorDesignation} | {app.mentorEmail} | {app.mentorContact}</p>
      </div>
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Addressee (External)</h4>
        <p className="text-sm font-bold text-slate-800">{app.addresseeName || 'N/A'}</p>
        <p className="text-xs text-slate-500">{app.addresseeDesignation || 'N/A'} | {app.addresseeEmail || 'N/A'} | {app.addresseeContact || '-'}</p>
      </div>
    </div>

    {/* Application Remarks */}
    {app.remarks && (
      <div className="pt-6 border-t border-slate-200">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Approver Remarks</h4>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 font-medium italic">
          "{app.remarks}"
        </div>
      </div>
    )}

    {/* Timeline Audit */}
    <div className="pt-6 border-t border-slate-200">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Application Timeline</h4>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
          <p className="text-xs font-medium text-slate-500">Applied on: <span className="text-slate-900 font-bold">{formatDate(app.appliedAt || app.createdAt)}</span></p>
        </div>
        {app.recommendedAt && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <p className="text-xs font-medium text-slate-500">Recommended on: <span className="text-slate-900 font-bold">{formatDate(app.recommendedAt)}</span></p>
          </div>
        )}
        {app.approvedAt && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <p className="text-xs font-medium text-slate-500">Approved on: <span className="text-slate-900 font-bold">{formatDate(app.approvedAt)}</span></p>
          </div>
        )}
        {app.rejectedAt && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <p className="text-xs font-medium text-slate-500">Rejected on: <span className="text-slate-900 font-bold">{formatDate(app.rejectedAt)}</span></p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const AppCard = ({ app, actionType, remarks, setRemarks, handleAction }) => {
  const [showDetails, setShowDetails] = useState(false);
  const duration = calculateDuration(app.durationFrom, app.durationTo);
  const academicYear = calculateStudentYear(app.rollNumber);

  const getGradient = () => {
    if (actionType === 'REVIEW') return 'bg-gradient-to-b from-amber-400 to-orange-500';
    return 'bg-gradient-to-b from-slate-300 to-slate-400';
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-6 justify-between hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-2 h-full ${getGradient()} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
      <div className="flex-1 pl-4 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              {app.companyName}
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">{app.departmentId?.name}</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{app.currentYear || academicYear}</span>
              <p className="text-xs font-medium text-slate-500">Roll: <span className="text-slate-900 font-bold">{app.rollNumber || 'N/A'}</span></p>
            </div>
          </div>
          {actionType === 'NONE' && (
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${app.status.includes('REJECTED') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                app.status === 'COLLECTED' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                  (app.status === 'READY_FOR_COLLECTION' || app.status.includes('APPROVED')) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                {app.status.replace(/_/g, ' ')}
              </span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {app.status.includes('REJECTED') ? 'Rejected On' : 'Approved On'}: {formatDate(app.approvedAt || app.rejectedAt || app.updatedAt)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
          <p className="text-slate-600">
            <span className="text-slate-400 text-xs uppercase tracking-widest font-black block mb-1">Student</span>
            <span className="text-slate-900 font-bold">{app.studentId?.name}</span>
            <span className="block text-xs text-slate-400 font-medium">{app.studentId?.email}</span>
          </p>
          <p className="text-slate-600">
            <span className="text-slate-400 text-xs uppercase tracking-widest font-black block mb-1">Duration</span>
            <span className="text-slate-900 font-bold">{app.durationFrom} to {app.durationTo}</span>
            <span className="block text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-widest">{duration} Total</span>
          </p>
        </div>

        <button onClick={() => setShowDetails(!showDetails)} className="inline-flex items-center text-indigo-600 text-xs font-bold mt-6 uppercase tracking-widest hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg active:bg-indigo-100">
          {showDetails ? 'Minus Details ▲' : 'Expand Full Details ▼'}
        </button>
        {showDetails && <ExpandedDetails app={app} />}

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-6 text-sm">
          {app.marksheet && <a href={formatFileUrl(app.marksheet)} target="_blank" rel="noreferrer" className="inline-flex items-center font-bold text-rose-600 hover:text-rose-800 transition-colors"><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Marksheet</a>}
          {app.mandatoryDocument && <a href={formatFileUrl(app.mandatoryDocument)} target="_blank" rel="noreferrer" className="inline-flex items-center font-bold text-rose-600 hover:text-rose-800 transition-colors"><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> SOP/Marksheet</a>}
          {app.offerLetter && <a href={formatFileUrl(app.offerLetter)} target="_blank" rel="noreferrer" className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-800 transition-colors"><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Offer Letter</a>}
          {app.statementOfObjective && <a href={formatFileUrl(app.statementOfObjective)} target="_blank" rel="noreferrer" className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-800 transition-colors"><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Statement</a>}
          {app.nocFormat && <a href={formatFileUrl(app.nocFormat)} target="_blank" rel="noreferrer" className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-800 transition-colors"><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> NOC Format</a>}
        </div>
      </div>

      {actionType === 'REVIEW' && (
        <div className="w-full md:w-80 flex flex-col justify-center bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
          <textarea
            placeholder="Include final remarks (optional)..."
            className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none shadow-sm"
            rows="3"
            value={remarks[app._id] || ''}
            onChange={e => setRemarks({ ...remarks, [app._id]: e.target.value })}
          ></textarea>
          <div className="flex gap-3">
            <button onClick={() => handleAction(app._id, 'APPROVE')} className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-emerald-700 hover:-translate-y-0.5 shadow-lg shadow-emerald-100 transition-all uppercase">APPROVE</button>
            <button onClick={() => handleAction(app._id, 'REJECT')} className="flex-1 bg-rose-600 text-white py-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-rose-700 hover:-translate-y-0.5 shadow-lg shadow-rose-100 transition-all uppercase">REJECT</button>
          </div>
        </div>
      )}

    </div>
  );
};

const TNPHeadDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [activeTab, setActiveTab] = useState('review');
  const [fetching, setFetching] = useState(true);

  const [filterSearch, setFilterSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterYear, setFilterYear] = useState('All Years');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    document.title = 'RGIPT NOC — TNP Head Dashboard';
    fetchApplications();
    fetchDepartments();
  }, []);

  const fetchApplications = async () => {
    try {
      setFetching(true);
      const res = await api.get('/officer/applications');
      setApplications(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load applications');
    } finally {
      setFetching(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data);
    } catch (e) { console.error(e); }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/officer/applications/${id}/status`, { action, remarks: remarks[id] || '' });
      const newRemarks = { ...remarks };
      delete newRemarks[id];
      setRemarks(newRemarks);
      toast.success(`Application ${action.toLowerCase()}ed successfully!`);
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const pendingApps = useMemo(() => {
    return applications.filter(a => a.status === 'UNDER_REVIEW_HEAD');
  }, [applications]);

  const outboxApps = useMemo(() => {
    return applications.filter(a => a.status === 'READY_FOR_COLLECTION');
  }, [applications]);

  const pastApps = useMemo(() => {
    return applications.filter(a => {
      // Master Ledger: Include everything that moved past review stages
      return a.status !== 'UNDER_REVIEW_HEAD' && a.status !== 'PENDING' && a.status !== 'UNDER_REVIEW_DEPT';
    });
  }, [applications]);

  const filteredHistoryApps = useMemo(() => {
    const approvedStatuses = ['READY_FOR_COLLECTION', 'COLLECTED'];

    return pastApps.filter(app => {
      // Search Filter
      if (filterSearch) {
        const searchLower = filterSearch.toLowerCase();
        const matchesName = app.studentId?.name?.toLowerCase().includes(searchLower);
        const matchesRoll = app.rollNumber?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesRoll) return false;
      }

      // Department Filter
      if (filterDept !== 'All') {
        const deptId = app.departmentId?._id || app.departmentId;
        if (deptId !== filterDept) return false;
      }

      if (filterStatus !== 'All') {
        if (filterStatus === 'Approved') {
          if (!approvedStatuses.includes(app.status)) return false;
        }
        if (filterStatus === 'Rejected') {
          if (!app.status.includes('REJECTED')) return false;
        }
        if (filterStatus === 'Collected' && app.status !== 'COLLECTED') return false;
      }
      if (filterYear !== 'All Years') {
        if (calculateStudentYear(app.rollNumber) !== filterYear) return false;
      }
      if (filterDate) {
        const appDate = new Date(app.updatedAt).toISOString().split('T')[0];
        if (appDate !== filterDate) return false;
      }
      return true;
    });
  }, [pastApps, filterStatus, filterYear, filterDate, filterSearch, filterDept]);

  const historyStats = useMemo(() => {
    const approvedStatuses = ['READY_FOR_COLLECTION', 'COLLECTED'];
    return {
      total: filteredHistoryApps.length,
      approved: filteredHistoryApps.filter(a => approvedStatuses.includes(a.status)).length,
      rejected: filteredHistoryApps.filter(a => a.status.includes('REJECTED')).length,
      collected: filteredHistoryApps.filter(a => a.status === 'COLLECTED').length
    };
  }, [filteredHistoryApps]);

  const EmptyState = ({ title, message, icon }) => (
    <div className="bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center shadow-sm">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mx-auto font-medium">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 -mx-4 sm:-mx-8 px-4 sm:px-8 pb-12 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {getGreeting()}, Head Officer
            </h1>
            <p className="text-slate-500 mt-1 font-medium">{formatTodayDate()}</p>
          </div>
        </div>

        {/* iOS-Style Segmented Control */}
        <div className="flex justify-start">
          <div className="bg-slate-200/50 p-1.5 rounded-2xl inline-flex shadow-inner">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-8 py-2.5 text-sm transition-all duration-200 rounded-xl flex items-center gap-2 ${activeTab === 'review' ? 'bg-white shadow-md text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
            >
              Inbox
              {pendingApps.length > 0 && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-black">{pendingApps.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('outbox')}
              className={`px-8 py-2.5 text-sm transition-all duration-200 rounded-xl flex items-center gap-2 ${activeTab === 'outbox' ? 'bg-white shadow-md text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
            >
              Outbox
              {outboxApps.length > 0 && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-black">{outboxApps.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-8 py-2.5 text-sm transition-all duration-200 rounded-xl ${activeTab === 'history' ? 'bg-white shadow-md text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
            >
              Archive
            </button>
          </div>
        </div>

        {activeTab === 'review' && (
          <div className="space-y-6">
            {fetching ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : pendingApps.length === 0 ? (
              <EmptyState
                title="All Caught Up!"
                message="No applications are currently waiting for your final review."
                icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
              />
            ) : pendingApps.map(app =>
              <AppCard key={app._id} app={app} actionType="REVIEW" remarks={remarks} setRemarks={setRemarks} handleAction={handleAction} />
            )}
          </div>
        )}

        {activeTab === 'outbox' && (
          <div className="space-y-6">
            {fetching ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : outboxApps.length === 0 ? (
              <EmptyState
                title="Outbox Empty"
                message="No applications are currently waiting for student collection."
                icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1m16 0H4" /></svg>}
              />
            ) : outboxApps.map(app =>
              <AppCard key={app._id} app={app} actionType="NONE" remarks={remarks} setRemarks={setRemarks} handleAction={handleAction} />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-3">
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Found</p>
                  <p className="text-lg font-black text-slate-900">{historyStats.total}</p>
                </div>
                <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Approved</p>
                  <p className="text-lg font-black text-emerald-700">{historyStats.approved}</p>
                </div>
                <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 shadow-sm">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Rejected</p>
                  <p className="text-lg font-black text-rose-700">{historyStats.rejected}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search student or roll..."
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-48 sm:w-64 shadow-sm"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                  />
                </div>

                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Collected">Collected</option>
                </select>

                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                >
                  <option value="All Years">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  />
                  {filterDate && (
                    <button onClick={() => setFilterDate('')} className="text-xs font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest">Clear</button>
                  )}
                </div>
              </div>
            </div>

            {filteredHistoryApps.length === 0 ? (
              <EmptyState
                title="No Records Found"
                message="No applications match your current filter criteria."
                icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              />
            ) : filteredHistoryApps.map(app =>
              <AppCard key={app._id} app={app} actionType="NONE" remarks={remarks} setRemarks={setRemarks} handleAction={handleAction} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TNPHeadDashboard;
