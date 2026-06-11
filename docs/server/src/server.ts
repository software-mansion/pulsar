import { PORT } from './config';
import { createApp } from './app';
import { ensureFigmaProjectsTable } from './figma-projects';
import { ensureFigmaOAuthTables } from './figma-oauth';

const { server } = createApp();

// Create the figma_projects + OAuth tables before accepting traffic. Fail fast
// on error so the orchestrator restarts us (and retries) rather than serving
// requests against a missing table after a transient DB hiccup at boot.
Promise.all([ensureFigmaProjectsTable(), ensureFigmaOAuthTables()])
  .then(() => start())
  .catch((err) => {
    console.error('Failed to initialize database tables:', err);
    process.exit(1);
  });

function start() {
  server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server is running on ws://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('\n📍 HTTP endpoints:');
  console.log(`   GET  http://localhost:${PORT}/create-channel`);
  console.log(`   POST http://localhost:${PORT}/broadcast`);
  console.log(`   POST http://localhost:${PORT}/figma-project`);
  console.log(`   PUT  http://localhost:${PORT}/figma-project/:token`);
  console.log(`   GET  http://localhost:${PORT}/figma-project/:token`);
  console.log('\n🔌 WebSocket (pairing):');
  console.log(`   ws://localhost:${PORT}/?type=sender|receiver&action=new_connection&code=<code>`);
  console.log(`   ws://localhost:${PORT}/?type=sender|receiver&action=reuse_connection&token=<token>`);
  console.log('='.repeat(50));
  });
}
