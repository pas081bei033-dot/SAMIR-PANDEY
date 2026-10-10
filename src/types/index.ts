export type SubjectId = 
  | 'fee' 
  | 'c' 
  | 'physics' 
  | 'math1' 
  | 'math2' 
  | 'cg' 
  | 'cs' 
  | 'advance_electronics';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  code: string;
  shortName: string;
  description: string;
  color: string; // Tailwind color token
  accentClass: string;
  badgeClass: string;
  topics: string[];
}

export interface Folder {
  id: string;
  name: string;
  subjectId: SubjectId;
  parentId: string | null; // null means root of the subject
  createdAt: number;
  updatedAt: number;
  color?: string;
  description?: string;
}

export type FileCategory = 'pdf' | 'code' | 'image' | 'doc' | 'archive' | 'audio' | 'other';

export interface NoteFile {
  id: string;
  name: string;
  subjectId: SubjectId;
  folderId: string | null; // null means root of the subject
  size: number; // in bytes (up to 52,428,800 bytes = 50 MB)
  type: string; // MIME type
  extension: string;
  category: FileCategory;
  tags: string[];
  description?: string;
  author?: string;
  isStarred: boolean;
  createdAt: number;
  updatedAt: number;
  // Blob content is kept separately in IndexedDB or referenced
  blob?: Blob;
  downloadUrl?: string; // cached object URL
}

export interface StorageStats {
  totalBytes: number;
  fileCount: number;
  bySubject: Record<SubjectId, { bytes: number; count: number }>;
}

export type ViewMode = 'grid' | 'list';

export type SortField = 'name' | 'date' | 'size';
export type SortOrder = 'asc' | 'desc';
