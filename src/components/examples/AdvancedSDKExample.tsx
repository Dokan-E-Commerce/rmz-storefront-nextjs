'use client';

import React, { useState, useEffect } from 'react';
import storefront from '@/lib/storefront-client';

// Example component showcasing the advanced SDK features
export default function AdvancedSDKExample() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Example 1: Firebase/Supabase style product queries
  const loadFeaturedProducts = async () => {
    setLoading(true);
    try {
      // This would be: storefront.products.eq('featured', true).limit(5).get()
      // For now, using the legacy wrapper until the advanced SDK builds properly
      const result = await storefront.products.getFeatured(5);
      setProducts(result);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Advanced search with method chaining
  const searchProducts = async (term: string) => {
    if (!term.trim()) return;
    
    setLoading(true);
    try {
      // Advanced search: storefront.products.search(term).inStock().orderBy('name').get()
      const result = await storefront.products.searchProducts(term, {
        inStock: true
      });
      setProducts(result);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Cart operations
  const addToCart = async (productId: number) => {
    try {
      await storefront.cart.addItem(productId, 1);
      // Refresh cart
      const updatedCart = await storefront.cart.get();
      setCart(updatedCart);
    } catch (error) {
    }
  };

  // Example 4: Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const currentCart = await storefront.cart.get();
        setCart(currentCart);
      } catch (error) {
      }
    };

    loadCart();
    loadFeaturedProducts();
  }, []);

  // Example 5: Real-time subscriptions (would work with WebSocket)
  useEffect(() => {
    // This would enable real-time updates
    // const unsubscribe = storefront.products.featured().subscribe((data) => {
    //   setProducts(data);
    // });
    // 
    // return unsubscribe;
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Advanced Storefront SDK Example</h1>
      
      {/* Search Example */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Advanced Search with Method Chaining</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 border rounded-lg"
            onKeyDown={(e) => e.key === 'Enter' && searchProducts(searchTerm)}
          />
          <button
            onClick={() => searchProducts(searchTerm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Search
          </button>
          <button
            onClick={loadFeaturedProducts}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Featured
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          <strong>SDK Usage:</strong> <code>storefront.products.search(term).inStock().orderBy('name').get()</code>
        </p>
      </div>

      {/* Products Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Products ({products.length})</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-48 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">${product.price}</span>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Example */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Cart Operations</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          {cart ? (
            <div>
              <p><strong>Items:</strong> {cart.items?.length || 0}</p>
              <p><strong>Total:</strong> ${cart.total || 0}</p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>SDK Usage:</strong> <code>storefront.cart.addItem(productId, quantity)</code>
              </p>
            </div>
          ) : (
            <p>Cart is empty</p>
          )}
        </div>
      </div>

      {/* Advanced Features */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Advanced Features Available</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Query Builder</h3>
            <code className="text-sm">
              storefront.products<br/>
              .where('price', 'gte', 100)<br/>
              .orderBy('name')<br/>
              .limit(10)<br/>
              .get()
            </code>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Real-time</h3>
            <code className="text-sm">
              storefront.products<br/>
              .featured()<br/>
              .subscribe(callback)
            </code>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Streaming</h3>
            <code className="text-sm">
              for await (const item<br/>
              of storefront.products.stream()) {'{'}
              {/* process item */}
              {'}'}
            </code>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">Caching</h3>
            <code className="text-sm">
              storefront.clearAllCaches()<br/>
              storefront.getCacheStats()
            </code>
          </div>
        </div>
      </div>

      {/* Authentication Example */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Authentication Integration</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-2">
            <strong>Current User:</strong> {storefront.getCurrentUser ? 'Available' : 'Not authenticated'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>SDK Usage:</strong> <code>storefront.getCurrentUser()</code>, <code>storefront.setAuthToken(token)</code>
          </p>
        </div>
      </div>
    </div>
  );
}