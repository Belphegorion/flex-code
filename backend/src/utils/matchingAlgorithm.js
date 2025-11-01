import Profile from '../models/Profile.js';
import Application from '../models/Application.js';

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const checkAvailabilityMatch = (availabilityWindows, jobStart, jobEnd) => {
  if (!availabilityWindows || availabilityWindows.length === 0) return 0.5;
  
  const jobDayOfWeek = new Date(jobStart).getDay();
  const jobStartHour = new Date(jobStart).getHours();
  const jobEndHour = new Date(jobEnd).getHours();
  
  const matchingWindow = availabilityWindows.find(w => {
    if (w.dayOfWeek !== jobDayOfWeek) return false;
    const [startH] = w.startTime.split(':').map(Number);
    const [endH] = w.endTime.split(':').map(Number);
    return jobStartHour >= startH && jobEndHour <= endH;
  });
  
  return matchingWindow ? 1 : 0;
};

const calculateRecencyBoost = (lastActiveDate) => {
  const daysSinceActive = (Date.now() - new Date(lastActiveDate)) / (1000 * 60 * 60 * 24);
  if (daysSinceActive <= 7) return 1.0;
  if (daysSinceActive <= 30) return 0.8;
  if (daysSinceActive <= 90) return 0.5;
  return 0.2;
};

const getPastPerformanceScore = async (proId, organizerId) => {
  const pastApps = await Application.find({
    proId,
    status: { $in: ['completed', 'no-show'] }
  }).populate('jobId');
  
  const withOrganizer = pastApps.filter(app => 
    app.jobId && app.jobId.organizerId.toString() === organizerId.toString()
  );
  
  if (withOrganizer.length > 0) {
    const completed = withOrganizer.filter(a => a.status === 'completed').length;
    return completed / withOrganizer.length;
  }
  
  return 0.5;
};

export const calculateMatchScores = async (jobs, proId) => {
  try {
    const profile = await Profile.findOne({ userId: proId }).populate('userId');
    if (!profile) return jobs;

    const scoredJobs = await Promise.all(jobs.map(async (job) => {
      let score = 0;
      const user = profile.userId;

      // Skill match (35%)
      const matchingSkills = job.requiredSkills.filter(skill =>
        profile.skills.includes(skill)
      );
      const skillScore = matchingSkills.length / job.requiredSkills.length;
      score += skillScore * 0.35;

      // Distance (15%)
      if (profile.location?.lat && job.location?.lat) {
        const distance = calculateDistance(
          profile.location.lat, profile.location.lng,
          job.location.lat, job.location.lng
        );
        const distanceScore = Math.max(0, 1 - (distance / 50));
        score += distanceScore * 0.15;
      } else {
        score += 0.075;
      }

      // Rating (15%)
      const ratingScore = user.ratingAvg / 5;
      score += ratingScore * 0.15;

      // Reliability score (15%)
      const reliabilityScore = user.reliabilityScore ?? 1.0;
      score += reliabilityScore * 0.15;

      // Availability windows (10%)
      const availScore = checkAvailabilityMatch(
        profile.availabilityWindows,
        job.dateStart,
        job.dateEnd
      );
      score += availScore * 0.1;

      // Past performance with organizer (10%)
      const perfScore = await getPastPerformanceScore(proId, job.organizerId);
      score += perfScore * 0.1;

      // Recency bias multiplier
      const recencyBoost = calculateRecencyBoost(user.lastActiveDate || new Date());
      score *= recencyBoost;

      return {
        ...job.toObject(),
        matchScore: Math.round(score * 100),
        matchingSkills
      };
    }));

    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    return scoredJobs;
  } catch (error) {
    console.error('Error calculating match scores:', error);
    return jobs;
  }
};

export const updateReliabilityScore = async (userId) => {
  const User = (await import('../models/User.js')).default;
  const user = await User.findById(userId);
  if (!user) return;

  const totalJobs = user.completedJobsCount + user.noShowCount;
  if (totalJobs === 0) {
    user.reliabilityScore = 1.0;
  } else {
    const completionRate = user.completedJobsCount / totalJobs;
    const noShowPenalty = Math.min(user.noShowCount * 0.1, 0.5);
    user.reliabilityScore = Math.max(0, Math.min(1, completionRate - noShowPenalty));
  }
  
  await user.save();
};