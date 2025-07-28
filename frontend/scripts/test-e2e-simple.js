import { spawn } from 'child_process';

console.log('🧪 Executing E2E tests with simplified setup...');

// Start the frontend development server
const frontendProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true,
  cwd: process.cwd()
});

let serverPort = 5173;

frontendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Extract port from Vite output
  const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
  if (portMatch) {
    serverPort = parseInt(portMatch[1]);
    console.log(`✅ Frontend server started on port ${serverPort}`);
    
    // Wait a bit and then run Cypress
    setTimeout(() => {
      runCypressTests();
    }, 3000);
  }
});

frontendProcess.stderr.on('data', (data) => {
  console.error('Frontend error:', data.toString());
});

function runCypressTests() {
  console.log('🧪 Running Cypress tests...');
  
  const cypressProcess = spawn('npx', ['cypress', 'run', '--config', `baseUrl=http://localhost:${serverPort}`], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  cypressProcess.on('close', (code) => {
    console.log(`Cypress tests finished with code ${code}`);
    frontendProcess.kill('SIGTERM');
    process.exit(code);
  });

  cypressProcess.on('error', (error) => {
    console.error('Cypress error:', error);
    frontendProcess.kill('SIGTERM');
    process.exit(1);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  frontendProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  frontendProcess.kill('SIGTERM');
  process.exit(0);
}); 