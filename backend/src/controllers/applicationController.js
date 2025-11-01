import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { scheduleReliabilityUpdate, scheduleJobReminder } from '../utils/jobQueue.js';

export const applyToJob = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.id;

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      proId: req.userId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    // Create application
    const application = await Application.create({
      jobId,
      proId: req.userId,
      coverLetter
    });

    // Add to job applicants
    job.applicants.push({
      proId: req.userId,
      appliedAt: new Date(),
      status: 'pending'
    });
    await job.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Error applying to job', error: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ proId: req.userId })
      .populate('jobId', 'title dateStart dateEnd location payPerPerson status')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

export const acceptApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify organizer owns the job
    if (application.jobId.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = 'accepted';
    await application.save();

    // Schedule reminder 24h before job
    const job = application.jobId;
    const timeUntilJob = new Date(job.dateStart) - Date.now();
    if (timeUntilJob > 24 * 60 * 60 * 1000) {
      scheduleJobReminder(job._id, 'pre-job', timeUntilJob - 24 * 60 * 60 * 1000);
    }

    res.json({ message: 'Application accepted', application });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting application', error: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { jobId, type, location } = req.body;

    const application = await Application.findOne({
      jobId,
      proId: req.userId,
      status: 'accepted'
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found or not accepted' });
    }

    application.checkInTimestamps.push({
      type,
      timestamp: new Date(),
      location
    });

    // Calculate hours worked if check-out
    if (type === 'check-out') {
      const checkIns = application.checkInTimestamps.filter(t => t.type === 'check-in');
      const checkOuts = application.checkInTimestamps.filter(t => t.type === 'check-out');
      
      if (checkIns.length === checkOuts.length) {
        let totalHours = 0;
        for (let i = 0; i < checkIns.length; i++) {
          const diff = checkOuts[i].timestamp - checkIns[i].timestamp;
          totalHours += diff / (1000 * 60 * 60);
        }
        application.hoursWorked = totalHours;
        application.status = 'completed';
        
        // Update reliability score
        scheduleReliabilityUpdate(req.userId, 'completed');
      }
    }

    await application.save();

    res.json({ message: 'Check-in recorded', application });
  } catch (error) {
    res.status(500).json({ message: 'Error recording check-in', error: error.message });
  }
};