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
    phone: string;
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

const statusDescriptions = {
  pending: 'Your order is waiting to be processed',
  processing: 'Your order is being prepared for shipment',
  shipped: 'Your order has been shipped and is on its way',
  delivered: 'Your order has been delivered',
  cancelled: 'Your order has been cancelled',
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchOrder();
  }, [user, router, params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await orderApi.get(params.id);
      setOrder(data.order);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      await orderApi.cancel(order.id);
      await fetchOrder();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return null;
  }

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

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center h-96 px-4">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Order not found</p>
            <Link href="/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/orders" className="hover:text-white transition-colors">
              Orders
            </Link>
            <span>/</span>
            <span className="text-white">Order #{order.id.slice(-8)}</span>
          </div>

          {/* Order Header */}
          <div className="bg-[#111] rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">Order #{order.id.slice(-8)}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{formatDate(order.createdAt)}</p>
              </div>
              {order.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={cancelOrder}
                  disabled={cancelling}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </Button>
              )}
            </div>

            {statusDescriptions[order.status] && (
              <div className="bg-[#0a0a0a] rounded-lg p-4">
                <p className="text-gray-300">{statusDescriptions[order.status]}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Items */}
            <div className="bg-[#111] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg overflow-hidden flex-shrink-0">
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
                      <Link href={`/products/${item.product.id}`}>
                        <p className="text-white font-medium hover:text-purple-400 transition-colors">
                          {item.product.name}
                        </p>
                      </Link>
                      <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white font-medium">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 mt-6 pt-6">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-[#111] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Shipping Address</h2>
              <div className="space-y-2">
                <p className="text-white font-medium">{order.shippingAddress.name}</p>
                <p className="text-gray-400">{order.shippingAddress.phone}</p>
                <p className="text-gray-400">{order.shippingAddress.address}</p>
                <p className="text-gray-400">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="text-gray-400">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <Link href="/orders">
              <Button variant="outline">← Back to Orders</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
