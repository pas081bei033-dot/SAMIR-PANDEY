import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Star, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Folder as FolderIcon,
  Tag,
  User,
  Calendar,
  FileText,
  MoveRight
} from 'lucide-react';
import { NoteFile, Folder, SubjectId } from '../types';
import { formatFileSize } from '../services/db';
import { SUBJECTS } from '../data/subjects';

interface FileViewerModalProps {
  file: NoteFile | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: NoteFile) => void;
  onToggleStar: (file: NoteFile) => void;
  onDelete: (file: NoteFile) => void;
  onMove: (file: NoteFile) => void;
  folders: Folder[];
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
  onToggleStar,
  onDelete,
  onMove,
  folders,
}) => {
  if (!isOpen || !file) return null;

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const subject = SUBJECTS[file.subjectId];
  const folder = folders.find((f) => f.id === file.folderId);

  useEffect(() => {
    let url: string | null = null;
    setIsLoading(true);

    if (file.blob) {
      url = URL.createObjectURL(file.blob);
      setBlobUrl(url);

      // If text/code/markdown, read as text
      if (
        file.category === 'code' || 
        file.type.includes('text') || 
        ['txt', 'md', 'c', 'h', 'cpp', 'py', 'json'].includes(file.extension.toLowerCase())
      ) {
        file.blob.text().then((text) => {
          setTextContent(text);
          setIsLoading(false);
        }).catch(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
      setTextContent(null);
    };
  }, [file]);

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
              {file.extension.toUpperCase().slice(0, 3)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate" title={file.name}>
                {file.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{subject?.shortName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{formatFileSize(file.size)}</span>
                <span aria-hidden="true">·</span>
                <span>{folder ? folder.name : 'Root Folder'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleStar(file)}
              className="p-2 text-slate-500 hover:text-amber-500 rounded-lg hover:bg-slate-100 transition-colors"
              title={file.isStarred ? 'Unstar' : 'Star'}
            >
              <Star className={`w-4 h-4 ${file.isStarred ? 'text-amber-500 fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => onMove(file)}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Move to another folder"
            >
              <MoveRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDownload(file)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => onDelete(file)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview & Details Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
          {/* Main Viewer Canvas */}
          <div className="flex-1 bg-slate-900 overflow-auto flex items-center justify-center p-4 relative">
            {isLoading ? (
              <div className="text-white text-xs flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Loading note document...</span>
              </div>
            ) : file.category === 'pdf' && blobUrl ? (
              <iframe
                src={`${blobUrl}#toolbar=1`}
                className="w-full h-full rounded-lg bg-white border-none shadow-md"
                title={file.name}
              />
            ) : file.category === 'image' && blobUrl ? (
              <div className="max-w-full max-h-full flex items-center justify-center">
                <img
                  src={blobUrl}
                  alt={file.name}
                  className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : textContent !== null ? (
              <div className="w-full h-full bg-slate-950 text-slate-200 rounded-lg p-5 overflow-auto font-mono text-xs border border-slate-800 shadow-inner relative">
                <div className="sticky top-0 right-0 flex justify-end pb-2">
                  <button
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Content'}</span>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed select-text font-mono text-[13px]">
                  {textContent}
                </pre>
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-800/80 rounded-xl border border-slate-700 max-w-md">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-white mb-1">
                  Preview not rendered for this format
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  This file ({file.extension.toUpperCase()}) can be downloaded directly to open in your native desktop application.
                </p>
                <button
                  onClick={() => onDownload(file)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File ({formatFileSize(file.size)})</span>
                </button>
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto space-y-5 shrink-0 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-3">Note Metadata</h4>
              
              <div className="space-y-3 text-slate-600">
                <div className="flex items-start justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Subject</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {subject?.name}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Subject Code</span>
                  <span className="font-mono font-medium text-slate-900">
                    {subject?.code}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Folder</span>
                  <span className="font-medium text-indigo-600">
                    {folder ? folder.name : 'Root Folder'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">File Size</span>
                  <span className="font-mono tabular-nums text-slate-900 font-semibold">
                    {formatFileSize(file.size)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Format</span>
                  <span className="font-mono uppercase text-slate-700">
                    {file.extension}
                  </span>
                </div>

                {file.author && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Lecturer / Author</span>
                    <span className="font-medium text-slate-900">
                      {file.author}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Uploaded</span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h5 className="font-semibold text-slate-800 mb-2">Tags & Topics</h5>
              {file.tags && file.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {file.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 italic">No tags attached</span>
              )}
            </div>

            {/* Description */}
            {file.description && (
              <div>
                <h5 className="font-semibold text-slate-800 mb-1.5">Description</h5>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {file.description}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                onClick={() => onDownload(file)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Save to Local Drive</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
