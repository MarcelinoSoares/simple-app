import { spawn } from 'child_process';
import http from 'http';

let serverProcess = null;
let serverPort = 5173;

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting development server...');
    
    serverProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      // Extract port from Vite output
      const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
      if (portMatch) {
        serverPort = parseInt(portMatch[1]);
        console.log(`✅ Server started successfully on port ${serverPort}!`);
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 30000);
  });
}

function waitForServer() {
  return new Promise((resolve, reject) => {
    console.log('⏳ Waiting for server to be ready...');
    
    const checkServer = () => {
      const req = http.request({
        hostname: 'localhost',
        port: serverPort,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log(`✅ Server is responding on port ${serverPort}! Status: ${res.statusCode}`);
        resolve();
      });

      req.on('error', (err) => {
        console.log('⏳ Server not ready yet, retrying...');
        setTimeout(checkServer, 2000);
      });

      req.on('timeout', () => {
        console.log('⏳ Server timeout, retrying...');
        req.destroy();
        setTimeout(checkServer, 2000);
      });

      req.end();
    };

    checkServer();
  });
}

function runTests() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Running E2E tests...');
    
    const testProcess = spawn('npm', ['run', 'test:e2e:direct'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, CYPRESS_BASE_URL: `http://localhost:${serverPort}` }
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Tests completed successfully!');
        resolve();
      } else {
        console.log(`❌ Tests failed with code ${code}`);
        reject(new Error(`Tests failed with code ${code}`));
      }
    });

    testProcess.on('error', (error) => {
      console.error('Failed to run tests:', error);
      reject(error);
    });
  });
}

function cleanup() {
  if (serverProcess) {
    console.log('🛑 Stopping server...');
    serverProcess.kill('SIGTERM');
  }
}

async function main() {
  try {
    await startServer();
    await waitForServer();
    await runTests();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  cleanup();
  process.exit(0);
});

main(); 