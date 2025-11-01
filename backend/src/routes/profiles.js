import express from 'express';
import multer from 'multer';
import {
  createOrUpdateProfile,
  getMyProfile,
  getProfile,
  uploadVideo,
  searchTalent
} from '../controllers/profileController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Specific routes first
router.get('/my-profile', authenticate, getMyProfile);
router.get('/search', authenticate, authorize('organizer'), searchTalent);
router.post('/video', authenticate, authorize('worker'), upload.single('video'), uploadVideo);

// General routes
router.post('/', authenticate, authorize('worker'), createOrUpdateProfile);

// Parameterized routes last
router.get('/:id', authenticate, getProfile);

export default router;