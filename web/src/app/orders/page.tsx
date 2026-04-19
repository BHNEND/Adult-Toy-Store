'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { orderApi } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

interface OrderItem {
  product: {
    id: string;
    name: string;
    image?: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.list();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(orderId);
    try {
      await orderApi.cancel(orderId);
      await fetchOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">My Orders</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-[#111] rounded-xl p-12 text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-400 mb-4">No orders yet</p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-[#111] rounded-xl overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-sm">Order #{order.id.slice(-8)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-white">
                          ${order.total.toFixed(2)}
                        </span>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        {order.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancelling === order.id}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            {cancelling === order.id ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 overflow-x-auto">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex-shrink-0 w-20">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg overflow-hidden">
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
                          <p className="text-gray-500 text-xs mt-2 truncate">x{item.quantity}</p>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center text-gray-500 text-sm">
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
