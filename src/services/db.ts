import { SubjectId, Folder, NoteFile, StorageStats, FileCategory } from '../types';
import { SUBJECT_LIST, STANDARD_DEFAULT_FOLDERS, MAX_FILE_SIZE_BYTES } from '../data/subjects';

const DB_NAME = 'OmniNotes_DB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export function getFileCategory(name: string, mimeType: string): FileCategory {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf' || mimeType.includes('pdf')) return 'pdf';
  if (['c', 'h', 'cpp', 'cc', 'java', 'py', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json', 'sql', 'asm', 'vhd', 'v'].includes(ext)) return 'code';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext) || mimeType.startsWith('image/')) return 'image';
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'md', 'rtf'].includes(ext) || mimeType.includes('officedocument') || mimeType.includes('msword') || mimeType.includes('text/')) return 'doc';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext) || mimeType.startsWith('audio/')) return 'audio';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = 1;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('folders')) {
        const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
        folderStore.createIndex('subjectId', 'subjectId', { unique: false });
        folderStore.createIndex('parentId', 'parentId', { unique: false });
      }

      if (!db.objectStoreNames.contains('files')) {
        const fileStore = db.createObjectStore('files', { keyPath: 'id' });
        fileStore.createIndex('subjectId', 'subjectId', { unique: false });
        fileStore.createIndex('folderId', 'folderId', { unique: false });
        fileStore.createIndex('isStarred', 'isStarred', { unique: false });
        fileStore.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Seed starter folders & sample syllabus notes if DB is empty
export async function seedInitialDataIfNeeded(): Promise<void> {
  const db = await openDB();

  const folderCount = await new Promise<number>((resolve) => {
    const tx = db.transaction('folders', 'readonly');
    const store = tx.objectStore('folders');
    const countReq = store.count();
    countReq.onsuccess = () => resolve(countReq.result);
    countReq.onerror = () => resolve(0);
  });

  if (folderCount > 0) return;

  const now = Date.now();
  const tx = db.transaction(['folders', 'files'], 'readwrite');
  const folderStore = tx.objectStore('folders');
  const fileStore = tx.objectStore('files');

  const createdFolders: Record<string, string> = {};

  // Create standard folders for all 8 subjects
  for (const subject of SUBJECT_LIST) {
    for (const folderName of STANDARD_DEFAULT_FOLDERS) {
      const folderId = `f_${subject.id}_${folderName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const folder: Folder = {
        id: folderId,
        name: folderName,
        subjectId: subject.id,
        parentId: null,
        createdAt: now - Math.floor(Math.random() * 86400000 * 5),
        updatedAt: now,
      };
      folderStore.add(folder);
      createdFolders[`${subject.id}:${folderName}`] = folderId;
    }
  }

  // Seed sample starter notes for the 8 subjects
  const sampleNotes = [
    {
      subjectId: 'fee' as SubjectId,
      folderName: 'Lecture Notes & Slides',
      name: 'FEE_Unit1_DC_Circuit_Theorems_Cheatsheet.md',
      type: 'text/markdown',
      content: `# Fundamentals of Electrical Engineering (EE 401)
## Unit 1: DC Circuit Analysis & Network Theorems

### 1. Kirchhoff's Laws
- **Kirchhoff's Current Law (KCL):** $\\sum I_{in} = \\sum I_{out}$ at any junction node.
- **Kirchhoff's Voltage Law (KVL):** $\\sum V = 0$ around any closed mesh loop.

### 2. Thevenin's Theorem
Any linear bilateral two-terminal network can be replaced by an equivalent circuit consisting of:
- An open-circuit voltage source $V_{th}$ in series with an equivalent resistance $R_{th}$.
- **Finding $V_{th}$:** Calculate open-circuit terminal voltage $V_{oc}$.
- **Finding $R_{th}$:** Deactivate all independent sources (short circuit voltage sources, open circuit current sources) and look back into terminals.

### 3. Norton's Theorem
Dual of Thevenin's theorem:
- Norton current source $I_N = V_{th} / R_{th}$ (short-circuit current) in parallel with $R_N = R_{th}$.

### 4. Maximum Power Transfer Theorem
For DC resistive circuits:
$$P_{max} = \\frac{V_{th}^2}{4 R_L} \\quad \\text{when } R_L = R_{th}$$

*Prepared for Semester Exams.*`,
      tags: ['Formula Sheet', 'Network Theorems', 'Exam Prep'],
      author: 'Prof. K. Sharma',
    },
    {
      subjectId: 'c' as SubjectId,
      folderName: 'Lab Manuals & Code',
      name: 'c_programming_dynamic_memory_and_pointers.c',
      type: 'text/x-c',
      content: `/**
 * C Programming (CT 401)
 * Demonstration: Dynamic Memory Allocation & Pointer Structures
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Student {
    int roll;
    char name[50];
    float marks[8]; // 8 subject marks
    float gpa;
} Student;

void calculateGPA(Student *s) {
    float sum = 0.0f;
    for (int i = 0; i < 8; i++) {
        sum += s->marks[i];
    }
    s->gpa = (sum / 8.0f) / 25.0f; // Scale to 4.0
}

int main() {
    int n = 3;
    printf("--- Engineering Student Records System ---\\n");
    Student *batch = (Student*)malloc(n * sizeof(Student));
    if (batch == NULL) {
        fprintf(stderr, "Memory allocation failed!\\n");
        return 1;
    }
    
    // Initialize sample student
    batch[0].roll = 101;
    strcpy(batch[0].name, "Aayush Adhikari");
    for(int i = 0; i < 8; i++) batch[0].marks[i] = 85.0f + (i * 1.5f);
    calculateGPA(&batch[0]);
    
    printf("Roll: %d | Name: %s | GPA: %.2f\\n", batch[0].roll, batch[0].name, batch[0].gpa);
    
    free(batch);
    batch = NULL;
    return 0;
}`,
      tags: ['Source Code', 'Pointers', 'Dynamic Memory', 'Lab 4'],
      author: 'Dept of Computer Eng',
    },
    {
      subjectId: 'physics' as SubjectId,
      folderName: 'Lecture Notes & Slides',
      name: 'Wave_Optics_and_Laser_Cavity_Formulas.md',
      type: 'text/markdown',
      content: `# Engineering Physics (SH 402)
## Wave Optics, Interference & Laser Cavities

### 1. Young's Double Slit Experiment
- Fringe width: $\\beta = \\frac{\\lambda D}{d}$
- Condition for Bright Fringes (Constructive): $\\Delta x = n\\lambda$
- Condition for Dark Fringes (Destructive): $\\Delta x = (2n-1)\\frac{\\lambda}{2}$

### 2. Thin Film Interference (Reflected Light)
- Path difference with Stokes phase shift $\\pi$:
  $$2\\mu t \\cos r = (2n - 1) \\frac{\\lambda}{2} \\quad \\text{(Bright fringe)}$$
  $$2\\mu t \\cos r = n\\lambda \\quad \\text{(Dark fringe)}$$

### 3. Laser Physics & Einstein Coefficients
- Population Inversion requirement: $N_2 > N_1$
- Einstein Relations:
  $$\\frac{A_{21}}{B_{21}} = \\frac{8\\pi h \\nu^3}{c^3}$$
- He-Ne Laser: $\\lambda = 632.8\\text{ nm}$ (Red beam) via resonant energy transfer from Helium $2^1S_0$ state.`,
      tags: ['Wave Optics', 'Lasers', 'Unit 2'],
      author: 'Physics Dept',
    },
    {
      subjectId: 'math1' as SubjectId,
      folderName: 'Formula Sheets & Quick Guides',
      name: 'Engineering_Mathematics_I_Complete_Formulas.md',
      type: 'text/markdown',
      content: `# Engineering Mathematics I (SH 401)
## Master Formula Guide

### 1. Taylor & Maclaurin Series
$$f(x) = f(0) + x f'(0) + \\frac{x^2}{2!} f''(0) + \\dots + \\frac{x^n}{n!} f^{(n)}(0)$$
- $e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\dots$
- $\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots$
- $\\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\dots$

### 2. Euler's Theorem for Homogeneous Functions
If $u = f(x, y)$ is homogeneous of degree $n$:
$$x \\frac{\\partial u}{\\partial x} + y \\frac{\\partial u}{\\partial y} = n u$$
And second order:
$$x^2 \\frac{\\partial^2 u}{\\partial x^2} + 2xy \\frac{\\partial^2 u}{\\partial x \\partial y} + y^2 \\frac{\\partial^2 u}{\\partial y^2} = n(n-1)u$$

### 3. Curvature & Radius of Curvature
$$\\rho = \\frac{[1 + (y')^2]^{3/2}}{|y''|}$$`,
      tags: ['Formulas', 'Calculus', 'Euler Theorem', 'Exam Ready'],
      author: 'Dept of Mathematics',
    },
    {
      subjectId: 'math2' as SubjectId,
      folderName: 'Past Exam Questions & Solutions',
      name: 'Math_II_ODEs_and_Laplace_Solutions_2080.md',
      type: 'text/markdown',
      content: `# Engineering Mathematics II (SH 451)
## Past Examination Solutions: ODEs & Laplace Transforms

### Problem 1: Second Order Linear ODE
Solve:
$$\\frac{d^2 y}{dx^2} - 4\\frac{dy}{dx} + 13y = 0$$
**Solution:**
1. Auxiliary Equation: $m^2 - 4m + 13 = 0$
2. Roots: $m = \\frac{4 \\pm \\sqrt{16 - 52}}{2} = 2 \\pm 3i$
3. General Solution:
   $$y = e^{2x} (C_1 \\cos 3x + C_2 \\sin 3x)$$

### Problem 2: Laplace Transform of Unit Step & Dirac Delta
$$\\mathcal{L}\\{u(t-a)\\} = \\frac{e^{-as}}{s}$$
$$\\mathcal{L}\\{\\delta(t-a)\\} = e^{-as}$$
First Shifting Theorem:
$$\\mathcal{L}\\{e^{at} f(t)\\} = F(s - a)$$`,
      tags: ['Solved Paper', 'Laplace', 'Differential Equations'],
      author: 'Math Circle',
    },
    {
      subjectId: 'cg' as SubjectId,
      folderName: 'Lecture Notes & Slides',
      name: 'Computer_Graphics_Bresenham_Algorithm_Notes.md',
      type: 'text/markdown',
      content: `# Computer Graphics (CT 501)
## Unit 2: Rasterization & Line Drawing Algorithms

### 1. Bresenham's Line Algorithm (Integer Arithmetic)
Given endpoints $(x_0, y_0)$ and $(x_1, y_1)$ with slope $0 < m < 1$:
1. Compute $\\Delta x = x_1 - x_0$, $\\Delta y = y_1 - y_0$.
2. Initial decision parameter:
   $$p_0 = 2\\Delta y - \\Delta x$$
3. At each step $k$:
   - If $p_k < 0$:
     $$x_{k+1} = x_k + 1, \\quad y_{k+1} = y_k$$
     $$p_{k+1} = p_k + 2\\Delta y$$
   - If $p_k \\ge 0$:
     $$x_{k+1} = x_k + 1, \\quad y_{k+1} = y_k + 1$$
     $$p_{k+1} = p_k + 2\\Delta y - 2\\Delta x$$

### 2. Cohen-Sutherland Line Clipping
Outcode representation (Top, Bottom, Right, Left):
- Bit 1: $y > y_{max}$ (Top)
- Bit 2: $y < y_{min}$ (Bottom)
- Bit 3: $x > x_{max}$ (Right)
- Bit 4: $x < x_{min}$ (Left)
- Trivial Accept: $\\text{code}_1 \\text{ OR } \\text{code}_2 == 0000$
- Trivial Reject: $\\text{code}_1 \\text{ AND } \\text{code}_2 \\ne 0000$`,
      tags: ['Rasterization', 'Bresenham', 'Clipping', 'Algorithms'],
      author: 'Prof. Subash',
    },
    {
      subjectId: 'cs' as SubjectId,
      folderName: 'Lecture Notes & Slides',
      name: 'Computer_Systems_CPU_Architecture_and_Kmaps.md',
      type: 'text/markdown',
      content: `# Computer Systems & Digital Logic (EX 501)
## Architecture, Logic Optimization & Pipeline

### 1. Karnaugh Map (K-Map) Minimization Rules
- Form groups of $2^n$ (1, 2, 4, 8, 16) adjacent minterms.
- Gray code ordering on axes: 00, 01, 11, 10.
- Don't care conditions ($d$ or $X$) can be bundled as 1 if expanding a group size.

### 2. Von Neumann vs Harvard Architecture
- **Von Neumann:** Unified memory for instructions and data; bottleneck on single bus.
- **Harvard:** Separate physical buses and storage for instruction memory and data memory; simultaneous instruction fetch and operand read.

### 3. CPU Instruction Cycle
1. **Fetch:** PC -> MAR -> Memory Read -> MDR -> IR; PC is incremented.
2. **Decode:** Control unit interprets opcode bits.
3. **Execute:** ALU computes arithmetic/logical operations.
4. **Memory / Writeback:** Store results in register file or RAM.`,
      tags: ['Digital Logic', 'CPU Cycle', 'Von Neumann', 'K-Maps'],
      author: 'Electronics Dept',
    },
    {
      subjectId: 'advance_electronics' as SubjectId,
      folderName: 'Lecture Notes & Slides',
      name: 'Advance_Electronics_OpAmp_Filters_Oscillators.md',
      type: 'text/markdown',
      content: `# Advance Electronics (EX 551)
## Operational Amplifiers, Active Filters & Oscillators

### 1. Ideal Op-Amp Characteristics
- Open-loop gain $A_{OL} = \\infty$
- Input impedance $R_{in} = \\infty$
- Output impedance $R_{out} = 0$
- Bandwidth $BW = \\infty$
- Slew rate $SR = \\infty$
- CMRR $= \\infty$
- Virtual ground principle: $V_+ \\approx V_-$ when negative feedback is present.

### 2. Active Butterworth Filter (First Order Low Pass)
Transfer Function:
$$H(s) = \\frac{A_F}{1 + s/\\omega_c}$$
Cutoff frequency:
$$f_c = \\frac{1}{2\\pi R C}$$
Passband voltage gain:
$$A_F = 1 + \\frac{R_F}{R_1}$$

### 3. Barkhausen Criteria for Oscillations
For sustained oscillations in feedback amplifier:
1. Loop gain magnitude $|A\\beta| = 1$.
2. Total loop phase shift around the feedback loop must be $0^\\circ$ or $360^\\circ$.

### 4. Wien Bridge Oscillator
Resonant frequency:
$$f_o = \\frac{1}{2\\pi R C}$$
Condition for oscillation: Amplifier gain $A_v \\ge 3$ ($R_F / R_1 \\ge 2$).`,
      tags: ['Op-Amp', 'Active Filters', 'Barkhausen', 'Oscillators', 'Imp Topic'],
      author: 'Electronics Eng Faculty',
    },
  ];

  for (const sample of sampleNotes) {
    const folderKey = `${sample.subjectId}:${sample.folderName}`;
    const targetFolderId = createdFolders[folderKey] || null;
    const blob = new Blob([sample.content], { type: sample.type });
    const ext = sample.name.split('.').pop() || 'md';

    const noteFile: NoteFile = {
      id: `file_${sample.subjectId}_${Math.random().toString(36).substring(2, 9)}`,
      name: sample.name,
      subjectId: sample.subjectId,
      folderId: targetFolderId,
      size: blob.size,
      type: sample.type,
      extension: ext,
      category: getFileCategory(sample.name, sample.type),
      tags: sample.tags,
      description: `Comprehensive study notes for ${sample.subjectId.toUpperCase()}`,
      author: sample.author,
      isStarred: true,
      createdAt: now - Math.floor(Math.random() * 86400000 * 2),
      updatedAt: now,
      blob,
    };

    fileStore.add(noteFile);
  }

  return new Promise((resolve) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

// Folders API
export async function getFolders(subjectId?: SubjectId): Promise<Folder[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('folders', 'readonly');
    const store = tx.objectStore('folders');

    if (subjectId) {
      const index = store.index('subjectId');
      const request = index.getAll(subjectId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    } else {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    }
  });
}

export async function createFolder(data: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Folder> {
  const db = await openDB();
  const folder: Folder = {
    ...data,
    id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('folders', 'readwrite');
    const store = tx.objectStore('folders');
    const request = store.add(folder);
    request.onsuccess = () => resolve(folder);
    request.onerror = () => reject(request.error);
  });
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('folders', 'readwrite');
    const store = tx.objectStore('folders');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      if (!getReq.result) {
        reject(new Error('Folder not found'));
        return;
      }
      const updated: Folder = {
        ...getReq.result,
        ...updates,
        updatedAt: Date.now(),
      };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve(updated);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['folders', 'files'], 'readwrite');
    const folderStore = tx.objectStore('folders');
    const fileStore = tx.objectStore('files');

    // Reassign files in this folder to root (folderId = null)
    const fileIndex = fileStore.index('folderId');
    const filesReq = fileIndex.getAll(id);

    filesReq.onsuccess = () => {
      const files: NoteFile[] = filesReq.result || [];
      for (const file of files) {
        file.folderId = null;
        fileStore.put(file);
      }
      folderStore.delete(id);
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Files API
export async function getFiles(subjectId?: SubjectId, folderId?: string | null): Promise<NoteFile[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly');
    const store = tx.objectStore('files');

    let request: IDBRequest;
    if (subjectId) {
      const index = store.index('subjectId');
      request = index.getAll(subjectId);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => {
      let results: NoteFile[] = request.result || [];
      if (folderId !== undefined) {
        results = results.filter((f) => f.folderId === folderId);
      }
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getFileById(id: string): Promise<NoteFile | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function uploadFile(
  fileData: Omit<NoteFile, 'id' | 'createdAt' | 'updatedAt' | 'size' | 'category' | 'extension'>,
  blob: Blob
): Promise<NoteFile> {
  if (blob.size > MAX_FILE_BYTES) {
    throw new Error(`File exceeds maximum size of 50 MB (current size: ${formatFileSize(blob.size)})`);
  }

  const db = await openDB();
  const ext = fileData.name.split('.').pop()?.toLowerCase() || '';
  const category = getFileCategory(fileData.name, fileData.type || blob.type);

  const noteFile: NoteFile = {
    ...fileData,
    id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    size: blob.size,
    category,
    extension: ext,
    blob,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const req = store.add(noteFile);
    req.onsuccess = () => resolve(noteFile);
    req.onerror = () => reject(req.error);
  });
}

const MAX_FILE_BYTES = MAX_FILE_SIZE_BYTES;

export async function deleteFile(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function toggleStar(id: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const file: NoteFile = getReq.result;
      if (!file) {
        reject(new Error('File not found'));
        return;
      }
      file.isStarred = !file.isStarred;
      file.updatedAt = Date.now();
      const putReq = store.put(file);
      putReq.onsuccess = () => resolve(file.isStarred);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function updateFile(id: string, updates: Partial<NoteFile>): Promise<NoteFile> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const file: NoteFile = getReq.result;
      if (!file) {
        reject(new Error('File not found'));
        return;
      }
      const updated: NoteFile = {
        ...file,
        ...updates,
        updatedAt: Date.now(),
      };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve(updated);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function moveFiles(fileIds: string[], targetFolderId: string | null, targetSubjectId?: SubjectId): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');

    let completed = 0;
    for (const id of fileIds) {
      const req = store.get(id);
      req.onsuccess = () => {
        const file: NoteFile = req.result;
        if (file) {
          file.folderId = targetFolderId;
          if (targetSubjectId) {
            file.subjectId = targetSubjectId;
          }
          file.updatedAt = Date.now();
          store.put(file);
        }
        completed++;
        if (completed === fileIds.length) {
          // All done
        }
      };
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Storage statistics
export async function getStorageStats(): Promise<StorageStats> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const req = store.getAll();

    req.onsuccess = () => {
      const files: NoteFile[] = req.result || [];
      let totalBytes = 0;
      const bySubject: Record<SubjectId, { bytes: number; count: number }> = {
        fee: { bytes: 0, count: 0 },
        c: { bytes: 0, count: 0 },
        physics: { bytes: 0, count: 0 },
        math1: { bytes: 0, count: 0 },
        math2: { bytes: 0, count: 0 },
        cg: { bytes: 0, count: 0 },
        cs: { bytes: 0, count: 0 },
        advance_electronics: { bytes: 0, count: 0 },
      };

      for (const f of files) {
        totalBytes += f.size || 0;
        if (bySubject[f.subjectId]) {
          bySubject[f.subjectId].bytes += f.size || 0;
          bySubject[f.subjectId].count += 1;
        }
      }

      resolve({
        totalBytes,
        fileCount: files.length,
        bySubject,
      });
    };
    req.onerror = () => reject(req.error);
  });
}

// Export / Import
export async function exportAllNotesAsJSON(): Promise<string> {
  const db = await openDB();
  const folders = await getFolders();
  const files = await getFiles();

  const serializedFiles = await Promise.all(
    files.map(async (f) => {
      let base64 = '';
      if (f.blob) {
        base64 = await blobToBase64(f.blob);
      }
      return {
        id: f.id,
        name: f.name,
        subjectId: f.subjectId,
        folderId: f.folderId,
        size: f.size,
        type: f.type,
        extension: f.extension,
        category: f.category,
        tags: f.tags,
        description: f.description,
        author: f.author,
        isStarred: f.isStarred,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        base64Data: base64,
      };
    })
  );

  return JSON.stringify(
    {
      version: 1,
      exportedAt: Date.now(),
      folders,
      files: serializedFiles,
    },
    null,
    2
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      resolve(res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export async function importNotesFromJSON(jsonString: string): Promise<{ foldersAdded: number; filesAdded: number }> {
  const data = JSON.parse(jsonString);
  if (!data || !Array.isArray(data.folders) || !Array.isArray(data.files)) {
    throw new Error('Invalid OmniNotes backup file structure');
  }

  const db = await openDB();
  const tx = db.transaction(['folders', 'files'], 'readwrite');
  const folderStore = tx.objectStore('folders');
  const fileStore = tx.objectStore('files');

  let foldersAdded = 0;
  for (const f of data.folders) {
    folderStore.put(f);
    foldersAdded++;
  }

  let filesAdded = 0;
  for (const fileItem of data.files) {
    let blob: Blob;
    if (fileItem.base64Data) {
      blob = dataURLtoBlob(fileItem.base64Data);
    } else {
      blob = new Blob([''], { type: fileItem.type || 'text/plain' });
    }

    const noteFile: NoteFile = {
      id: fileItem.id,
      name: fileItem.name,
      subjectId: fileItem.subjectId,
      folderId: fileItem.folderId,
      size: blob.size || fileItem.size,
      type: fileItem.type,
      extension: fileItem.extension,
      category: fileItem.category,
      tags: fileItem.tags || [],
      description: fileItem.description || '',
      author: fileItem.author || '',
      isStarred: !!fileItem.isStarred,
      createdAt: fileItem.createdAt || Date.now(),
      updatedAt: fileItem.updatedAt || Date.now(),
      blob,
    };
    fileStore.put(noteFile);
    filesAdded++;
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve({ foldersAdded, filesAdded });
    tx.onerror = () => reject(tx.error);
  });
}
