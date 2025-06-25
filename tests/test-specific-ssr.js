const fetch = require('node-fetch');
(async () => {
  const headers = {
    'Accept': 'application/json',
    'X-Public-Key': 'pk_development_e6718f0cca63b62aacc474ac5c0041cb',
    'X-Secret-Key': 'sk_development_1b4f3110e6495b9d7b3045acc763440bddf1a5d2d3145abd8bd432d4d14836f4',
    'X-Timestamp': Math.floor(Date.now() / 1000).toString(),
    'Origin': 'http://front.rmz.local:3000'
  };
  
  console.log('Testing specific product SSR...');
  try {
    const response = await fetch('http://front.rmz.local:8000/api/products/javascript-masterclass', { headers });
    const data = await response.json();
    console.log('Product SSR result:', {
      success: data.success,
      name: data.data?.name,
      slug: data.data?.slug,
      hasDescription: !!data.data?.description,
      hasImage: !!data.data?.image
    });
  } catch (e) {
    console.error('Product SSR error:', e.message);
  }
  
  console.log('\nTesting specific category SSR...');
  try {
    const response = await fetch('http://front.rmz.local:8000/api/categories/digital-downloads', { headers });
    const data = await response.json();
    console.log('Category SSR result:', {
      success: data.success,
      name: data.data?.name,
      slug: data.data?.slug,
      hasDescription: !!data.data?.description,
      products_count: data.data?.products_count
    });
  } catch (e) {
    console.error('Category SSR error:', e.message);
  }
})();