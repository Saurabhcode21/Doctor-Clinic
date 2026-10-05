const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('🏥 Starting Doctor Clinic & Live Queue Management System');
console.log('================================================================');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Start Server on port 5000
const server = spawn(npmCmd, ['start'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// 2. Start Client on port 5173
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  server.kill();
  client.kill();
  process.exit();
});
