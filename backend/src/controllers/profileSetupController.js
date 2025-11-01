import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Sponsor from '../models/Sponsor.js';

export const getProfileSetupStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('profileCompleted role');
    
    let profileData = null;
    if (user.role === 'worker' || user.role === 'pro') {
      profileData = await Profile.findOne({ userId: req.userId });
    } else if (user.role === 'sponsor') {
      profileData = await Sponsor.findOne({ userId: req.userId });
    }

    res.json({
      profileCompleted: user.profileCompleted,
      role: user.role,
      hasProfile: !!profileData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile status', error: error.message });
  }
};

export const completeWorkerProfile = async (req, res) => {
  try {
    const { skills, bio, location, availability, hourlyRate, experience, portfolioLinks } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      {
        skills,
        bio,
        location,
        availability,
        hourlyRate,
        experience,
        portfolioLinks: portfolioLinks || []
      },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(req.userId, { profileCompleted: true });

    res.json({ message: 'Profile completed successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error completing profile', error: error.message });
  }
};

export const completeOrganizerProfile = async (req, res) => {
  try {
    const { companyName, industry, website, bio } = req.body;

    await User.findByIdAndUpdate(req.userId, { 
      profileCompleted: true,
      name: companyName || req.user.name
    });

    res.json({ message: 'Organizer profile completed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error completing profile', error: error.message });
  }
};

export const completeSponsorProfile = async (req, res) => {
  try {
    const { companyName, industry, website, sponsorshipBudget, interestedCategories } = req.body;

    const sponsor = await Sponsor.findOneAndUpdate(
      { userId: req.userId },
      {
        companyName,
        industry,
        website,
        sponsorshipBudget,
        interestedCategories: interestedCategories || []
      },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(req.userId, { profileCompleted: true });

    res.json({ message: 'Sponsor profile completed successfully', sponsor });
  } catch (error) {
    res.status(500).json({ message: 'Error completing profile', error: error.message });
  }
};

export const updateProfilePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;

    await User.findByIdAndUpdate(req.userId, { profilePhoto: photoUrl });

    res.json({ message: 'Profile photo updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating photo', error: error.message });
  }
};
