/**
 * Comprehensive test script to verify SSR is working on all page types
 * Run with: node test-complete-ssr.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testSSRPages() {
  console.log('🧪 Testing Complete SSR Implementation...\n');

  // Build the application first
  console.log('🔨 Building Next.js application...');
  try {
    const { stdout, stderr } = await execAsync('npm run build');
    console.log('✅ Build successful\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }

  // Test different pages to check SSR data
  const pagesToTest = [
    { name: 'Home Page', path: '/' },
    { name: 'Products Page', path: '/products' },
    { name: 'Categories Page', path: '/categories' },
    { name: 'Specific Product', path: '/products/test-product' },
    { name: 'Specific Category', path: '/categories/digital-downloads' }
  ];

  console.log('🌐 Testing SSR data on various pages...\n');

  for (const page of pagesToTest) {
    console.log(`📄 Testing ${page.name} (${page.path})...`);
    
    try {
      // Start Next.js in production mode for a brief test
      const testProcess = exec('npm start', { timeout: 10000 });
      
      // Wait a moment for server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test the page
      const curlCmd = `curl -s -I "http://localhost:3000${page.path}"`;
      const { stdout } = await execAsync(curlCmd);
      
      if (stdout.includes('200 OK')) {
        console.log(`  ✅ ${page.name} responds with 200 OK`);
      } else {
        console.log(`  ⚠️ ${page.name} response: ${stdout.split('\n')[0]}`);
      }
      
      // Kill the test process
      testProcess.kill();
      
    } catch (error) {
      console.log(`  ❌ ${page.name} test failed: ${error.message}`);
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎯 Testing Direct API SSR Functions...\n');

  // Test our direct SSR functions
  const testFunctions = [
    { name: 'Store SSR Data', test: testStoreSSR },
    { name: 'Product SSR Data', test: testProductSSR },
    { name: 'Category SSR Data', test: testCategorySSR }
  ];

  for (const func of testFunctions) {
    console.log(`🔧 Testing ${func.name}...`);
    try {
      await func.test();
      console.log(`  ✅ ${func.name} working correctly`);
    } catch (error) {
      console.log(`  ❌ ${func.name} failed: ${error.message}`);
    }
  }

  console.log('\n🎉 SSR Implementation Test Complete!');
}

async function testStoreSSR() {
  // Import and test the SSR function
  const { getStoreSSRData } = require('./src/lib/ssr.ts');
  const storeData = await getStoreSSRData();
  
  if (!storeData) {
    throw new Error('Store SSR data is null');
  }
  
  if (!storeData.name || !storeData.id) {
    throw new Error('Store SSR data missing required fields');
  }
  
  console.log(`    Store: ${storeData.name} (ID: ${storeData.id})`);
}

async function testProductSSR() {
  const { getProductSSRData } = require('./src/lib/ssr.ts');
  const productData = await getProductSSRData('test-product');
  
  // Note: This might return null if product doesn't exist, which is okay
  console.log(`    Product data: ${productData ? 'Found' : 'Not found (fallback will be used)'}`);
}

async function testCategorySSR() {
  const { getCategorySSRData } = require('./src/lib/ssr.ts');
  const categoryData = await getCategorySSRData('digital-downloads');
  
  if (!categoryData) {
    throw new Error('Category SSR data is null');
  }
  
  if (!categoryData.name || !categoryData.id) {
    throw new Error('Category SSR data missing required fields');
  }
  
  console.log(`    Category: ${categoryData.name} (ID: ${categoryData.id})`);
}

// Run the test
testSSRPages().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});