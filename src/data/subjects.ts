import { SubjectId, SubjectInfo } from '../types';

export const SUBJECTS: Record<SubjectId, SubjectInfo> = {
  fee: {
    id: 'fee',
    name: 'Fundamentals of Electrical Engineering',
    code: 'EE 401',
    shortName: 'FEE',
    description: 'DC/AC Circuit Analysis, Kirchhoff laws, Network Theorems, AC Resonance, Transformers & DC Machines.',
    color: '#0284C7', // Sky
    accentClass: 'bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    topics: ['DC Circuit Analysis', 'Thevenin & Norton', 'AC Single Phase', '3-Phase Systems', 'Magnetic Circuits', 'Transformers'],
  },
  c: {
    id: 'c',
    name: 'C Programming',
    code: 'CT 401',
    shortName: 'C',
    description: 'Structured programming, pointers, dynamic memory allocation, structures, file handling, and algorithms.',
    color: '#0D9488', // Teal
    accentClass: 'bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    topics: ['Control Structures', 'Functions & Recursion', 'Pointers & Arrays', 'Structures & Unions', 'File I/O', 'Memory Allocation'],
  },
  physics: {
    id: 'physics',
    name: 'Engineering Physics',
    code: 'SH 402',
    shortName: 'Physics',
    description: 'Wave optics, interference, diffraction, polarization, lasers, fiber optics, electromagnetism, and quantum physics.',
    color: '#6366F1', // Indigo
    accentClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    topics: ['Wave Motion & Optics', 'Interference & Diffraction', 'Lasers & Fiber Optics', 'Electromagnetism', 'Quantum Physics', 'Solid State'],
  },
  math1: {
    id: 'math1',
    name: 'Engineering Mathematics I',
    code: 'SH 401',
    shortName: 'Math I',
    description: 'Differential and integral calculus, infinite series, Taylor series, partial derivatives, and analytical geometry.',
    color: '#E11D48', // Rose
    accentClass: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    topics: ['Differential Calculus', 'Taylor & Maclaurin Series', 'Partial Derivatives', 'Multiple Integrals', 'Vector Calculus', 'Coordinate Geometry'],
  },
  math2: {
    id: 'math2',
    name: 'Engineering Mathematics II',
    code: 'SH 451',
    shortName: 'Math II',
    description: 'Linear algebra, matrices, eigenvalues & eigenvectors, ordinary differential equations, and Laplace transforms.',
    color: '#D97706', // Amber
    accentClass: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    topics: ['Linear Algebra & Matrices', 'Eigenvalues & Vectors', '1st & 2nd Order ODEs', 'Laplace Transforms', 'Fourier Series', 'PDE Basics'],
  },
  cg: {
    id: 'cg',
    name: 'Computer Graphics',
    code: 'CT 501',
    shortName: 'CG',
    description: 'Rasterization, Bresenham & DDA algorithms, 2D/3D transformations, viewing pipeline, clipping, and rendering.',
    color: '#8B5CF6', // Purple
    accentClass: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    topics: ['Scan Conversion (DDA/Bresenham)', '2D/3D Transformations', 'Viewing & Cohen-Sutherland Clipping', 'Visible Surface Detection', 'Illumination & Shading', 'OpenGL Pipeline'],
  },
  cs: {
    id: 'cs',
    name: 'Computer Systems',
    code: 'EX 501',
    shortName: 'CS',
    description: 'Digital logic design, Karnaugh maps, sequential circuits, CPU architecture, memory hierarchy, and instruction sets.',
    color: '#059669', // Emerald
    accentClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    topics: ['Combinational Logic & K-Maps', 'Sequential Circuits & Flip-Flops', 'Registers & Counters', 'ALU & CPU Architecture', 'Instruction Cycles', 'Cache & Memory Hierarchy'],
  },
  advance_electronics: {
    id: 'advance_electronics',
    name: 'Advance Electronics',
    code: 'EX 551',
    shortName: 'Advance Electronics',
    description: 'Operational amplifiers (Op-Amps), active filters, feedback amplifiers, oscillators, 555 timers, and power devices.',
    color: '#EA580C', // Orange
    accentClass: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    topics: ['Op-Amp Characteristics & Circuits', 'Active Filters (Butterworth/Chebyshev)', 'Feedback Amplifiers', 'Sinusoidal Oscillators', '555 Timer & Multivibrators', 'Voltage Regulators & MOSFETs'],
  },
};

export const SUBJECT_LIST = Object.values(SUBJECTS);

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB = 52,428,800 bytes
export const MAX_FILE_SIZE_MB = 50;

export const STANDARD_DEFAULT_FOLDERS = [
  'Lecture Notes & Slides',
  'Tutorials & Numericals',
  'Past Exam Questions & Solutions',
  'Lab Manuals & Code',
  'Formula Sheets & Quick Guides',
];
