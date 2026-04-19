'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { addressApi, orderApi } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, user } = useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (cart.length === 0) {
      router.push('/cart');
      return;
    }

    fetchAddresses();
  }, [user, cart, router]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressApi.list();
      setAddresses(data.addresses || []);
      const defaultAddress = (data.addresses || []).find((addr: Address) => addr.isDefault);
      setSelectedAddress(defaultAddress?.id || null);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }

    setSubmitting(true);
    try {
      await orderApi.create({ addressId: selectedAddress });
      router.push('/orders');
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  const shipping = cartTotal >= 50 ? 0 : 5;
  const total = cartTotal + shipping;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-[#111] rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Shipping Address</h2>

                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No addresses found</p>
                    <Button onClick={() => router.push('/account/addresses')}>
                      Add New Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedAddress === address.id
                            ? 'border-purple-500 bg-purple-500/5'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddress === address.id}
                            onChange={() => setSelectedAddress(address.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium">{address.name}</span>
                              {address.isDefault && (
                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">{address.phone}</p>
                            <p className="text-gray-400 text-sm">
                              {address.address}, {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p className="text-gray-400 text-sm">{address.country}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {addresses.length > 0 && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => router.push('/account/addresses')}>
                      Add New Address
                    </Button>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-[#111] rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Order Items</h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.product.name}</p>
                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
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
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {shipping === 0 && (
                    <div className="text-sm text-purple-400">
                      🎉 Free shipping applied!
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!selectedAddress || submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : (
                    'Place Order'
                  )}
                </Button>

                <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-sm text-gray-500">
                  <p>🔒 Your payment information is secure</p>
                  <p>📦 Discreet packaging</p>
                  <p>✓ 30-day return policy</p>
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
