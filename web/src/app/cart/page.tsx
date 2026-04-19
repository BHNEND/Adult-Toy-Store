'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { cartApi } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const { cart, cartTotal, cartLoading, refreshCart, user } = useApp();
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }

    setUpdating(itemId);
    try {
      await cartApi.update(itemId, newQuantity);
      await refreshCart();
    } catch (error) {
      console.error('Failed to update cart:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!confirm('Remove this item from cart?')) return;

    setUpdating(itemId);
    try {
      await cartApi.remove(itemId);
      await refreshCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
              ) : cart.length === 0 ? (
                <div className="bg-[#111] rounded-xl p-12 text-center">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-400 mb-4">Your cart is empty</p>
                  <Link href="/products">
                    <Button>Continue Shopping</Button>
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-[#111] rounded-xl p-4 flex gap-4">
                    {/* Product Image */}
                    <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg overflow-hidden">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-purple-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="text-white font-medium mb-1 hover:text-purple-400 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-purple-400 font-medium">${item.product.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-[#0a0a0a] rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-white text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="text-right">
                      <p className="text-white font-bold mb-2">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="text-gray-500 hover:text-red-500 text-sm disabled:opacity-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#111] rounded-xl p-6 sticky top-4">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>{cartTotal >= 50 ? 'Free' : '$5.00'}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span>${(cartTotal >= 50 ? cartTotal : cartTotal + 5).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  Proceed to Checkout
                </Button>

                {cartTotal < 50 && cartTotal > 0 && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Add ${(50 - cartTotal).toFixed(2)} more for free shipping
                  </p>
                )}

                <div className="mt-6 pt-6 border-t border-white/10">
                  <Link href="/products" className="text-purple-400 hover:text-purple-300 text-sm">
                    ← Continue Shopping
                  </Link>
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
