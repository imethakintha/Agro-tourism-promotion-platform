import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export const performDatabaseBackup = async () => {
  console.log('Starting database backup...');

  // Ensure backup directory exists
  const backupDir = path.join(process.cwd(), 'backups', 'mongodb');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const date = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `agrolk-backup-${date}`);
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/agrolk';

  // Command to dump database (requires mongodump installed on system/container)
  const cmd = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.warn(`Backup failed (mongodump might not be installed): ${error.message}`);
      return;
    }
    console.log(`Backup successful at ${backupPath}`);
  });
};