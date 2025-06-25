/**
 * Debug SSR implementation with detailed logging
 */

// Set environment variables
process.env.NEXT_PUBLIC_STOREFRONT_PUBLIC_KEY = 'pk_development_e6718f0cca63b62aacc474ac5c0041cb';
process.env.NEXT_PUBLIC_STOREFRONT_SECRET_KEY = 'sk_development_1b4f3110e6495b9d7b3045acc763440bddf1a5d2d3145abd8bd432d4d14836f4';
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://front.rmz.local:8000/api';
process.env.NODE_ENV = 'development';

async function testSSRDebug() {
  console.log('🧪 Testing SSR with Detailed Debug Info...\n');

  // Test 1: Direct API call (what makeServerSideAPICall does)
  console.log('🔧 Testing Direct API Call...');
  
  const publicKey = process.env.NEXT_PUBLIC_STOREFRONT_PUBLIC_KEY;
  const secretKey = process.env.NEXT_PUBLIC_STOREFRONT_SECRET_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

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

  console.log('Headers being sent:', requestHeaders);

  // Test specific product
  console.log('\n📦 Testing Product SSR for: javascript-masterclass');
  try {
    const response = await fetch(`${apiUrl}/products/javascript-masterclass`, {
      headers: requestHeaders,
      signal: AbortSignal.timeout(15000)
    });

    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API Response Structure:', {
      success: data.success,
      hasData: !!data.data,
      dataType: typeof data.data,
      dataKeys: data.data ? Object.keys(data.data) : null
    });

    if (!data.success) {
      throw new Error(`API returned error: ${data.message || 'Unknown error'}`);
    }

    const productData = data.data;
    console.log('✅ Product Data Retrieved:', {
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      marketing_title: productData.marketing_title,
      description: productData.description?.substring(0, 100) + '...',
      short_description: productData.short_description?.substring(0, 100) + '...',
      price: productData.price,
      categories: productData.categories?.map(c => ({ id: c.id, name: c.name })),
      hasImage: !!productData.image
    });

    // Test metadata generation
    console.log('\n🏷️ Testing Metadata Generation...');
    const productTitle = productData.marketing_title || productData.name;
    const productDescription = productData.short_description || 
      (productData.description ? productData.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : `${productTitle} - Available at Testing Store`);
    
    console.log('Generated Metadata:', {
      title: `${productTitle} | Testing Store`,
      description: productDescription,
      ogImage: productData.image?.full_link || productData.image?.url || 'fallback',
      price: productData.price?.actual || productData.price?.original,
      availability: productData.stock?.unlimited || productData.stock?.available > 0 ? 'in stock' : 'out of stock'
    });

  } catch (error) {
    console.error('❌ Product SSR Test Failed:', error.message);
  }

  // Test specific category
  console.log('\n📁 Testing Category SSR for: digital-downloads');
  try {
    const response = await fetch(`${apiUrl}/categories/digital-downloads`, {
      headers: requestHeaders,
      signal: AbortSignal.timeout(15000)
    });

    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API Response Structure:', {
      success: data.success,
      hasData: !!data.data,
      dataType: typeof data.data,
      dataKeys: data.data ? Object.keys(data.data) : null
    });

    if (!data.success) {
      throw new Error(`API returned error: ${data.message || 'Unknown error'}`);
    }

    const categoryData = data.data;
    console.log('✅ Category Data Retrieved:', {
      id: categoryData.id,
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description?.substring(0, 100) + '...',
      products_count: categoryData.products_count,
      hasImage: !!categoryData.image
    });

    // Test metadata generation
    console.log('\n🏷️ Testing Category Metadata Generation...');
    const categoryTitle = categoryData.name;
    const categoryDescription = categoryData.description || `Browse ${categoryData.name} products at Testing Store. Find the best digital products, courses, and subscriptions.`;
    
    console.log('Generated Category Metadata:', {
      title: `${categoryTitle} | Testing Store`,
      description: categoryDescription,
      productsCount: categoryData.products_count || 0
    });

  } catch (error) {
    console.error('❌ Category SSR Test Failed:', error.message);
  }

  console.log('\n✅ SSR Debug Test Complete!');
}

testSSRDebug().catch(error => {
  console.error('❌ Debug test failed:', error);
  process.exit(1);
});