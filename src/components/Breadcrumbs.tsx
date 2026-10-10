import React from 'react';
import { ChevronRight, Home, Folder as FolderIcon, Plus } from 'lucide-react';
import { SubjectId, Folder } from '../types';
import { SUBJECTS } from '../data/subjects';

interface BreadcrumbsProps {
  selectedSubject: SubjectId | 'all';
  onSelectSubject: (subject: SubjectId | 'all') => void;
  currentFolder: Folder | null;
  folderPath: Folder[];
  onSelectFolder: (folder: Folder | null) => void;
  onCreateFolder: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  selectedSubject,
  onSelectSubject,
  currentFolder,
  folderPath,
  onSelectFolder,
  onCreateFolder,
}) => {
  return (
    <div className="flex items-center justify-between py-2.5 px-4 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-xs mb-4 flex-wrap gap-2">
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        {/* Root */}
        <button
          onClick={() => {
            onSelectSubject('all');
            onSelectFolder(null);
          }}
          className="flex items-center gap-1 hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>Dashboard</span>
        </button>

        {/* Subject level */}
        {selectedSubject !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => onSelectFolder(null)}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                !currentFolder ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              {SUBJECTS[selectedSubject]?.name || selectedSubject}
            </button>
          </>
        )}

        {/* Nested Folder path */}
        {folderPath.map((folder, index) => {
          const isLast = index === folderPath.length - 1;
          return (
            <React.Fragment key={folder.id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => onSelectFolder(folder)}
                className={`flex items-center gap-1 hover:text-slate-900 transition-colors whitespace-nowrap ${
                  isLast ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                <FolderIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
                <span className="truncate max-w-[150px]">{folder.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCreateFolder}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-3 h-3" />
          <span>{currentFolder ? 'New Subfolder' : 'New Folder'}</span>
        </button>
      </div>
    </div>
  );
};
