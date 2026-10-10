import React from 'react';
import { Upload, Plus, HardDrive, BookOpen, Star, FolderTree } from 'lucide-react';
import { formatFileSize } from '../services/db';

interface NavbarProps {
  currentTab: 'subjects' | 'folders' | 'starred' | 'storage';
  onTabChange: (tab: 'subjects' | 'folders' | 'starred' | 'storage') => void;
  onOpenUpload: () => void;
  onOpenQuickNote: () => void;
  totalStorageBytes: number;
  totalFilesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenUpload,
  onOpenQuickNote,
  totalStorageBytes,
  totalFilesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('subjects')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-indigo-700 transition-colors">
                Ω
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 block leading-tight">
                  OmniNotes
                </span>
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap block">
                  8 Engineering Subjects Hub
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => onTabChange('subjects')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'subjects' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subjects</span>
            </button>

            <button
              onClick={() => onTabChange('folders')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'folders' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Folder Explorer</span>
            </button>

            <button
              onClick={() => onTabChange('starred')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'starred' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Starred Notes</span>
            </button>

            <button
              onClick={() => onTabChange('storage')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'storage' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Storage & Backup</span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                ({formatFileSize(totalStorageBytes)})
              </span>
            </button>
          </nav>

          {/* Zone 3: Actions & upload */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenQuickNote}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Create a quick text or markdown note"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick Note</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Notes</span>
              <span className="hidden lg:inline text-[10px] uppercase font-mono px-1.5 py-0.5 bg-indigo-700 rounded text-indigo-100">
                Up to 50 MB
              </span>
            </button>

            <div className="relative pl-1 sm:pl-2 border-l border-slate-200 flex items-center gap-2">
              <img
                src="/src/assets/images/avatar_student_user_1791645883619.jpg"
                alt="Student Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
