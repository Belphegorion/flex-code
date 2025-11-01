import express from 'express';
import { body } from 'express-validator';
import {
  applyToJob,
  getMyApplications,
  acceptApplication,
  checkIn
} from '../controllers/applicationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Specific routes first
router.get('/my-applications', authenticate, authorize('worker'), getMyApplications);

router.post('/check-in', authenticate, authorize('worker'), [
  body('jobId').notEmpty().withMessage('Job ID required'),
  body('type').isIn(['check-in', 'check-out']).withMessage('Type must be check-in or check-out'),
  body('location.lat').optional().isNumeric(),
  body('location.lng').optional().isNumeric(),
  validate
], checkIn);

// Parameterized routes
router.post('/:id/apply', authenticate, authorize('worker'), [
  body('coverLetter').optional().isLength({ max: 1000 }),
  validate
], applyToJob);

router.post('/:id/accept', authenticate, authorize('organizer'), acceptApplication);

export default router;
