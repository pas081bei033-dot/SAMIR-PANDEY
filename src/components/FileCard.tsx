import React, { useState } from 'react';
import { 
  FileText, 
  FileCode, 
  FileImage, 
  FileArchive, 
  File, 
  Star, 
  Download, 
  MoreVertical, 
  Trash2, 
  Eye, 
  MoveRight,
  ExternalLink
} from 'lucide-react';
import { NoteFile, FileCategory } from '../types';
import { formatFileSize } from '../services/db';
import { SUBJECTS } from '../data/subjects';

interface FileCardProps {
  file: NoteFile;
  onPreview: (file: NoteFile) => void;
  onDownload: (file: NoteFile) => void;
  onToggleStar: (file: NoteFile) => void;
  onDelete: (file: NoteFile) => void;
  onMove: (file: NoteFile) => void;
}

export function getCategoryIcon(category: FileCategory) {
  switch (category) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-rose-600" />;
    case 'code':
      return <FileCode className="w-5 h-5 text-teal-600" />;
    case 'image':
      return <FileImage className="w-5 h-5 text-purple-600" />;
    case 'archive':
      return <FileArchive className="w-5 h-5 text-amber-600" />;
    default:
      return <File className="w-5 h-5 text-blue-600" />;
  }
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onPreview,
  onDownload,
  onToggleStar,
  onDelete,
  onMove,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const subject = SUBJECTS[file.subjectId];

  return (
    <div
      onClick={() => onPreview(file)}
      className="group relative bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between select-none"
    >
      {/* Header zone */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            {getCategoryIcon(file.category)}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              {file.extension.toUpperCase()} · {subject?.shortName || file.subjectId}
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleStar(file)}
            className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors rounded"
            title={file.isStarred ? 'Unstar note' : 'Star note'}
          >
            <Star
              className={`w-4 h-4 ${
                file.isStarred ? 'text-amber-500 fill-amber-400' : ''
              }`}
            />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onPreview(file);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDownload(file);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onMove(file);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                >
                  <MoveRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Move Folder</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(file);
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
      </div>

      {/* Title */}
      <div className="mb-3">
        <h4
          className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug break-words"
          title={file.name}
        >
          {file.name}
        </h4>
        {file.author && (
          <p className="text-xs text-slate-500 mt-1 truncate">
            Lecturer / Author: {file.author}
          </p>
        )}
      </div>

      {/* Footer tags & metadata (Unboxed, typographic discipline) */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate">
          {file.tags && file.tags.length > 0 ? (
            file.tags.slice(0, 2).map((tag, i) => (
              <span key={tag} className="text-[11px] text-slate-500">
                #{tag}
                {i < Math.min(file.tags.length, 2) - 1 ? ' ·' : ''}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-400">Standard Note</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(file);
          }}
          className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
          title="Direct Download"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
