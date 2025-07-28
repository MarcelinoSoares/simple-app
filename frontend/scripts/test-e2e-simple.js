import { spawn } from 'child_process';

console.log('🧪 Executing E2E tests with simplified setup...');

// Start the frontend development server
const frontendProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true,
  cwd: process.cwd()
});

let serverPort = 5173;
let serverStarted = false;

// Set a timeout for server startup
const serverTimeout = setTimeout(() => {
  if (!serverStarted) {
    console.log('⚠️  Server startup timeout, running tests directly...');
    runCypressTestsDirect();
  }
}, 30000); // 30 seconds timeout

frontendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Extract port from Vite output
  const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
  if (portMatch && !serverStarted) {
    serverPort = parseInt(portMatch[1]);
    serverStarted = true;
    console.log(`✅ Frontend server started on port ${serverPort}`);
    
    // Clear the timeout since server started successfully
    clearTimeout(serverTimeout);
    
    // Wait a bit and then run Cypress
    setTimeout(() => {
      runCypressTests();
    }, 3000);
  }
});

frontendProcess.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('Frontend error:', error);
  
  // Check for crypto.hash error and provide fallback
  if (error.includes('crypto.hash is not a function')) {
    console.log('⚠️  Detected crypto.hash error, trying alternative approach...');
    clearTimeout(serverTimeout);
    // Try to run Cypress directly without starting the server
    setTimeout(() => {
      runCypressTestsDirect();
    }, 1000);
  }
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

function runCypressTestsDirect() {
  console.log('🧪 Running Cypress tests directly (without server)...');
  
  const cypressProcess = spawn('npx', ['cypress', 'run'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  cypressProcess.on('close', (code) => {
    console.log(`Cypress tests finished with code ${code}`);
    if (frontendProcess && !frontendProcess.killed) {
      frontendProcess.kill('SIGTERM');
    }
    process.exit(code);
  });

  cypressProcess.on('error', (error) => {
    console.error('Cypress error:', error);
    if (frontendProcess && !frontendProcess.killed) {
      frontendProcess.kill('SIGTERM');
    }
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