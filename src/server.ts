import { PORT } from './config';
import { createApp } from './app';

const { server } = createApp();

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server is running on ws://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('\n📍 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/data?id=<id>`);
  console.log(`   POST http://localhost:${PORT}/api/message`);
  console.log(`   POST http://localhost:${PORT}/api/broadcast`);
  console.log('\n🔌 WebSocket:');
  console.log(`   Connect to: ws://localhost:${PORT}`);
  console.log(`   Send JSON: {"message": "hello", "broadcast": true}`);
  console.log('='.repeat(50));
});
