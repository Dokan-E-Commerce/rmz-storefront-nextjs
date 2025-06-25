/**
 * Test script to verify SSR implementation is working
 * Run with: node test-ssr.js
 */

const { createStorefrontSDK } = require('rmz-storefront-sdk');

async function testSSR() {
  console.log('🧪 Testing SSR SDK Implementation...\n');

  try {
    // Test the same configuration as SSR
    const config = {
      apiUrl: 'http://front.rmz.local:8000/api',
      publicKey: 'pk_development_e6718f0cca63b62aacc474ac5c0041cb',
      secretKey: 'sk_development_1b4f3110e6495b9d7b3045acc763440bddf1a5d2d3145abd8bd432d4d14836f4',
      environment: 'development',
      enableLogging: true
    };

    console.log('🔧 SDK Configuration:', {
      apiUrl: config.apiUrl,
      hasPublicKey: !!config.publicKey,
      hasSecretKey: !!config.secretKey,
      environment: config.environment
    });

    const sdk = createStorefrontSDK(config);
    console.log('✅ SDK created successfully');
    console.log('SDK instance:', sdk);
    console.log('SDK store methods:', Object.keys(sdk.store));
    console.log('');

    // Test store endpoint
    console.log('🏪 Testing store endpoint...');
    try {
      const storeData = await sdk.store.get();
      console.log('Raw store response:', storeData);
      
      if (!storeData) {
        throw new Error('Store data is null/undefined');
      }
      
      console.log('✅ Store data fetched:', {
        name: storeData.name,
        id: storeData.id,
        hasTheme: !!storeData.theme,
        themeColor: storeData.theme?.color
      });
    } catch (storeError) {
      console.error('❌ Store endpoint failed:', {
        message: storeError.message,
        response: storeError.response?.data,
        status: storeError.response?.status
      });
      throw storeError;
    }

    // Test categories endpoint 
    console.log('\n📁 Testing categories endpoint...');
    const categories = await sdk.categories.getAll();
    console.log('✅ Categories fetched:', {
      count: categories.data?.length || 0,
      firstCategory: categories.data?.[0]?.name || 'None'
    });

    // Test products endpoint
    console.log('\n📦 Testing products endpoint...');
    const products = await sdk.products.getAll({ per_page: 3 });
    console.log('✅ Products fetched:', {
      count: products.data?.length || 0,
      firstProduct: products.data?.[0]?.name || 'None'
    });

    console.log('\n🎉 All SSR tests passed! The SDK is working correctly.');

  } catch (error) {
    console.error('❌ SSR test failed:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

testSSR();