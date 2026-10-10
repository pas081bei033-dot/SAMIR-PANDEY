import React from 'react';
import { Star, Download, Eye, Trash2, MoveRight } from 'lucide-react';
import { NoteFile } from '../types';
import { formatFileSize } from '../services/db';
import { SUBJECTS } from '../data/subjects';
import { getCategoryIcon } from './FileCard';

interface FileRowProps {
  file: NoteFile;
  folderName: string;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onPreview: (file: NoteFile) => void;
  onDownload: (file: NoteFile) => void;
  onToggleStar: (file: NoteFile) => void;
  onDelete: (file: NoteFile) => void;
  onMove: (file: NoteFile) => void;
}

export const FileRow: React.FC<FileRowProps> = ({
  file,
  folderName,
  isSelected,
  onSelect,
  onPreview,
  onDownload,
  onToggleStar,
  onDelete,
  onMove,
}) => {
  const subject = SUBJECTS[file.subjectId];
  const formattedDate = new Date(file.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <tr
      className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer group text-xs ${
        isSelected ? 'bg-indigo-50/50' : ''
      }`}
      onClick={() => onPreview(file)}
    >
      {/* Checkbox */}
      <td className="w-10 px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      </td>

      {/* Name and Icon */}
      <td className="px-3 py-3 font-medium text-slate-900 max-w-xs md:max-w-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0">{getCategoryIcon(file.category)}</div>
          <div className="truncate">
            <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate block">
              {file.name}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-mono">{file.extension.toUpperCase()}</span>
              {file.tags && file.tags.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">#{file.tags[0]}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Subject */}
      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
        <span className="font-medium text-slate-800">{subject?.shortName || file.subjectId}</span>
        <span className="block text-[10px] text-slate-400 font-mono">{subject?.code}</span>
      </td>

      {/* Folder */}
      <td className="px-3 py-3 text-slate-500 whitespace-nowrap truncate max-w-[140px]">
        {folderName}
      </td>

      {/* Size (Tabular Numerals) */}
      <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
        {formatFileSize(file.size)}
      </td>

      {/* Date */}
      <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
        {formattedDate}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
          <button
            onClick={() => onToggleStar(file)}
            className="p-1 text-slate-400 hover:text-amber-500 transition-colors rounded"
            title={file.isStarred ? 'Unstar' : 'Star'}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                file.isStarred ? 'text-amber-500 fill-amber-400' : ''
              }`}
            />
          </button>

          <button
            onClick={() => onPreview(file)}
            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors rounded"
            title="Preview Note"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDownload(file)}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onMove(file)}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded"
            title="Move Folder"
          >
            <MoveRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(file)}
            className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
