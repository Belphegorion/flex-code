import cron from 'node-cron';
import User from '../models/User.js';
import { updateReliabilityScore } from './matchingAlgorithm.js';

export const startScheduledJobs = () => {
  // Run daily reliability score updates at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily reliability score updates...');
    
    try {
      const users = await User.find({ role: 'worker' });
      
      for (const user of users) {
        await updateReliabilityScore(user._id);
      }
      
      console.log(`Updated reliability scores for ${users.length} pros`);
    } catch (error) {
      console.error('Error in scheduled reliability update:', error);
    }
  });

  console.log('Scheduled jobs initialized');
};
