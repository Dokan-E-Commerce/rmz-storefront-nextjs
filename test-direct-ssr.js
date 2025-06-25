/**
 * Test script to verify direct SSR API implementation is working
 * Run with: node test-direct-ssr.js
 */

async function testDirectSSR() {
  console.log('🧪 Testing Direct SSR API Implementation...\n');

  const publicKey = 'pk_development_e6718f0cca63b62aacc474ac5c0041cb';
  const secretKey = 'sk_development_1b4f3110e6495b9d7b3045acc763440bddf1a5d2d3145abd8bd432d4d14836f4';
  const apiUrl = 'http://front.rmz.local:8000/api';

  console.log('🔧 Configuration:', {
    apiUrl,
    hasPublicKey: !!publicKey,
    hasSecretKey: !!secretKey
  });

  // Build headers for secret key authentication (matching ssr.ts)
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const requestHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Public-Key': publicKey,
    'X-Secret-Key': secretKey,
    'X-Timestamp': timestamp,
    'Origin': 'http://front.rmz.local:3000',
    'User-Agent': 'StorefrontSSR/2.0'
  };

  console.log('📤 Request Headers:', requestHeaders);

  try {
    // Test store endpoint
    console.log('\n🏪 Testing store endpoint...');
    const storeResponse = await fetch(`${apiUrl}/store`, {
      headers: requestHeaders,
      signal: AbortSignal.timeout(15000)
    });

    console.log('📥 Store Response Status:', storeResponse.status, storeResponse.statusText);
    
    if (!storeResponse.ok) {
      const errorText = await storeResponse.text();
      console.error('❌ Store API failed:', errorText);
      throw new Error(`API call failed: ${storeResponse.status} ${storeResponse.statusText}`);
    }

    const storeData = await storeResponse.json();
    console.log('📋 Store Response Data:', {
      success: storeData.success,
      hasData: !!storeData.data,
      dataKeys: storeData.data ? Object.keys(storeData.data) : 'N/A',
      storeName: storeData.data?.name,
      storeId: storeData.data?.id
    });

    if (!storeData.success) {
      throw new Error(`API returned error: ${storeData.message || 'Unknown error'}`);
    }

    console.log('✅ Store data fetched successfully:', {
      name: storeData.data.name,
      id: storeData.data.id,
      hasTheme: !!storeData.data.theme,
      themeColor: storeData.data.theme?.color
    });

    // Test categories endpoint
    console.log('\n📁 Testing categories endpoint...');
    const categoriesResponse = await fetch(`${apiUrl}/categories`, {
      headers: requestHeaders,
      signal: AbortSignal.timeout(15000)
    });

    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Categories fetched:', {
        success: categoriesData.success,
        count: categoriesData.data?.length || 0
      });
    } else {
      console.log('⚠️ Categories endpoint returned:', categoriesResponse.status);
    }

    // Test products endpoint
    console.log('\n📦 Testing products endpoint...');
    const productsResponse = await fetch(`${apiUrl}/products`, {
      headers: requestHeaders,
      signal: AbortSignal.timeout(15000)
    });

    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      console.log('✅ Products fetched:', {
        success: productsData.success,
        count: productsData.data?.length || 0
      });
    } else {
      console.log('⚠️ Products endpoint returned:', productsResponse.status);
    }

    console.log('\n🎉 Direct SSR API implementation is working correctly!');

  } catch (error) {
    console.error('❌ Direct SSR test failed:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

testDirectSSR();