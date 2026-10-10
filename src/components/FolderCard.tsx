import React, { useState } from 'react';
import { Folder as FolderIcon, MoreVertical, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { Folder } from '../types';

interface FolderCardProps {
  folder: Folder;
  fileCount: number;
  subfolderCount: number;
  onOpen: (folder: Folder) => void;
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  fileCount,
  subfolderCount,
  onOpen,
  onRename,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onClick={() => onOpen(folder)}
      className="group relative bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
          <FolderIcon className="w-5 h-5 text-amber-600 fill-amber-500/20" />
        </div>

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-xs">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpen(folder);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
              >
                <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Open Folder</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onRename(folder);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(folder);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate mb-1">
          {folder.name}
        </h4>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-mono tabular-nums">{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
          {subfolderCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{subfolderCount} subfolders</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
