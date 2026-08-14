import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';
    if (file.fieldname === 'resume') {
      folder = path.resolve(process.cwd(), 'uploads', 'resumes');
    } else if (file.fieldname === 'avatar') {
      folder = path.resolve(process.cwd(), 'uploads', 'avatars');
    }
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      const allowed = ['.pdf', '.doc', '.docx'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and Word documents are allowed for resumes'));
      }
    } else if (file.fieldname === 'avatar') {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (JPG, PNG, WebP) are allowed for avatars'));
      }
    } else {
      cb(null, true);
    }
  },
});
