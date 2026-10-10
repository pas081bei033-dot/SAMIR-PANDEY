import React, { useState, useRef } from 'react';
import { 
  X, 
  HardDrive, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { StorageStats, SubjectId } from '../types';
import { SUBJECT_LIST } from '../data/subjects';
import { formatFileSize, exportAllNotesAsJSON, importNotesFromJSON, seedInitialDataIfNeeded } from '../services/db';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageStats: StorageStats;
  onRefreshData: () => void;
}

export const StorageModal: React.FC<StorageModalProps> = ({
  isOpen,
  onClose,
  storageStats,
  onRefreshData,
}) => {
  if (!isOpen) return null;

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const importFileRef = useRef<HTMLInputElement | null>(null);

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const json = await exportAllNotesAsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OmniNotes_8Subjects_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'Backup successfully exported and downloaded!',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to export backup.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMessage(null);

    try {
      const text = await file.text();
      const result = await importNotesFromJSON(text);
      setStatusMessage({
        type: 'success',
        text: `Restored ${result.filesAdded} note(s) and ${result.foldersAdded} folder(s) successfully!`,
      });
      onRefreshData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to parse and import backup file.',
      });
    } finally {
      setIsImporting(false);
      if (importFileRef.current) importFileRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Storage & Repository Manager</h3>
              <p className="text-xs text-slate-500">
                Local persistent storage breakdown & offline archive backup
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 font-medium block">Total Storage Used</span>
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {formatFileSize(storageStats.totalBytes)}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 font-medium block">Total Note Files</span>
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {storageStats.fileCount}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 font-medium block">Single File Limit</span>
              <span className="text-lg font-bold text-indigo-700 font-mono tabular-nums">
                50.0 MB
              </span>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Storage Footprint by Subject (8)
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2 text-right">Notes Count</th>
                    <th className="px-3 py-2 text-right">Bytes Stored</th>
                    <th className="px-3 py-2 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SUBJECT_LIST.map((sub) => {
                    const bytes = storageStats.bySubject[sub.id]?.bytes || 0;
                    const count = storageStats.bySubject[sub.id]?.count || 0;
                    const share =
                      storageStats.totalBytes > 0
                        ? ((bytes / storageStats.totalBytes) * 100).toFixed(1)
                        : '0.0';

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium text-slate-900">
                          <span className="font-semibold">{sub.shortName}</span>
                          <span className="text-slate-400 text-[11px] ml-1.5 font-normal">
                            ({sub.code})
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-700">
                          {count}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-900 font-medium">
                          {formatFileSize(bytes)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-500">
                          {share}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Backup & Export Actions */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Backup & Archive Portability
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isExporting}
                className="p-3 border border-slate-200 hover:border-indigo-300 rounded-lg bg-white hover:bg-indigo-50/30 text-left transition-all flex items-start gap-3"
              >
                <div className="p-2 bg-indigo-50 rounded text-indigo-600 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Export Full Archive</span>
                  <span className="text-[11px] text-slate-500">
                    Download all 8 subjects notes and folder hierarchy as a JSON archive.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => importFileRef.current?.click()}
                disabled={isImporting}
                className="p-3 border border-slate-200 hover:border-indigo-300 rounded-lg bg-white hover:bg-indigo-50/30 text-left transition-all flex items-start gap-3"
              >
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
                <div className="p-2 bg-indigo-50 rounded text-indigo-600 shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Restore from Backup</span>
                  <span className="text-[11px] text-slate-500">
                    Import notes and folders from a previously exported archive.
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
