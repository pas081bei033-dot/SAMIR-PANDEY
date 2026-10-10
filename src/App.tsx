import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  FolderPlus, 
  Upload, 
  FilePlus, 
  HardDrive, 
  Star, 
  Folder as FolderIcon, 
  BookOpen, 
  Check, 
  Trash2, 
  Download, 
  MoveRight,
  ArrowUpDown,
  Sparkles,
  Zap,
  Terminal,
  Atom,
  Calculator,
  Binary,
  MonitorPlay,
  Cpu,
  Activity,
  Layers
} from 'lucide-react';
import { SubjectId, Folder, NoteFile, StorageStats, ViewMode, SortField, SortOrder, FileCategory } from './types';
import { SUBJECTS, SUBJECT_LIST, MAX_FILE_SIZE_MB } from './data/subjects';
import { 
  seedInitialDataIfNeeded, 
  getFolders, 
  getFiles, 
  createFolder, 
  updateFolder, 
  deleteFolder, 
  deleteFile, 
  toggleStar, 
  moveFiles, 
  getStorageStats,
  formatFileSize 
} from './services/db';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { FolderCard } from './components/FolderCard';
import { FileCard } from './components/FileCard';
import { FileRow } from './components/FileRow';
import { UploadModal } from './components/UploadModal';
import { FolderModal } from './components/FolderModal';
import { FileViewerModal } from './components/FileViewerModal';
import { QuickNoteModal } from './components/QuickNoteModal';
import { MoveModal } from './components/MoveModal';
import { StorageModal } from './components/StorageModal';

