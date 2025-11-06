import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createWorkSchedule,
  getWorkSchedule,
  updateWorkSchedule,
  checkInWorker,
  checkOutWorker,
  getWorkerSessions,
  getWorkQRForWorker,
  getEventWorkSummary
} from '../controllers/workScheduleController.js';

const router = express.Router();

// Organizer routes
router.post('/', authenticate, authorize('organizer'), createWorkSchedule);
router.get('/:eventId', authenticate, getWorkSchedule);
router.put('/:eventId', authenticate, authorize('organizer'), updateWorkSchedule);
router.get('/:eventId/summary', authenticate, authorize('organizer'), getEventWorkSummary);

// Worker routes
router.post('/check-in', authenticate, authorize('worker'), checkInWorker);
router.post('/check-out', authenticate, authorize('worker'), checkOutWorker);
router.get('/:eventId/my-sessions', authenticate, authorize('worker'), getWorkerSessions);
router.get('/:eventId/qr', authenticate, authorize('worker'), getWorkQRForWorker);

export default router;