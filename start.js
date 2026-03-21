const { spawn } = require('child_process');
const path = require('path');

// Sobe o server.js
const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'fitway-backend'),
  stdio: 'inherit',
  shell: true
});

// Sobe o Expo com todos os argumentos passados (ex: -c)
const expoArgs = process.argv.slice(2);
const expo = spawn('npx', ['expo', 'start', ...expoArgs], {
  stdio: 'inherit',
  shell: true
});

server.on('close', (code) => console.log(`Server encerrado com código ${code}`));
expo.on('close', (code) => console.log(`Expo encerrado com código ${code}`));