const SUBJECT_ICONS: Record<SubjectId, React.ReactNode> = {
  fee: <Zap className="w-5 h-5 text-sky-600" />,
  c: <Terminal className="w-5 h-5 text-teal-600" />,
  physics: <Atom className="w-5 h-5 text-indigo-600" />,
  math1: <Calculator className="w-5 h-5 text-rose-600" />,
  math2: <Binary className="w-5 h-5 text-amber-600" />,
  cg: <MonitorPlay className="w-5 h-5 text-purple-600" />,
  cs: <Cpu className="w-5 h-5 text-emerald-600" />,
  advance_electronics: <Activity className="w-5 h-5 text-orange-600" />,
};

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentTab, setCurrentTab] = useState<'subjects' | 'folders' | 'starred' | 'storage'>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<NoteFile[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalBytes: 0,
    fileCount: 0,
    bySubject: {
      fee: { bytes: 0, count: 0 },
      c: { bytes: 0, count: 0 },
      physics: { bytes: 0, count: 0 },
      math1: { bytes: 0, count: 0 },
      math2: { bytes: 0, count: 0 },
      cg: { bytes: 0, count: 0 },
      cs: { bytes: 0, count: 0 },
      advance_electronics: { bytes: 0, count: 0 },
    },
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'all'>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'starred' | 'recent'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Selection for bulk operations
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [viewingFile, setViewingFile] = useState<NoteFile | null>(null);
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [filesToMove, setFilesToMove] = useState<NoteFile[]>([]);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  // Initialize DB on mount
  const refreshAllData = useCallback(async () => {
    try {
      const [fetchedFolders, fetchedFiles, fetchedStats] = await Promise.all([
        getFolders(),
        getFiles(),
        getStorageStats(),
      ]);
      setFolders(fetchedFolders);
      setFiles(fetchedFiles);
      setStorageStats(fetchedStats);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      await seedInitialDataIfNeeded();
      await refreshAllData();
      setIsInitializing(false);
    }
    init();
  }, [refreshAllData]);

  // Compute folder path from root to currentFolder
  const folderPath = useMemo(() => {
    if (!currentFolder) return [];
    const path: Folder[] = [];
    let curr: Folder | undefined = currentFolder;
    const folderMap = new Map(folders.map((f) => [f.id, f]));

    while (curr) {
      path.unshift(curr);
      if (curr.parentId) {
        curr = folderMap.get(curr.parentId);
      } else {
        break;
      }
    }
    return path;
  }, [currentFolder, folders]);

  // Visible folders in current scope
  const visibleFolders = useMemo(() => {
    return folders.filter((f) => {
      // If a specific subject is selected, must match subject
      if (selectedSubject !== 'all' && f.subjectId !== selectedSubject) {
        return false;
      }

      // If we are currently inside a folder, only show its direct children
      if (currentFolder) {
        return f.parentId === currentFolder.id;
      }

      // Otherwise show root folders
      return f.parentId === null;
    });
  }, [folders, selectedSubject, currentFolder]);

  // Map to count files and subfolders per folder
  const folderMetrics = useMemo(() => {
    const fileCounts: Record<string, number> = {};
    const subfolderCounts: Record<string, number> = {};

    for (const file of files) {
      if (file.folderId) {
        fileCounts[file.folderId] = (fileCounts[file.folderId] || 0) + 1;
      }
    }

    for (const f of folders) {
      if (f.parentId) {
        subfolderCounts[f.parentId] = (subfolderCounts[f.parentId] || 0) + 1;
      }
    }

    return { fileCounts, subfolderCounts };
  }, [files, folders]);

  // Filtered and sorted files
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      // Starred filter
      if (selectedFilter === 'starred' || currentTab === 'starred') {
        if (!f.isStarred) return false;
      }

      // Subject filter
      if (selectedSubject !== 'all' && f.subjectId !== selectedSubject) {
        return false;
      }

      // Folder filter:
      // If we are inside a folder, strictly show files of that folder
      // If on root of a subject, show files where folderId is null, OR if user wants to see all files in explorer
      if (currentFolder) {
        if (f.folderId !== currentFolder.id) return false;
      } else if (selectedSubject !== 'all' && currentTab === 'folders') {
        if (f.folderId !== null) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && f.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(query);
        const matchesAuthor = f.author?.toLowerCase().includes(query);
        const matchesTags = f.tags.some((t) => t.toLowerCase().includes(query));
        const matchesDesc = f.description?.toLowerCase().includes(query);
        const matchesSubject = SUBJECTS[f.subjectId]?.name.toLowerCase().includes(query) ||
                               SUBJECTS[f.subjectId]?.shortName.toLowerCase().includes(query);

        if (!matchesName && !matchesAuthor && !matchesTags && !matchesDesc && !matchesSubject) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let result = 0;
      if (sortField === 'name') {
        result = a.name.localeCompare(b.name);
      } else if (sortField === 'size') {
        result = a.size - b.size;
      } else {
        result = a.createdAt - b.createdAt;
      }
      return sortOrder === 'desc' ? -result : result;
    });
  }, [files, selectedFilter, currentTab, selectedSubject, currentFolder, selectedCategory, searchQuery, sortField, sortOrder]);

  // Handlers
  const handleOpenFolder = (folder: Folder) => {
    setSelectedSubject(folder.subjectId);
    setCurrentFolder(folder);
  };

  const handleCreateFolder = async (data: { name: string; subjectId: SubjectId; parentId: string | null; description?: string }) => {
    await createFolder(data);
    await refreshAllData();
  };

  const handleCreateFolderQuick = async (subjectId: SubjectId, name: string): Promise<Folder> => {
    const created = await createFolder({
      name,
      subjectId,
      parentId: currentFolder ? currentFolder.id : null,
    });
    await refreshAllData();
    return created;
  };

  const handleUpdateFolder = async (folder: Folder) => {
    setFolderToEdit(folder);
    setIsFolderModalOpen(true);
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (confirm(`Are you sure you want to delete folder "${folder.name}"? Notes in this folder will be safely moved to root.`)) {
      await deleteFolder(folder.id);
      if (currentFolder?.id === folder.id) {
        setCurrentFolder(null);
      }
      await refreshAllData();
    }
  };

  const handleDeleteFile = async (file: NoteFile) => {
    if (confirm(`Delete "${file.name}"?`)) {
      await deleteFile(file.id);
      if (viewingFile?.id === file.id) setViewingFile(null);
      setSelectedFileIds((prev) => {
        const next = new Set(prev);
        next.delete(file.id);
        return next;
      });
      await refreshAllData();
    }
  };

  const handleToggleStar = async (file: NoteFile) => {
    await toggleStar(file.id);
    await refreshAllData();
  };

  const handleDownloadFile = (file: NoteFile) => {
    if (!file.blob) return;
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleMoveSingle = (file: NoteFile) => {
    setFilesToMove([file]);
    setIsMoveModalOpen(true);
  };

  const handleMoveBulk = () => {
    const selectedFiles = files.filter((f) => selectedFileIds.has(f.id));
    if (selectedFiles.length > 0) {
      setFilesToMove(selectedFiles);
      setIsMoveModalOpen(true);
    }
  };

  const handleConfirmMove = async (targetSubjectId: SubjectId, targetFolderId: string | null) => {
    const ids = filesToMove.map((f) => f.id);
    await moveFiles(ids, targetFolderId, targetSubjectId);
    setSelectedFileIds(new Set());
    await refreshAllData();
  };

  const handleDeleteSelected = async () => {
    if (selectedFileIds.size === 0) return;
    if (confirm(`Delete ${selectedFileIds.size} selected note(s)?`)) {
      for (const id of selectedFileIds) {
        await deleteFile(id);
      }
      setSelectedFileIds(new Set());
      await refreshAllData();
    }
  };

  const handleDownloadSelected = () => {
    const selected = files.filter((f) => selectedFileIds.has(f.id));
    for (const f of selected) {
      handleDownloadFile(f);
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFileIds(new Set(filteredFiles.map((f) => f.id)));
    } else {
      setSelectedFileIds(new Set());
    }
  };

  const activeSubjectInfo = selectedSubject !== 'all' ? SUBJECTS[selectedSubject] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'starred') {
            setSelectedFilter('starred');
          } else if (tab === 'storage') {
            setIsStorageModalOpen(true);
          } else if (tab === 'subjects') {
            setSelectedSubject('all');
            setCurrentFolder(null);
            setSelectedFilter('all');
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenQuickNote={() => setIsQuickNoteOpen(true)}
        totalStorageBytes={storageStats.totalBytes}
        totalFilesCount={storageStats.fileCount}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          selectedSubject={selectedSubject}
          onSelectSubject={(sub) => {
            setSelectedSubject(sub);
            setCurrentFolder(null);
          }}
          selectedFilter={selectedFilter}
          onSelectFilter={(fil) => {
            setSelectedFilter(fil);
            if (fil === 'starred') {
              setCurrentTab('starred');
            }
          }}
          storageStats={storageStats}
          onCreateFolder={() => {
            setFolderToEdit(null);
            setIsFolderModalOpen(true);
          }}
          onOpenStorageModal={() => setIsStorageModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Hero / Subject Focus Banner */}
          {activeSubjectInfo ? (
            <div className="mb-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    {SUBJECT_ICONS[activeSubjectInfo.id]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-slate-900">
                        {activeSubjectInfo.name}
                      </h1>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {activeSubjectInfo.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      {activeSubjectInfo.description}
                    </p>

                    {/* Unboxed Metadata Discipline for Topics */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 flex-wrap">
                      <span className="font-semibold text-slate-600">Core Units:</span>
                      {activeSubjectInfo.topics.map((t, idx) => (
                        <React.Fragment key={t}>
                          <span>{t}</span>
                          {idx < activeSubjectInfo.topics.length - 1 && (
                            <span aria-hidden="true">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setFolderToEdit(null);
                      setIsFolderModalOpen(true);
                    }}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>New Folder</span>
                  </button>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload to {activeSubjectInfo.shortName}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* All Subjects Overview Hero */
            <div className="mb-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="relative h-36 sm:h-44 bg-slate-900">
                <img
                  src="/src/assets/images/banner_engineering_lab_1791645866842.jpg"
                  alt="Engineering Laboratory"
                  className="w-full h-full object-cover opacity-35"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent p-6 flex flex-col justify-center">
                  <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
                    Engineering Archive Workspace
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    8 Subjects Notes & Documentation Hub
                  </h1>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Dedicated folder repositories for FEE, C, Physics, Math I, Math II, CG, CS, and Advance Electronics. Upload up to 50 MB per document with instant indexing.
                  </p>
                </div>
              </div>

              {/* 8 Subjects Quick Grid Strip */}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-slate-50 border-t border-slate-100">
                {SUBJECT_LIST.map((sub) => {
                  const count = storageStats.bySubject[sub.id]?.count || 0;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubject(sub.id);
                        setCurrentFolder(null);
                      }}
                      className="p-2.5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs rounded-lg text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="shrink-0">{SUBJECT_ICONS[sub.id]}</span>
                        <span className="font-mono text-[10px] tabular-nums text-slate-400 font-medium">
                          {count}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 truncate">
                        {sub.shortName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {sub.code}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Breadcrumbs Trail */}
          <Breadcrumbs
            selectedSubject={selectedSubject}
            onSelectSubject={(sub) => {
              setSelectedSubject(sub);
              setCurrentFolder(null);
            }}
            currentFolder={currentFolder}
            folderPath={folderPath}
            onSelectFolder={(f) => setCurrentFolder(f)}
            onCreateFolder={() => {
              setFolderToEdit(null);
              setIsFolderModalOpen(true);
            }}
          />

          {/* Folder Grid Section (When viewing folders) */}
          {visibleFolders.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {currentFolder ? 'Subfolders' : 'Subject Folders'} ({visibleFolders.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {visibleFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    fileCount={folderMetrics.fileCounts[folder.id] || 0}
                    subfolderCount={folderMetrics.subfolderCounts[folder.id] || 0}
                    onOpen={handleOpenFolder}
                    onRename={handleUpdateFolder}
                    onDelete={handleDeleteFolder}
                  />
                ))}

                {/* Quick Add Folder Card */}
                <button
                  onClick={() => {
                    setFolderToEdit(null);
                    setIsFolderModalOpen(true);
                  }}
                  className="border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 bg-white hover:bg-indigo-50/20 transition-all text-xs font-medium min-h-[105px]"
                >
                  <FolderPlus className="w-5 h-5 mb-1.5 text-slate-400 group-hover:text-indigo-600" />
                  <span>+ Create New Folder</span>
                </button>
              </div>
            </div>
          )}

          {/* Notes Explorer Toolbar (Search, Filter, Views, Sorting) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes by title, topic, author, #tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Tabs & Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* File Format Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {(['all', 'pdf', 'code', 'image', 'doc'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 font-medium rounded-md transition-colors uppercase text-[11px] ${
                      selectedCategory === cat
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Order Selector */}
              <div className="flex items-center border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                <select
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
                    setSortField(field);
                    setSortOrder(order);
                  }}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="size-desc">Size (Largest)</option>
                  <option value="size-asc">Size (Smallest)</option>
                </select>
              </div>

              {/* View Switcher (Grid vs List) */}
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${
                    viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Action Bar (When items selected) */}
          {selectedFileIds.size > 0 && (
            <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-indigo-900 shadow-xs">
              <span className="font-semibold">
                {selectedFileIds.size} note(s) selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSelected}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-indigo-200 rounded-md font-medium text-indigo-700 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={handleMoveBulk}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-indigo-200 rounded-md font-medium text-indigo-700 flex items-center gap-1"
                >
                  <MoveRight className="w-3.5 h-3.5" />
                  <span>Move</span>
                </button>

                <button
                  onClick={handleDeleteSelected}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md font-medium text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* Files Display */}
          {filteredFiles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                No note files found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                {searchQuery
                  ? 'No documents match your search filters. Try clearing your search keyword.'
                  : currentFolder
                  ? `Folder "${currentFolder.name}" is currently empty. Upload notes or create a quick note.`
                  : 'Start uploading notes for this subject (up to 50 MB per file).'}
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Note File</span>
                </button>
                <button
                  onClick={() => setIsQuickNoteOpen(true)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Create Quick Note</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onPreview={(f) => setViewingFile(f)}
                  onDownload={handleDownloadFile}
                  onToggleStar={handleToggleStar}
                  onDelete={handleDeleteFile}
                  onMove={handleMoveSingle}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="w-10 px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={
                          filteredFiles.length > 0 &&
                          selectedFileIds.size === filteredFiles.length
                        }
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-3 py-2.5">Document Title</th>
                    <th className="px-3 py-2.5">Subject</th>
                    <th className="px-3 py-2.5">Folder</th>
                    <th className="px-3 py-2.5 text-right">Size</th>
                    <th className="px-3 py-2.5 text-right">Date</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map((file) => {
                    const fld = folders.find((f) => f.id === file.folderId);
                    return (
                      <FileRow
                        key={file.id}
                        file={file}
                        folderName={fld ? fld.name : 'Root Folder'}
                        isSelected={selectedFileIds.has(file.id)}
                        onSelect={(checked) => {
                          setSelectedFileIds((prev) => {
                            const next = new Set(prev);
                            if (checked) next.add(file.id);
                            else next.delete(file.id);
                            return next;
                          });
                        }}
                        onPreview={(f) => setViewingFile(f)}
                        onDownload={handleDownloadFile}
                        onToggleStar={handleToggleStar}
                        onDelete={handleDeleteFile}
                        onMove={handleMoveSingle}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal with 50MB check */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultSubjectId={selectedSubject !== 'all' ? selectedSubject : 'fee'}
        defaultFolderId={currentFolder ? currentFolder.id : null}
        folders={folders}
        onUploadSuccess={refreshAllData}
        onCreateFolderQuick={handleCreateFolderQuick}
      />

      {/* Folder Create/Edit Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setFolderToEdit(null);
        }}
        folderToEdit={folderToEdit}
        defaultSubjectId={selectedSubject !== 'all' ? selectedSubject : 'fee'}
        defaultParentId={currentFolder ? currentFolder.id : null}
        allFolders={folders}
        onSave={async (data) => {
          if (folderToEdit) {
            await updateFolder(folderToEdit.id, data);
            await refreshAllData();
          } else {
            await handleCreateFolder(data);
          }
        }}
      />

      {/* File Full Previewer Modal */}
      <FileViewerModal
        isOpen={!!viewingFile}
        file={viewingFile}
        onClose={() => setViewingFile(null)}
        onDownload={handleDownloadFile}
        onToggleStar={handleToggleStar}
        onDelete={handleDeleteFile}
        onMove={handleMoveSingle}
        folders={folders}
      />

      {/* Quick Markdown Note Modal */}
      <QuickNoteModal
        isOpen={isQuickNoteOpen}
        onClose={() => setIsQuickNoteOpen(false)}
        defaultSubjectId={selectedSubject !== 'all' ? selectedSubject : 'fee'}
        defaultFolderId={currentFolder ? currentFolder.id : null}
        folders={folders}
        onNoteCreated={refreshAllData}
      />

      {/* Move Files Modal */}
      <MoveModal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setFilesToMove([]);
        }}
        filesToMove={filesToMove}
        folders={folders}
        onConfirmMove={handleConfirmMove}
      />

      {/* Storage and Backup Modal */}
      <StorageModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        storageStats={storageStats}
        onRefreshData={refreshAllData}
      />
    </div>
  );
}
