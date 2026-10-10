import React from 'react';
import { 
  Zap, 
  Terminal, 
  Atom, 
  Calculator, 
  Binary, 
  MonitorPlay, 
  Cpu, 
  Activity, 
  FolderPlus, 
  Layers, 
  Star, 
  FileText,
  HardDrive
} from 'lucide-react';
import { SubjectId, StorageStats } from '../types';
import { SUBJECT_LIST } from '../data/subjects';
import { formatFileSize } from '../services/db';

interface SidebarProps {
  selectedSubject: SubjectId | 'all';
  onSelectSubject: (subject: SubjectId | 'all') => void;
  selectedFilter: 'all' | 'starred' | 'recent';
  onSelectFilter: (filter: 'all' | 'starred' | 'recent') => void;
  storageStats: StorageStats;
  onCreateFolder: () => void;
  onOpenStorageModal: () => void;
}

const SUBJECT_ICONS: Record<SubjectId, React.ReactNode> = {
  fee: <Zap className="w-4 h-4 text-sky-600" />,
  c: <Terminal className="w-4 h-4 text-teal-600" />,
  physics: <Atom className="w-4 h-4 text-indigo-600" />,
  math1: <Calculator className="w-4 h-4 text-rose-600" />,
  math2: <Binary className="w-4 h-4 text-amber-600" />,
  cg: <MonitorPlay className="w-4 h-4 text-purple-600" />,
  cs: <Cpu className="w-4 h-4 text-emerald-600" />,
  advance_electronics: <Activity className="w-4 h-4 text-orange-600" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  selectedSubject,
  onSelectSubject,
  selectedFilter,
  onSelectFilter,
  storageStats,
  onCreateFolder,
  onOpenStorageModal,
}) => {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none overflow-hidden">
      {/* Top section: Views & Actions */}
      <div className="p-3 border-b border-slate-100 space-y-1">
        <button
          onClick={() => {
            onSelectSubject('all');
            onSelectFilter('all');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
            selectedSubject === 'all' && selectedFilter === 'all'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="truncate">All 8 Subjects</span>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-slate-500 font-normal">
            {storageStats.fileCount}
          </span>
        </button>

        <button
          onClick={() => onSelectFilter('starred')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
            selectedFilter === 'starred'
              ? 'bg-amber-50 text-amber-800'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="truncate">Starred & Key Notes</span>
          </div>
        </button>
      </div>

      {/* 8 Subjects Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Subject Archives (8)
        </span>
        <button
          onClick={onCreateFolder}
          className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded"
          title="Create New Folder"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 8 Subjects List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {SUBJECT_LIST.map((subject) => {
          const isSelected = selectedSubject === subject.id && selectedFilter !== 'starred';
          const fileCount = storageStats.bySubject[subject.id]?.count || 0;
          const bytes = storageStats.bySubject[subject.id]?.bytes || 0;

          return (
            <button
              key={subject.id}
              onClick={() => {
                onSelectSubject(subject.id);
                onSelectFilter('all');
              }}
              className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all group ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs font-medium'
                  : 'text-slate-700 hover:bg-slate-100 font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="shrink-0">{SUBJECT_ICONS[subject.id]}</span>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold truncate">{subject.shortName}</span>
                    <span
                      className={`text-[10px] font-mono tabular-nums ${
                        isSelected ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      {subject.code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-right">
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {fileCount}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Storage Footer / Meter */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5">
          <div className="flex items-center gap-1.5 font-medium">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>Repository Storage</span>
          </div>
          <span className="font-mono tabular-nums text-slate-900 font-semibold text-[11px]">
            {formatFileSize(storageStats.totalBytes)}
          </span>
        </div>

        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
          {/* Visual indicator (relative to 500MB recommended browser target) */}
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(3, (storageStats.totalBytes / (250 * 1024 * 1024)) * 100))}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2.5">
          <span>Upload limit</span>
          <span className="font-mono font-medium text-slate-700 tabular-nums">50 MB / file</span>
        </div>

        <button
          onClick={onOpenStorageModal}
          className="w-full py-1.5 px-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md transition-colors text-center"
        >
          Manage Storage & Backup
        </button>
      </div>
    </aside>
  );
};
