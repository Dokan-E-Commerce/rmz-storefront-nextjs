/**
 * Test Next.js SSR functionality during build/runtime
 */

const { spawn } = require('child_process');

async function testNextSSR() {
  console.log('🧪 Testing Next.js SSR Implementation...\n');

  console.log('🔨 Starting Next.js in development mode...');
  
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    detached: false
  });

  let serverReady = false;
  
  // Listen for server ready message
  nextProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Next.js output:', output.trim());
    
    if (output.includes('Local:') || output.includes('localhost:3000')) {
      serverReady = true;
      console.log('✅ Next.js server is ready, testing SSR...\n');
      
      // Wait a moment then test
      setTimeout(testSSRPages, 3000);
    }
  });

  nextProcess.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('SSR:')) {
      console.log('🔍 SSR Debug:', output.trim());
    }
  });

  // Kill process after tests
  setTimeout(() => {
    console.log('\n🛑 Stopping Next.js server...');
    nextProcess.kill('SIGTERM');
    process.exit(0);
  }, 15000);

  async function testSSRPages() {
    const testPages = [
      'http://localhost:3000/',
      'http://localhost:3000/products/javascript-masterclass',
      'http://localhost:3000/categories/digital-downloads'
    ];

    for (const url of testPages) {
      console.log(`📄 Testing: ${url}`);
      try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        const { stdout } = await execAsync(`curl -s "${url}" | head -20`);
        
        // Check for meta tags in the response
        if (stdout.includes('<title>') && stdout.includes('<meta name="description"')) {
          console.log('  ✅ Page has proper meta tags');
        } else {
          console.log('  ⚠️ Page missing meta tags');
        }
        
        // Check for structured data
        if (stdout.includes('application/ld+json')) {
          console.log('  ✅ Page has structured data');
        } else {
          console.log('  ⚠️ Page missing structured data');
        }
        
      } catch (error) {
        console.log(`  ❌ Failed to test: ${error.message}`);
      }
      
      console.log('');
    }
  }
}

testNextSSR().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});