'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { productApi, cartApi } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  images?: string[];
  stock: number;
  isNew?: boolean;
  isSale?: boolean;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, refreshCart } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.get(params.id);
      setProduct(data.product);
    } catch (err) {
      setError('Failed to load product. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!product) return;

    setAddingToCart(true);
    try {
      await cartApi.add(product.id, quantity);
      await refreshCart();
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 3000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center h-96 px-4">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <button onClick={() => router.push('/products')} className="hover:text-white transition-colors">
              Products
            </button>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-purple-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(1).map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square bg-[#111] rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-purple-500 transition-all"
                    >
                      <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              {product.isNew && (
                <span className="inline-block px-3 py-1 bg-purple-500 text-white text-sm font-medium rounded-lg mb-4">
                  New
                </span>
              )}
              {product.isSale && (
                <span className="inline-block px-3 py-1 bg-pink-500 text-white text-sm font-medium rounded-lg mb-4 ml-2">
                  Sale
                </span>
              )}

              <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-purple-400">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-600 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <span>Category: {product.category}</span>
                <span>•</span>
                <span>In Stock: {product.stock}</span>
              </div>

              <p className="text-gray-300 mb-8 leading-relaxed">{product.description}</p>

              {/* Quantity and Add to Cart */}
              <div className="flex items-start gap-4 mb-8">
                <div className="flex items-center bg-[#111] rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="w-16 text-center text-white font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="flex-1"
                >
                  {addingToCart ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </span>
                  ) : addedMessage ? (
                    'Added to Cart ✓'
                  ) : product.stock === 0 ? (
                    'Out of Stock'
                  ) : (
                    'Add to Cart'
                  )}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="border-t border-white/10 pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">Discreet Packaging</p>
                      <p className="text-gray-500">Your privacy is our priority</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">Free Shipping</p>
                      <p className="text-gray-500">On orders over $50</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">30-Day Returns</p>
                      <p className="text-gray-500">Hassle-free returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
