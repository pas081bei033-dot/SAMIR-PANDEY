import React, { useState } from 'react';
import { X, MoveRight, Folder as FolderIcon } from 'lucide-react';
import { SubjectId, Folder, NoteFile } from '../types';
import { SUBJECT_LIST } from '../data/subjects';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  filesToMove: NoteFile[];
  folders: Folder[];
  onConfirmMove: (targetSubjectId: SubjectId, targetFolderId: string | null) => Promise<void>;
}

export const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  onClose,
  filesToMove,
  folders,
  onConfirmMove,
}) => {
  if (!isOpen || filesToMove.length === 0) return null;

  const defaultSub = filesToMove[0].subjectId;
  const [targetSubjectId, setTargetSubjectId] = useState<SubjectId>(defaultSub);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eligibleFolders = folders.filter((f) => f.subjectId === targetSubjectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmMove(targetSubjectId, targetFolderId);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <MoveRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Move Notes</h3>
              <p className="text-xs text-slate-500">
                Relocate {filesToMove.length} note(s) to another subject or folder
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto text-xs space-y-1">
            <span className="font-semibold text-slate-600 block mb-1">Selected Notes:</span>
            {filesToMove.map((f) => (
              <div key={f.id} className="text-slate-800 truncate font-mono">
                • {f.name}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination Subject Archive
            </label>
            <select
              value={targetSubjectId}
              onChange={(e) => {
                setTargetSubjectId(e.target.value as SubjectId);
                setTargetFolderId(null);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
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
              Destination Folder
            </label>
            <select
              value={targetFolderId || ''}
              onChange={(e) => setTargetFolderId(e.target.value || null)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="">📂 Root of {targetSubjectId.toUpperCase()} (No Folder)</option>
              {eligibleFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              {isSubmitting ? 'Moving...' : 'Move Files'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
