import cron from 'node-cron';
import { checkBroadcastTimeouts } from './broadcastTimeout.js';
import { generateWeeklyPayouts } from './weeklyPayouts.js';
import { sendBookingReminders } from './reminders.js';
import { cleanExpiredTokens, cleanOldLogs } from './cleanup.js';
import { performDatabaseBackup } from './backup.js';
import { syncExchangeRates } from './rates.js';

export const initCronJobs = () => {
    console.log('Initializing Cron Jobs...');

    // 1. Service Request Timeout - Every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        await checkBroadcastTimeouts();
    });

    // 2. Weekly Payouts - Every Sunday at Midnight
    cron.schedule('0 0 * * 0', async () => {
        await generateWeeklyPayouts();
    });

    // 3. Daily Reminders - Every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        await sendBookingReminders();
    });

    // 4. System Cleanup - Every day at 3:00 AM
    cron.schedule('0 3 * * *', async () => {
        await cleanExpiredTokens();
        await cleanOldLogs();
    });

    // 5. Database Backup - Every day at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        await performDatabaseBackup();
    });

    // 6. Exchange Rates - Every hour
    cron.schedule('0 * * * *', async () => {
        await syncExchangeRates();
    });
    
    // Run immediate startup tasks
    syncExchangeRates(); 
};