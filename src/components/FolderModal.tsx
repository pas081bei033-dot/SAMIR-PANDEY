import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Folder as FolderIcon } from 'lucide-react';
import { SubjectId, Folder } from '../types';
import { SUBJECT_LIST } from '../data/subjects';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderToEdit?: Folder | null;
  defaultSubjectId: SubjectId;
  defaultParentId: string | null;
  allFolders: Folder[];
  onSave: (data: { name: string; subjectId: SubjectId; parentId: string | null; description?: string }) => Promise<void>;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  folderToEdit,
  defaultSubjectId,
  defaultParentId,
  allFolders,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState<SubjectId>(defaultSubjectId);
  const [parentId, setParentId] = useState<string | null>(defaultParentId);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (folderToEdit) {
      setName(folderToEdit.name);
      setSubjectId(folderToEdit.subjectId);
      setParentId(folderToEdit.parentId);
      setDescription(folderToEdit.description || '');
    } else {
      setName('');
      setSubjectId(defaultSubjectId);
      setParentId(defaultParentId);
      setDescription('');
    }
    setError('');
  }, [folderToEdit, defaultSubjectId, defaultParentId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a folder name');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        subjectId,
        parentId: parentId || null,
        description: description.trim() || undefined,
      });
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save folder');
      setIsSaving(false);
    }
  };

  // Folders for current subject excluding this folder itself to avoid cycles
  const eligibleParents = allFolders.filter(
    (f) => f.subjectId === subjectId && (!folderToEdit || f.id !== folderToEdit.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {folderToEdit ? 'Rename Folder' : 'Create New Folder'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Folder Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Unit 3 Operational Amplifiers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Archive
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value as SubjectId);
                setParentId(null);
              }}
              disabled={!!folderToEdit}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {SUBJECT_LIST.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.shortName} — {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Parent Folder (Optional Nesting)
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value ? e.target.value : null)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">📂 Root of {subjectId.toUpperCase()}</option>
              {eligibleParents.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Lecture notes and solved questions for unit 3..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              {isSaving ? 'Saving...' : folderToEdit ? 'Save Changes' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
