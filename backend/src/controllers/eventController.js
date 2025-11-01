import Event from '../models/Event.js';
import cloudinary from '../config/cloudinary.js';
import QRCode from 'qrcode';

export const createEvent = async (req, res) => {
  try {
    const { title, description, location, dateStart, dateEnd, workers } = req.body;

    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can create events' });
    }

    const event = await Event.create({
      title,
      description,
      organizerId: req.userId,
      location,
      dateStart,
      dateEnd,
      workers: workers || []
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

export const uploadTicketImage = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old image if exists
    if (event.ticketImage?.publicId) {
      await cloudinary.uploader.destroy(event.ticketImage.publicId);
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'event-tickets',
      resource_type: 'image'
    });

    event.ticketImage = {
      url: result.secure_url,
      publicId: result.public_id
    };
    await event.save();

    res.json({ message: 'Ticket image uploaded', ticketImage: event.ticketImage });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading ticket', error: error.message });
  }
};

export const startVideoCall = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const videoCallId = `call_${eventId}_${Date.now()}`;
    const qrData = JSON.stringify({
      eventId: event._id,
      videoCallId,
      type: 'video-call-access'
    });

    const qrCode = await QRCode.toDataURL(qrData);

    event.videoCallActive = true;
    event.videoCallId = videoCallId;
    event.qrCode = qrCode;
    await event.save();

    // Notify via socket
    const io = req.app.get('io');
    io.to(`event_${eventId}`).emit('video-call-started', { videoCallId, qrCode });

    res.json({ message: 'Video call started', videoCallId, qrCode });
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
    event.qrCode = null;
    await event.save();

    const io = req.app.get('io');
    io.to(`event_${eventId}`).emit('video-call-ended');

    res.json({ message: 'Video call ended' });
  } catch (error) {
    res.status(500).json({ message: 'Error ending video call', error: error.message });
  }
};

export const verifyQRAccess = async (req, res) => {
  try {
    const { qrData } = req.body;
    const data = JSON.parse(qrData);

    const event = await Event.findById(data.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.videoCallActive || event.videoCallId !== data.videoCallId) {
      return res.status(403).json({ message: 'Video call not active or invalid QR' });
    }

    const isWorker = event.workers.some(w => w.toString() === req.userId.toString());
    const isOrganizer = event.organizerId.toString() === req.userId.toString();

    if (!isWorker && !isOrganizer) {
      return res.status(403).json({ message: 'Not authorized to join this call' });
    }

    res.json({ 
      message: 'Access granted', 
      videoCallId: event.videoCallId,
      eventTitle: event.title 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying access', error: error.message });
  }
};

export const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.userId })
      .populate('workers', 'name email')
      .sort({ dateStart: -1 });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

export const getEventDetails = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('organizerId', 'name email')
      .populate('workers', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isOrganizer = event.organizerId._id.toString() === req.userId.toString();
    const isWorker = event.workers.some(w => w._id.toString() === req.userId.toString());

    if (!isOrganizer && !isWorker) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    Object.assign(event, updates);
    await event.save();

    res.json({ message: 'Event updated', event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
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

    event.expenses.push({ category, description, amount });
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

    event.expenses = event.expenses.filter(e => e._id.toString() !== expenseId);
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

    const totalExpenses = event.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = event.revenue - totalExpenses;

    res.json({
      revenue: event.revenue,
      totalExpenses,
      netProfit,
      tickets: event.tickets,
      expenses: event.expenses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financials', error: error.message });
  }
};

export const getFinancialSummary = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.userId });

    const summary = events.reduce((acc, event) => {
      const totalExpenses = event.expenses.reduce((sum, e) => sum + e.amount, 0);
      const netProfit = event.revenue - totalExpenses;
      
      return {
        totalRevenue: acc.totalRevenue + event.revenue,
        totalExpenses: acc.totalExpenses + totalExpenses,
        totalProfit: acc.totalProfit + netProfit
      };
    }, { totalRevenue: 0, totalExpenses: 0, totalProfit: 0 });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
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
    
    const totalEstimatedExpenses = event.estimatedExpenses.reduce((sum, e) => sum + e.estimatedAmount, 0);
    const totalWorkerCost = event.workerCosts.totalWorkerCost || 0;
    const totalCost = totalEstimatedExpenses + totalWorkerCost;
    event.estimatedProfit = (event.tickets.totalDispersed * event.tickets.pricePerTicket) - totalCost;
    
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

    event.estimatedExpenses = event.estimatedExpenses.filter(e => e._id.toString() !== expenseId);
    
    const totalEstimatedExpenses = event.estimatedExpenses.reduce((sum, e) => sum + e.estimatedAmount, 0);
    const totalWorkerCost = event.workerCosts.totalWorkerCost || 0;
    const totalCost = totalEstimatedExpenses + totalWorkerCost;
    event.estimatedProfit = (event.tickets.totalDispersed * event.tickets.pricePerTicket) - totalCost;
    
    await event.save();

    res.json({ message: 'Estimated expense deleted', event });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting estimated expense', error: error.message });
  }
};

export const updateWorkerCosts = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { totalWorkers, costPerWorker } = req.body;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    event.workerCosts = {
      totalWorkers,
      costPerWorker,
      totalWorkerCost: totalWorkers * costPerWorker
    };
    
    const totalEstimatedExpenses = event.estimatedExpenses.reduce((sum, e) => sum + e.estimatedAmount, 0);
    const totalCost = totalEstimatedExpenses + event.workerCosts.totalWorkerCost;
    event.estimatedProfit = (event.tickets.totalDispersed * event.tickets.pricePerTicket) - totalCost;
    
    await event.save();

    res.json({ message: 'Worker costs updated', event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating worker costs', error: error.message });
  }
};

export const getActiveEvents = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({
      organizerId: req.userId,
      dateStart: { $lte: now },
      dateEnd: { $gte: now },
      status: { $in: ['upcoming', 'ongoing'] }
    }).populate('workers', 'name email').sort({ dateStart: -1 });

    const eventsWithCalculations = events.map(event => {
      const actualExpenses = event.expenses.reduce((sum, e) => sum + e.amount, 0);
      const workerCost = event.workers.length * (event.workerCosts.costPerWorker || 0);
      const totalExpenses = actualExpenses + workerCost;
      const netProfit = event.revenue - totalExpenses;

      return {
        ...event.toObject(),
        calculatedFinancials: {
          actualExpenses,
          workerCost,
          totalExpenses,
          netProfit
        }
      };
    });

    res.json({ events: eventsWithCalculations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active events', error: error.message });
  }
};
