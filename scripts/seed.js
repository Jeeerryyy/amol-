import { seedDatabase } from '../server/db/seed.js';

seedDatabase()
  .then(() => {
    console.log('[Seed] Database seed completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
