import express from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadAadhaar, getDocumentStatus } from '../controllers/documentController.js';

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post('/aadhaar', authenticate, authorize('worker'), upload.single('aadhaar'), uploadAadhaar);
router.get('/status', authenticate, authorize('worker'), getDocumentStatus);

export default router;