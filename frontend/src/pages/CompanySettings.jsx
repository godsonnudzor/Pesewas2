import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Calendar, Lock, Unlock, Plus, CheckCircle, AlertCircle, Building2, Loader2 } from 'lucide-react';

export default function CompanySettings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Application Data States
  const [fiscalYears, setFiscalYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interactive Form States
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Dynamic User Feedback States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Lifecycle Hook: Fetch Records from Database on Mount
  useEffect(() => {
    async function fetchFiscalYears() {
      try {
        setError('');
        const response = await fetch('/api/fiscal-years');
        if (!response.ok) throw new Error('Failed to retrieve ledger data from server.');
        const data = await response.json();
        setFiscalYears(data);
      } catch (err) {
        setError(`Connection Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFiscalYears();
  }, []);

  // 2. Event Handler: Validate and Write New Period to Postgres
  const handleCreateFY = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Pre-flight Guard Rule: Matches PostgreSQL "CONSTRAINT chk_fy_dates"
    if (new Date(startDate) >= new Date(endDate)) {
      setError('Database Constraint Guard: End date must be strictly after the start date.');
      return;
    }

    try {
      const response = await fetch('/api/fiscal-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, start_date: startDate, end_date: endDate }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Catches database UNIQUE or custom constraint exceptions surfaced by the API layer
        throw new Error(result.message || 'Failed to register the new fiscal period.');
      }

      // Prepend the saved record returned by Postgres (containing real generated UUID and timestamps)
      setFiscalYears([result, ...fiscalYears]);
      setSuccess(`Period "${result.name}" has been successfully instantiated.`);
      
      // Clear inputs
      setName('');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setError(err.message);
    }
  };

  // 3. Event Handler: Close Period (Mutates is_closed, closed_at, closed_by)
  const handleCloseFY = async (id) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/fiscal-years/${id}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      const updatedYear = await response.json();

      if (!response.ok) throw new Error(updatedYear.message || 'Could not close the selected fiscal year.');

      // Update local array element with the finalized state returned from the DB
      setFiscalYears(fiscalYears.map(fy => fy.id === id ? updatedYear : fy));
      setSuccess(`Fiscal period status locked successfully.`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Network Latency / Initial Boot Screen View
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-indigo-600 font-medium">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm tracking-wide">Syncing with Core Database Layer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Module Header View */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start space-y-3 sm:space-y-0 space-x-0 sm:space-x-3 border-b border-gray-200 pb-5">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Company Settings</h1>
              <p className="text-sm text-gray-500">Manage your organization's configurations and active ledger structures.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-sm text-gray-500">
                Signed in as <span className="font-semibold text-gray-900">{user.email}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Global Action Notifications */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100 shadow-sm animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-start gap-2 border border-green-100 shadow-sm animate-fade-in">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Side panel */}
          <div className="bg-cadetblue p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              New Fiscal Year
            </h2>

            <form onSubmit={handleCreateFY} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  FY Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder='e.g. "FY 2026"'
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg shadow transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" /> Add Fiscal Year
              </button>
            </form>
          </div>

          {/* Records Ledger Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Fiscal Years Ledger</h2>
              <p className="text-xs text-gray-400 mt-1">Real-time mapping of persistent operational periods</p>
            </div>

            <div className="overflow-x-auto">
              {fiscalYears.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-400 italic">
                  No historical periods registered in the database. Use the generation tool panel to add rows.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                      <th className="py-3 px-6">Name Reference</th>
                      <th className="py-3 px-6">Boundaries</th>
                      <th className="py-3 px-6">Access State</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {fiscalYears.map((year) => (
                      <tr key={year.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6 font-medium text-gray-900">
                          <div className="tracking-wide">{year.name}</div>
                          <span className="text-[10px] font-mono text-gray-400 block mt-0.5 truncate max-w-[150px]" title={`Primary Key UUID: ${year.id}`}>
                            {year.id}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <div className="flex flex-col gap-0.5 text-xs">
                            <span><span className="text-gray-400 font-medium">Start:</span> {year.start_date}</span>
                            <span><span className="text-gray-400 font-medium">End:</span> {year.end_date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {year.is_closed ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                              <Lock className="h-3 w-3" /> Locked / Closed
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100">
                              <Unlock className="h-3 w-3" /> Active Period
                            </div>
                          )}
                          {year.is_closed && year.closed_by && (
                            <span className="block text-[10px] text-gray-400 mt-1 font-mono">
                              By User: {year.closed_by.substring(0, 8)}...
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {!year.is_closed ? (
                            <button
                              onClick={() => handleCloseFY(year.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 border border-amber-300 text-xs font-medium rounded-md text-amber-700 bg-white hover:bg-amber-50 transition shadow-sm active:scale-95"
                            >
                              Close Period
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic bg-gray-50 py-1 px-2 rounded-md">Persistent Archive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}