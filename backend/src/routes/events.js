import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import {
  createEvent,
  uploadTicketImage,
  startVideoCall,
  endVideoCall,
  verifyQRAccess,
  getOrganizerEvents,
  getEventDetails,
  updateEvent,
  updateTickets,
  addExpense,
  deleteExpense,
  getFinancials,
  getFinancialSummary,
  addEstimatedExpense,
  deleteEstimatedExpense,
  updateWorkerCosts,
  getActiveEvents
} from '../controllers/eventController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Specific routes first (before parameterized routes)
router.get('/active/live', authenticate, getActiveEvents);
router.get('/financials/summary', authenticate, getFinancialSummary);
router.post('/video-call/verify', authenticate, verifyQRAccess);

// General routes
router.post('/', authenticate, createEvent);
router.get('/', authenticate, getOrganizerEvents);

// Parameterized routes
router.get('/:eventId', authenticate, getEventDetails);
router.put('/:eventId', authenticate, updateEvent);
router.post('/:eventId/ticket', authenticate, upload.single('ticket'), uploadTicketImage);
router.post('/:eventId/video-call/start', authenticate, startVideoCall);
router.post('/:eventId/video-call/end', authenticate, endVideoCall);
router.put('/:eventId/tickets', authenticate, updateTickets);
router.post('/:eventId/expenses', authenticate, addExpense);
router.delete('/:eventId/expenses/:expenseId', authenticate, deleteExpense);
router.get('/:eventId/financials', authenticate, getFinancials);
router.post('/:eventId/estimated-expenses', authenticate, addEstimatedExpense);
router.delete('/:eventId/estimated-expenses/:expenseId', authenticate, deleteEstimatedExpense);
router.put('/:eventId/worker-costs', authenticate, updateWorkerCosts);

export default router;
