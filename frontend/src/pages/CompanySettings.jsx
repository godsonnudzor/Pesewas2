import React, { useState } from 'react';
import { Calendar, Lock, Unlock, Plus, CheckCircle, AlertCircle, Building2 } from 'lucide-react';

// Mock initial data matching your PostgreSQL schema structure
const INITIAL_FISCAL_YEARS = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    name: "FY 2025",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    is_closed: true,
    closed_at: "2025-12-31T23:59:59Z",
    closed_by: "d3b07384-d113-4c4e-9c8e-cfbfc50e887a",
    created_at: "2024-12-01T00:00:00Z"
  },
  {
    id: "7bc94f21-1217-4982-b3fc-2c963f66bfb2",
    name: "FY 2026",
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    is_closed: false,
    closed_at: null,
    closed_by: null,
    created_at: "2025-11-15T08:30:00Z"
  }
];

export default function CompanySettings() {
  const [fiscalYears, setFiscalYears] = useState(INITIAL_FISCAL_YEARS);
  
  // Form States
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle Creating a New Fiscal Year (Matches DB Constraints)
  const handleCreateFY = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Backend Constraint Check: CONSTRAINT chk_fy_dates CHECK (end_date > start_date)
    if (new Date(startDate) >= new Date(endDate)) {
      setError('Database Constraint Error: End date must be strictly after the start date.');
      return;
    }

    // Check for Unique Name (VARCHAR(50) UNIQUE)
    if (fiscalYears.some(fy => fy.name.toLowerCase() === name.toLowerCase())) {
      setError('Database Constraint Error: Fiscal Year name must be unique.');
      return;
    }

    const newFY = {
      id: crypto.randomUUID(), // Simulates gen_random_uuid()
      name,
      start_date: startDate,
      end_date: endDate,
      is_closed: false,
      closed_at: null,
      closed_by: null,
      created_at: new Date().toISOString() // Simulates NOW()
    };

    setFiscalYears([newFY, ...fiscalYears]);
    setSuccess(`Successfully created ${name}!`);
    
    // Reset Form
    setName('');
    setStartDate('');
    setEndDate('');
  };

  // Handle Closing a Fiscal Year (Updates is_closed, closed_at, closed_by)
  const handleCloseFY = (id) => {
    setFiscalYears(fiscalYears.map(fy => {
      if (fy.id === id) {
        return {
          ...fy,
          is_closed: true,
          closed_at: new Date().toISOString(),
          closed_by: "d3b07384-d113-4c4e-9c8e-cfbfc50e887a" // Mock current user UUID
        };
      }
      return fy;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-gray-200 pb-5">
          <Building2 className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Company Settings</h1>
            <p className="text-sm text-gray-500">Manage your organization's configurations and database structures.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Create Fiscal Year Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              New Fiscal Year
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-start gap-2 border border-green-100">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                <span>{success}</span>
              </div>
            )}

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
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg shadow transformation transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" /> Add Fiscal Year
              </button>
            </form>
          </div>

          {/* Right Column: Fiscal Years List/Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Fiscal Years Ledger</h2>
              <p className="text-xs text-gray-400 mt-1">Real-time status tracking mapping to database state</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-6">Duration</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {fiscalYears.map((year) => (
                    <tr key={year.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        <div>{year.name}</div>
                        <span className="text-[10px] font-mono text-gray-400 block mt-0.5 truncate max-w-[150px]" title={year.id}>
                          {year.id}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex flex-col text-xs">
                          <span><span className="text-gray-400 font-medium">Start:</span> {year.start_date}</span>
                          <span><span className="text-gray-400 font-medium">End:</span> {year.end_date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {year.is_closed ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                            <Lock className="h-3 w-3" /> Closed
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100">
                            <Unlock className="h-3 w-3" /> Active
                          </div>
                        )}
                        {year.is_closed && (
                          <span className="block text-[10px] text-gray-400 mt-1">
                            By user: {year.closed_by.substring(0,8)}...
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!year.is_closed ? (
                          <button
                            onClick={() => handleCloseFY(year.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-amber-300 text-xs font-medium rounded-md text-amber-700 bg-white hover:bg-amber-50 transition shadow-sm"
                          >
                            Close Period
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No Actions Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}