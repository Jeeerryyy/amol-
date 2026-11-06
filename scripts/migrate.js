import { runMigrations } from '../server/db/migrations.js';

runMigrations()
  .then(() => {
    console.log('[Migration] Database migrations completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Migration Error]', err);
    process.exit(1);
  });

