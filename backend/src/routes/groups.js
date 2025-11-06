import express from 'express';
import { body } from 'express-validator';
import {
  createGroup,
  getGroups,
  getGroup,
  sendGroupMessage,
  addMembers,
  removeMember,
  leaveGroup,
  transferOwnership,
  scheduleGroupSession,
  joinGroupByQR,
  shareWorkQRInGroup,
  getGroupQR
} from '../controllers/groupChatController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticate, [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('participants').isArray().withMessage('Participants must be an array'),
  validate
], createGroup);

router.get('/', authenticate, getGroups);
router.get('/:id', authenticate, getGroup);

router.post('/:id/message', authenticate, [
  body('text').trim().notEmpty().withMessage('Message text is required'),
  validate
], sendGroupMessage);

router.post('/:id/members', authenticate, [
  body('userIds').isArray({ min: 1 }).withMessage('At least one user ID required'),
  validate
], addMembers);

router.delete('/:id/members/:userId', authenticate, removeMember);
router.put('/:id/leave', authenticate, leaveGroup);
router.put('/:id/transfer', authenticate, [
  body('newOwnerId').notEmpty().withMessage('New owner ID is required'),
  validate
], transferOwnership);

router.post('/:id/schedule', authenticate, [
  body('sessionDate').notEmpty().withMessage('Session date is required'),
  body('sessionTime').notEmpty().withMessage('Session time is required'),
  validate
], scheduleGroupSession);

router.post('/join-qr', authenticate, [
  body('qrData').notEmpty().withMessage('QR data is required'),
  validate
], joinGroupByQR);

router.post('/:groupId/share-work-qr', authenticate, shareWorkQRInGroup);
router.get('/:id/qr', authenticate, getGroupQR);

export default router;
