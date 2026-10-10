import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  FileUp, 
  FolderPlus, 
  Tag, 
  User, 
  File, 
  Folder as FolderIcon
} from 'lucide-react';
import { SubjectId, Folder } from '../types';
import { SUBJECT_LIST, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../data/subjects';
import { formatFileSize, uploadFile } from '../services/db';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId: SubjectId;
  defaultFolderId: string | null;
  folders: Folder[];
  onUploadSuccess: () => void;
  onCreateFolderQuick: (subjectId: SubjectId, name: string) => Promise<Folder>;
}

interface QueuedFile {
  file: File;
  id: string;
  name: string;
  size: number;
  isTooLarge: boolean;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMessage?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  defaultFolderId,
  folders,
  onUploadSuccess,
  onCreateFolderQuick,
}) => {
  if (!isOpen) return null;

  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(defaultSubjectId);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(defaultFolderId);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Exam Prep']);
  const [author, setAuthor] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showQuickFolderInput, setShowQuickFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter folders for currently chosen subject
  const subjectFolders = folders.filter((f) => f.subjectId === selectedSubject);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newQueued: QueuedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const isTooLarge = f.size > MAX_FILE_SIZE_BYTES;
      newQueued.push({
        file: f,
        id: `q_${Date.now()}_${i}`,
        name: f.name,
        size: f.size,
        isTooLarge,
        status: isTooLarge ? 'error' : 'pending',
        errorMessage: isTooLarge
          ? `File exceeds 50 MB limit (${formatFileSize(f.size)} > 50.0 MB)`
          : undefined,
      });
    }

    setQueuedFiles((prev) => [...prev, ...newQueued]);
  };

  const handleRemoveFile = (id: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCreateNewFolderInline = async () => {
    if (!newFolderName.trim()) return;
    try {
      const created = await onCreateFolderQuick(selectedSubject, newFolderName.trim());
      setSelectedFolderId(created.id);
      setNewFolderName('');
      setShowQuickFolderInput(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartUpload = async () => {
    const validFiles = queuedFiles.filter((f) => !f.isTooLarge && f.status === 'pending');
    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      for (const item of validFiles) {
        // Update status to uploading
        setQueuedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f))
        );

        await uploadFile(
          {
            name: item.name,
            subjectId: selectedSubject,
            folderId: selectedFolderId,
            type: item.file.type || 'application/octet-stream',
            tags,
            author: author.trim() || undefined,
            isStarred: false,
          },
          item.file
        );

        // Update status to done
        setQueuedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'done' } : f))
        );
      }

      onUploadSuccess();
      setTimeout(() => {
        setIsUploading(false);
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Upload error', err);
      setIsUploading(false);
    }
  };

  const hasTooLargeFiles = queuedFiles.some((f) => f.isTooLarge);
  const validFilesCount = queuedFiles.filter((f) => !f.isTooLarge).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              <span>Upload Subject Notes</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict max limit: <strong className="text-indigo-700">50 MB per file</strong>. Supports PDF, Docs, Code, Images & Archives.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Subject Selector (8 Subjects) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Subject (Required)
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value as SubjectId);
                  setSelectedFolderId(null);
                }}
                disabled={isUploading}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SUBJECT_LIST.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.shortName} — {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Folder Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Target Folder
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickFolderInput(!showQuickFolderInput)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>+ New Folder</span>
                </button>
              </div>

              {showQuickFolderInput ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="New folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewFolderInline}
                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium whitespace-nowrap"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickFolderInput(false)}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  value={selectedFolderId || ''}
                  onChange={(e) => setSelectedFolderId(e.target.value ? e.target.value : null)}
                  disabled={isUploading}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">📂 Root of {selectedSubject.toUpperCase()} (No Folder)</option>
                  {subjectFolders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFilesSelected(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                <FileUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drag and drop note files here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Upload up to 50 MB per file · Supports PDF, C/C++ Code, PPT, DOCX, Images, ZIP
              </p>
            </div>
          </div>

          {/* Queued Files Preview */}
          {queuedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Selected Files ({queuedFiles.length})</span>
                <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                  {formatFileSize(queuedFiles.reduce((acc, f) => acc + f.size, 0))} total
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {queuedFiles.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                      item.isTooLarge
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : item.status === 'done'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <File className={`w-4 h-4 shrink-0 ${item.isTooLarge ? 'text-rose-500' : 'text-slate-500'}`} />
                      <div className="truncate">
                        <div className="font-medium truncate">{item.name}</div>
                        {item.errorMessage ? (
                          <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{item.errorMessage}</span>
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                            {formatFileSize(item.size)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'done' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      {item.status === 'uploading' && (
                        <span className="text-[11px] font-medium text-indigo-600 animate-pulse">
                          Saving...
                        </span>
                      )}
                      {!isUploading && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {hasTooLargeFiles && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Some files exceed the 50 MB limit!</span>
                    <span>Please remove files over 50 MB before uploading to continue.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optional Metadata: Author & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lecturer / Author (Optional)
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Prof. R. Sharma"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  disabled={isUploading}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags & Topic Keywords
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add tag (e.g. Unit 2, Numerical)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  disabled={isUploading}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded font-medium"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            {validFilesCount} of {queuedFiles.length} file(s) eligible
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStartUpload}
              disabled={isUploading || validFilesCount === 0 || hasTooLargeFiles}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all flex items-center gap-2 ${
                isUploading || validFilesCount === 0 || hasTooLargeFiles
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading & Indexing...' : `Upload ${validFilesCount} Note(s)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
