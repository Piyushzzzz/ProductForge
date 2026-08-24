import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ENV } from './env.js';

if (!fs.existsSync(ENV.UPLOAD_DIR)) {
  fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
}

// ─── SECURITY: File Type Allowlist ──────────────────────────────────────────
// Only permit known safe binary and archive extensions.
// This prevents upload of executable scripts, HTML (XSS), or MIME-confusion attacks.
const ALLOWED_EXTENSIONS = new Set([
  '.zip', '.tar', '.gz', '.tgz', '.bz2', '.7z',  // Archives
  '.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm',  // Installers
  '.jar', '.war', '.ear',                           // Java
  '.vsix', '.nupkg',                                // VS Extension / NuGet
  '.whl', '.egg',                                   // Python packages
  '.ipa', '.apk', '.aab',                          // Mobile apps
  '.pdf', '.txt', '.md',                            // Docs
]);

const ALLOWED_MIME_PREFIXES = [
  'application/zip',
  'application/x-tar',
  'application/gzip',
  'application/x-7z-compressed',
  'application/x-bzip2',
  'application/java-archive',
  'application/vnd.',
  'application/octet-stream',
  'text/plain',
  'application/pdf',
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ENV.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    // Strip any dangerous characters from the stored filename
    const safeName = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, safeName);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIME_PREFIXES.some(p => file.mimetype.startsWith(p));
  const extOk = ALLOWED_EXTENSIONS.has(ext);

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error(`File type not permitted. Allowed extensions: ${[...ALLOWED_EXTENSIONS].join(', ')}`));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1  // Only one file per request
  },
  fileFilter
});
