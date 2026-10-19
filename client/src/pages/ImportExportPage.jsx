import React, { useState } from 'react';
import {
  Download,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const ImportExportPage = () => {
  const { success, error: toastError } = useToast();

  const [file, setFile] = useState(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState('skip');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  // Handle Download CSV Template
  const handleDownloadTemplate = () => {
    const url = `${api.defaults.baseURL}/csv/template`;
    window.open(url, '_blank');
  };

  // Handle Export Current User Contacts
  const handleExportContacts = async () => {
    try {
      setIsExporting(true);
      const response = await api.get('/csv/export', {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      success('Contacts exported successfully!');
    } catch (err) {
      toastError(err.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle File Input Change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        toastError('Please choose a valid .csv file');
        return;
      }
      setFile(selectedFile);
      setImportSummary(null);
    }
  };

  // Handle Import Submit
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toastError('Please select a CSV file to upload');
      return;
    }

    try {
      setIsImporting(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('duplicateStrategy', duplicateStrategy);

      const res = await api.post('/csv/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setImportSummary(res.data.summary);
        success(res.data.message);
        setFile(null);
      }
    } catch (err) {
      toastError(err.message || 'CSV Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <Download className="w-6 h-6 text-indigo-600" />
          Import & Export Contacts
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Backup, migrate, or bulk import your contacts safely using CSV spreadsheets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Export Contacts</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Download all your saved contacts as a standard UTF-8 CSV file. Exported values are sanitized to protect against formula injection.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1 mb-6">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Private & Secure Export</span>
              </div>
              <p className="text-slate-500">
                Exports only contacts belonging to your account.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportContacts}
            disabled={isExporting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isExporting ? 'Exporting...' : 'Download Contacts (.CSV)'}
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Template Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Sample CSV Template</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Need to prepare a spreadsheet before uploading? Download our verified template containing all supported column headers and sample data.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 mb-6">
              <p className="font-semibold text-slate-700 mb-1">Supported Columns:</p>
              <p className="text-slate-500 leading-relaxed">
                firstName (required), lastName, email, phone, company, jobTitle, address, category, notes, isFavorite
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            Download Sample Template
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Import Contacts from CSV</h3>
            <p className="text-xs text-slate-500">
              Bulk upload multiple contacts into your account with automatic validation
            </p>
          </div>
        </div>

        <form onSubmit={handleImportSubmit} className="space-y-6">
          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select CSV File
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  {file ? file.name : 'Click to select CSV file'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : 'Supports .csv files up to 5MB'}
                </p>
              </label>
            </div>
          </div>

          {/* Duplicate handling strategy */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Duplicate Detection Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  duplicateStrategy === 'skip'
                    ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="duplicateStrategy"
                  value="skip"
                  checked={duplicateStrategy === 'skip'}
                  onChange={() => setDuplicateStrategy('skip')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Skip Existing</p>
                  <p className="text-[11px] text-slate-500">
                    If email or phone matches an existing contact, leave it unchanged.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  duplicateStrategy === 'update'
                    ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="duplicateStrategy"
                  value="update"
                  checked={duplicateStrategy === 'update'}
                  onChange={() => setDuplicateStrategy('update')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Update Existing</p>
                  <p className="text-[11px] text-slate-500">
                    Overwrite existing matching contact with new imported fields.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || isImporting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Importing Contacts...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload and Import
                </>
              )}
            </button>
          </div>
        </form>

        {/* Import Summary Results */}
        {importSummary && (
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 animate-fade-in">
            <h4 className="font-bold text-slate-800 text-sm">Import Results Summary</h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-xs text-slate-500 block">Total Processed</span>
                <span className="text-lg font-bold text-slate-800">
                  {importSummary.totalRows}
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <span className="text-xs text-emerald-600 block">Imported</span>
                <span className="text-lg font-bold text-emerald-700">
                  {importSummary.imported}
                </span>
              </div>
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-center">
                <span className="text-xs text-amber-600 block">Skipped / Updated</span>
                <span className="text-lg font-bold text-amber-700">
                  {importSummary.skipped + importSummary.updated}
                </span>
              </div>
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100 text-center">
                <span className="text-xs text-rose-600 block">Failed</span>
                <span className="text-lg font-bold text-rose-700">
                  {importSummary.failed}
                </span>
              </div>
            </div>

            {/* Detailed Row Reports */}
            {importSummary.details && importSummary.details.length > 0 && (
              <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Name / Email</th>
                      <th className="p-2.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importSummary.details.map((d, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium text-slate-600">#{d.row}</td>
                        <td className="p-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.status === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.status === 'UPDATED'
                                ? 'bg-blue-100 text-blue-800'
                                : d.status === 'SKIPPED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-800 font-medium">
                          {d.name || d.email}
                        </td>
                        <td className="p-2.5 text-slate-500">{d.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportExportPage;
