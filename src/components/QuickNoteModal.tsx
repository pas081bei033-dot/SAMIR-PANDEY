import React, { useState } from 'react';
import { X, FileText, Save, Tag } from 'lucide-react';
import { SubjectId, Folder } from '../types';
import { SUBJECT_LIST } from '../data/subjects';
import { uploadFile } from '../services/db';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId: SubjectId;
  defaultFolderId: string | null;
  folders: Folder[];
  onNoteCreated: () => void;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  defaultFolderId,
  folders,
  onNoteCreated,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState<SubjectId>(defaultSubjectId);
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Quick Note']);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const subjectFolders = folders.filter((f) => f.subjectId === subjectId);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your note.');
      return;
    }
    if (!content.trim()) {
      setError('Please write some content for your note.');
      return;
    }

    setIsSaving(true);
    try {
      const fileName = title.trim().endsWith('.md')
        ? title.trim()
        : `${title.trim().replace(/[^a-zA-Z0-9_\- ]/g, '')}.md`;

      const blob = new Blob([content], { type: 'text/markdown' });

      await uploadFile(
        {
          name: fileName,
          subjectId,
          folderId,
          type: 'text/markdown',
          tags,
          description: 'Hand-authored note in OmniNotes workspace',
          isStarred: false,
        },
        blob
      );

      setIsSaving(false);
      onNoteCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save note');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create Quick Study Note</h3>
              <p className="text-xs text-slate-500">
                Write Markdown or plain text notes saved directly into your subject folder.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value as SubjectId);
                  setFolderId(null);
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
                Folder
              </label>
              <select
                value={folderId || ''}
                onChange={(e) => setFolderId(e.target.value || null)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="">📂 Root of {subjectId.toUpperCase()}</option>
                {subjectFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 4 Operational Amplifier Derivations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Note Content (Markdown supported) *
              </label>
              <span className="text-[11px] text-slate-400">Supports # headings, equations, code</span>
            </div>
            <textarea
              required
              rows={10}
              placeholder="# Key Concepts&#10;&#10;1. Inverting Amplifier Formula: Vout = -(Rf/R1) * Vin&#10;2. Virtual Ground Concept...&#10;&#10;```c&#10;// Code snippets or notes&#10;```"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 text-xs font-mono border border-slate-300 rounded-lg leading-relaxed focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tags
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Add tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Note to Folder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
