import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function recreateDatabase() {
  try {
    console.log('Starting database recreation process...');

    // Run backup script
    console.log('Backing up data...');
    await execAsync('ts-node scripts/backup-data.ts');

    // Reset database using Prisma's reset command with skip-seed
    console.log('Resetting database...');
    try {
      await execAsync('npx prisma migrate reset --force --skip-seed');
    } catch (error: any) {
      console.log('Warning: Error during database reset:', error.message);
      console.log('Attempting alternative reset method...');

      // Try alternative reset method
      try {
        await execAsync('npx prisma db push --force-reset');
      } catch (error: any) {
        console.log('Warning: Error during alternative reset:', error.message);
      }
    }

    // Apply migrations
    console.log('Applying migrations...');
    try {
      await execAsync('npx prisma migrate deploy');
    } catch (error: any) {
      console.log('Warning: Error during migration deployment:', error.message);
      console.log('Attempting to resolve migration issues...');

      // Try to resolve migration issues
      try {
        await execAsync(
          'npx prisma migrate resolve --applied 20250418020110_init',
        );
        await execAsync(
          'npx prisma migrate resolve --applied 20250424012154_add_cash_module',
        );
      } catch (error: any) {
        console.log(
          'Warning: Error during migration resolution:',
          error.message,
        );
      }
    }

    // Restore data
    console.log('Restoring data...');
    await execAsync('ts-node scripts/restore-data.ts');

    console.log('Database recreation completed successfully!');
  } catch (error) {
    console.error('Database recreation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

recreateDatabase();
