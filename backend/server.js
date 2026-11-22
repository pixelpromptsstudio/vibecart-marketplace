// VibeCart Backend - Direct Node Launcher
// Allows running "node server.js" directly from the backend folder

try {
  // Try loading TypeScript source directly via ts-node
  require('ts-node/register');
  require('./src/server.ts');
} catch (err) {
  // Fallback to compiled output if dist exists
  try {
    require('./dist/server.js');
  } catch (distErr) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}
