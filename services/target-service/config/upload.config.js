import multer from 'multer';
import path   from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename:    (_, file, cb) => {
    const name = Date.now() + '-' + Math.round(Math.random()*1e9) + path.extname(file.originalname);
    cb(null, name);
  }
});
const allowed = new Set(['image/jpeg','image/png','image/gif']);
const filter  = (_, file, cb) =>
  allowed.has(file.mimetype)
    ? cb(null,true)
    : cb(new Error('Alleen JPG, PNG of GIF toegestaan'), false);

export default multer({ storage, fileFilter: filter, limits: { fileSize: 5*1024*1024 }});
