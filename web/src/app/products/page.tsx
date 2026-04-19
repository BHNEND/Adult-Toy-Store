'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/Button';
import { productApi } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
}

const categories = [
  { key: 'all', label: 'All' },
  { key: 'for_her', label: 'For Her' },
  { key: 'for_him', label: 'For Him' },
  { key: 'couples', label: 'Couples' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'accessories', label: 'Accessories' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, page]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.list({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        page,
        limit,
      });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Page Header */}
      <section className="py-12 px-4 bg-[#111]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Products</h1>
          <p className="text-gray-400">Discover our curated collection of premium products</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.key
                    ? 'bg-purple-500 text-white'
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchProducts}>Try Again</Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <ProductCard {...product} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {!loading && !error && products.length > 0 && totalPages > 1 && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                    page === p
                      ? 'bg-purple-500 text-white'
                      : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
