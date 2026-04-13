const fs = require('fs');
const path = require('path');
const db = require('../db/client');

async function run() {
  const migrationsDir = __dirname;
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await db.query(sql);
    console.log(`Migration aplicada: ${file}`);
  }

  await db.pool.end();
}

run().catch(async (err) => {
  console.error('Falha ao aplicar migrations:', err);
  await db.pool.end();
  process.exit(1);
});
