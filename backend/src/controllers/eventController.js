import Event from '../models/Event.js';
import Job from '../models/Job.js';
import WorkSession from '../models/WorkSession.js';
import { calculateBadge } from '../utils/badgeSystem.js';

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      organizerId: req.userId
    });
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

export const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.userId })
      .sort({ createdAt: -1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

export const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.eventId, organizerId: req.userId },
      req.body,
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

export const getActiveEvents = async (req, res) => {
  try {
    const events = await Event.find({
      dateStart: { $lte: new Date() },
      dateEnd: { $gte: new Date() }
    }).sort({ dateStart: 1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active events', error: error.message });
  }
};

export const uploadTicketImage = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    // In a real implementation, upload to cloudinary
    event.ticketImage = {
      url: `/uploads/${req.file.filename}`,
      publicId: req.file.filename
    };
    
    await event.save();
    
    res.json({ message: 'Ticket image uploaded', event });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading ticket image', error: error.message });
  }
};

export const startVideoCall = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    event.videoCallActive = true;
    event.videoCallId = `call_${eventId}_${Date.now()}`;
    await event.save();
    
    res.json({ message: 'Video call started', videoCallId: event.videoCallId });
  } catch (error) {
    res.status(500).json({ message: 'Error starting video call', error: error.message });
  }
};

export const endVideoCall = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    event.videoCallActive = false;
    event.videoCallId = null;
    await event.save();
    
    res.json({ message: 'Video call ended' });
  } catch (error) {
    res.status(500).json({ message: 'Error ending video call', error: error.message });
  }
};

export const verifyQRAccess = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    // Parse QR data and verify access
    const event = await Event.findById(qrData);
    if (!event) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }
    
    res.json({ message: 'Access verified', event });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying QR access', error: error.message });
  }
};

export const updateTickets = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { totalDispersed, totalSold, pricePerTicket } = req.body;
    
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    event.tickets = { totalDispersed, totalSold, pricePerTicket };
    event.revenue = totalSold * pricePerTicket;
    await event.save();
    
    res.json({ message: 'Tickets updated', event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating tickets', error: error.message });
  }
};

export const addExpense = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { category, description, amount } = req.body;
    
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    event.expenses.push({ category, description, amount, date: new Date() });
    await event.save();
    
    res.json({ message: 'Expense added', event });
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense', error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { eventId, expenseId } = req.params;
    
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    event.expenses.id(expenseId).remove();
    await event.save();
    
    res.json({ message: 'Expense deleted', event });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
};

export const getFinancials = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const totalExpenses = event.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = event.revenue - totalExpenses;
    
    res.json({ 
      revenue: event.revenue,
      expenses: event.expenses,
      totalExpenses,
      profit,
      tickets: event.tickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financials', error: error.message });
  }
};

export const getFinancialSummary = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.userId });
    
    const summary = events.reduce((acc, event) => {
      const totalExpenses = event.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      acc.totalRevenue += event.revenue || 0;
      acc.totalExpenses += totalExpenses;
      acc.totalProfit += (event.revenue || 0) - totalExpenses;
      return acc;
    }, { totalRevenue: 0, totalExpenses: 0, totalProfit: 0 });
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial summary', error: error.message });
  }
};

export const addEstimatedExpense = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { category, description, estimatedAmount } = req.body;
    
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    event.estimatedExpenses.push({ category, description, estimatedAmount });
    await event.save();
    
    res.json({ message: 'Estimated expense added', event });
  } catch (error) {
    res.status(500).json({ message: 'Error adding estimated expense', error: error.message });
  }
};

export const deleteEstimatedExpense = async (req, res) => {
  try {
    const { eventId, expenseId } = req.params;
    
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    event.estimatedExpenses.id(expenseId).remove();
    await event.save();
    
    res.json({ message: 'Estimated expense deleted', event });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting estimated expense', error: error.message });
  }
};

export const getEventWorkers = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get all jobs for this event
    const jobs = await Job.find({ eventId })
      .populate('hiredPros', 'name email profilePhoto');

    // Get all unique workers
    const allWorkers = [];
    const workerIds = new Set();
    
    jobs.forEach(job => {
      job.hiredPros.forEach(worker => {
        if (!workerIds.has(worker._id.toString())) {
          workerIds.add(worker._id.toString());
          allWorkers.push({
            ...worker.toObject(),
            jobTitle: job.title
          });
        }
      });
    });

    // Calculate badges for all workers
    const workerSessions = await WorkSession.find({ 
      workerId: { $in: Array.from(workerIds) }, 
      status: 'checked-out' 
    });
    
    const workersWithBadges = allWorkers.map(worker => {
      const sessions = workerSessions.filter(s => s.workerId.toString() === worker._id.toString());
      const totalHours = sessions.reduce((sum, session) => sum + session.totalHours, 0);
      const eventIds = [...new Set(sessions.map(session => session.eventId.toString()))];
      const badge = calculateBadge(totalHours, eventIds.length);
      
      return {
        ...worker,
        badge,
        totalHours: Math.round(totalHours * 100) / 100,
        totalEvents: eventIds.length
      };
    });

    res.json({ 
      workers: workersWithBadges,
      totalWorkers: workersWithBadges.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event workers', error: error.message });
  }
};