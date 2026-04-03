import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  formatDate,
  formatFileUrl,
  calculateDuration,
  calculateStudentYear,
  formatTodayDate,
  getGreeting,
} from '../utils/helpers';

// ─── Status config ────────────────────────────────────────────────────────────
const TABS = [
  { key: 'UNDER_REVIEW_HEAD',    label: 'With TNP Head' },
  { key: 'READY_FOR_COLLECTION', label: 'Ready for Pickup' },
  { key: 'COLLECTED',            label: 'Collected' },
  { key: 'REJECTED_HEAD',        label: 'Rejected' },
];

const STATUS_BADGE = {
  UNDER_REVIEW_HEAD:    'bg-amber-50 text-amber-700 border-amber-100',
  READY_FOR_COLLECTION: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  COLLECTED:            'bg-indigo-50 text-indigo-700 border-indigo-100',
  REJECTED_HEAD:        'bg-rose-50 text-rose-600 border-rose-100',
};

// ─── Expanded details (read-only, mirrors TNPHeadDashboard) ───────────────────
const ExpandedDetails = ({ app }) => (
  <div className="mt-6 p-8 bg-slate-50 border border-slate-200 rounded-2xl space-y-8 animate-fade-in text-left">
    {/* Student & Academic Info */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Information</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-900">{app.studentId?.name}</p>
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {app.currentYear || calculateStudentYear(app.rollNumber)}
            </span>
          </div>
          <p className="text-xs text-slate-500">{app.studentId?.email}</p>
          <p className="text-xs font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded">
            Roll: {app.rollNumber}
          </p>
        </div>
      </div>
      <div className="space-y-4 md:col-span-2">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Academic Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">Course &amp; Branch</p>
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
          <p className="text-xs text-slate-500">Type &amp; Duration</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-indigo-700">
              {app.internshipType}{app.otherInternshipDescription ? ` (${app.otherInternshipDescription})` : ''}
            </p>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest border border-slate-200">
              {calculateDuration(app.durationFrom, app.durationTo)}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">{app.durationFrom} to {app.durationTo}</p>
        </div>
      </div>
    </div>

    {/* Student Message */}
    {app.studentMessage && (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Message from Student</h4>
        <p className="text-sm text-blue-900 font-medium italic leading-relaxed">"{app.studentMessage}"</p>
      </div>
    )}

    {/* Attachments */}
    <div className="space-y-4">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Documents</h4>
      <div className="flex flex-wrap gap-3">
        {app.marksheet && (
          <a href={formatFileUrl(app.marksheet)} target="_blank" rel="noreferrer"
            className="inline-flex items-center px-4 py-2.5 bg-white border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Marksheet
          </a>
        )}
        {app.mandatoryDocument && (
          <a href={formatFileUrl(app.mandatoryDocument)} target="_blank" rel="noreferrer"
            className="inline-flex items-center px-4 py-2.5 bg-white border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            SOP / Marksheet (Legacy)
          </a>
        )}
        {app.offerLetter && (
          <a href={formatFileUrl(app.offerLetter)} target="_blank" rel="noreferrer"
            className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Offer Letter
          </a>
        )}
        {app.statementOfObjective && (
          <a href={formatFileUrl(app.statementOfObjective)} target="_blank" rel="noreferrer"
            className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Statement of Objective
          </a>
        )}
        {app.nocFormat && (
          <a href={formatFileUrl(app.nocFormat)} target="_blank" rel="noreferrer"
            className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            NOC Format
          </a>
        )}
      </div>
    </div>

    {/* Mentor & Addressee */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mentor / H.O.D. / Contact Person</h4>
        <p className="text-sm font-bold text-slate-800">{app.mentorName}</p>
        <p className="text-xs text-slate-500">{app.mentorDesignation} | {app.mentorEmail} | {app.mentorContact}</p>
      </div>
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Addressee (External)</h4>
        <p className="text-sm font-bold text-slate-800">{app.addresseeName || 'N/A'}</p>
        <p className="text-xs text-slate-500">{app.addresseeDesignation || 'N/A'} | {app.addresseeEmail || 'N/A'} | {app.addresseeContact || '-'}</p>
      </div>
    </div>

    {/* Timeline */}
    <div className="pt-6 border-t border-slate-200">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Application Timeline</h4>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
          <p className="text-xs font-medium text-slate-500">Applied on: <span className="text-slate-900 font-bold">{formatDate(app.appliedAt || app.createdAt)}</span></p>
        </div>
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

// ─── Application Card ─────────────────────────────────────────────────────────
const AppCard = ({ app, onMarkCollected }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const duration = calculateDuration(app.durationFrom, app.durationTo);
  const academicYear = app.currentYear || calculateStudentYear(app.rollNumber);
  const isReadyForCollection = app.status === 'READY_FOR_COLLECTION';

  const accentGradient = isReadyForCollection
    ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
    : 'bg-gradient-to-b from-slate-300 to-slate-400';

  const handleCollect = async () => {
    setLoading(true);
    await onMarkCollected(app._id);
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-6 justify-between hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-2 h-full ${accentGradient} opacity-80 group-hover:opacity-100 transition-opacity`}></div>

      <div className="flex-1 pl-4 text-left">
        {/* Card header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              {app.companyName}
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                {app.departmentId?.name}
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{academicYear}</span>
              <p className="text-xs font-medium text-slate-500">Roll: <span className="text-slate-900 font-bold">{app.rollNumber || 'N/A'}</span></p>
            </div>
          </div>

          {/* Status badge */}
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_BADGE[app.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {app.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Core info grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
          <p className="text-slate-600">
            <span className="text-slate-400 text-xs uppercase tracking-widest font-black block mb-1">Student</span>
            <span className="text-slate-900 font-bold">{app.studentId?.name}</span>
            <span className="block text-xs text-slate-400 font-medium">{app.studentId?.email}</span>
          </p>
          <p className="text-slate-600">
            <span className="text-slate-400 text-xs uppercase tracking-widest font-black block mb-1">Duration</span>
            <span className="text-slate-900 font-bold">{app.durationFrom} to {app.durationTo}</span>
            {duration && <span className="block text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-widest">{duration} Total</span>}
          </p>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center text-indigo-600 text-xs font-bold mt-6 uppercase tracking-widest hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg active:bg-indigo-100"
        >
          {showDetails ? 'Minus Details ▲' : 'Expand Full Details ▼'}
        </button>
        {showDetails && <ExpandedDetails app={app} />}

        {/* Document links footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-6 text-sm">
          {app.marksheet && (
            <a href={formatFileUrl(app.marksheet)} target="_blank" rel="noreferrer"
              className="inline-flex items-center font-bold text-rose-600 hover:text-rose-800 transition-colors">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Marksheet
            </a>
          )}
          {app.mandatoryDocument && (
            <a href={formatFileUrl(app.mandatoryDocument)} target="_blank" rel="noreferrer"
              className="inline-flex items-center font-bold text-rose-600 hover:text-rose-800 transition-colors">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              SOP/Marksheet
            </a>
          )}
          {app.offerLetter && (
            <a href={formatFileUrl(app.offerLetter)} target="_blank" rel="noreferrer"
              className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Offer Letter
            </a>
          )}
          {app.statementOfObjective && (
            <a href={formatFileUrl(app.statementOfObjective)} target="_blank" rel="noreferrer"
              className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Statement
            </a>
          )}
          {app.nocFormat && (
            <a href={formatFileUrl(app.nocFormat)} target="_blank" rel="noreferrer"
              className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              NOC Format
            </a>
          )}
        </div>
      </div>

      {/* Mark Collected action — only for READY_FOR_COLLECTION */}
      {isReadyForCollection && (
        <div className="w-full md:w-64 flex flex-col justify-center bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-3 text-center">NOC Ready</p>
          <p className="text-xs text-emerald-600 text-center mb-4 font-medium">
            Student can collect the NOC letter from the office.
          </p>
          <button
            onClick={handleCollect}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-emerald-700 hover:-translate-y-0.5 shadow-lg shadow-emerald-100 transition-all uppercase disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loading ? 'Updating…' : 'Mark Collected'}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ message }) => (
  <div className="bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center shadow-sm">
    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">Nothing here</h3>
    <p className="text-slate-500 max-w-sm mx-auto font-medium">{message}</p>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const TNPOfficeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('READY_FOR_COLLECTION');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    document.title = 'RGIPT NOC — TNP Office Dashboard';
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setFetching(true);
      const res = await api.get('/tnpoffice/applications');
      setApplications(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load applications');
    } finally {
      setFetching(false);
    }
  };

  const handleMarkCollected = async (id) => {
    try {
      await api.put(`/tnpoffice/applications/${id}/status`, { action: 'COLLECTED' });
      toast.success('Marked as collected!');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const tabApps = applications.filter(a => a.status === activeTab);

  const tabCount = (key) => applications.filter(a => a.status === key).length;

  const EMPTY_MESSAGES = {
    UNDER_REVIEW_HEAD:    'No applications are currently with the TNP Head.',
    READY_FOR_COLLECTION: 'No NOC letters are ready for pickup right now.',
    COLLECTED:            'No applications have been collected yet.',
    REJECTED_HEAD:        'No applications have been rejected.',
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -mx-4 sm:-mx-8 px-4 sm:px-8 pb-12 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8 pt-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {getGreeting()}, TNP Office
            </h1>
            <p className="text-slate-500 mt-1 font-medium">{formatTodayDate()}</p>
          </div>
        </div>

        {/* Segmented Tab Control */}
        <div className="flex justify-start overflow-x-auto pb-1">
          <div className="bg-slate-200/50 p-1.5 rounded-2xl inline-flex shadow-inner gap-1 flex-shrink-0">
            {TABS.map(tab => {
              const count = tabCount(tab.key);
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2.5 text-sm transition-all duration-200 rounded-xl flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-white shadow-md text-indigo-700 font-bold'
                      : 'text-slate-500 hover:text-slate-700 font-medium'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-300 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {fetching ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : tabApps.length === 0 ? (
            <EmptyState message={EMPTY_MESSAGES[activeTab]} />
          ) : (
            tabApps.map(app => (
              <AppCard
                key={app._id}
                app={app}
                onMarkCollected={handleMarkCollected}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default TNPOfficeDashboard;
