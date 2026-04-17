import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import ProductCard from '@/components/ProductCard';

export default function Home() {

  const categories = [
    { key: 'for_her', gradient: 'from-pink-500/20 to-purple-500/20' },
    { key: 'for_him', gradient: 'from-blue-500/20 to-purple-500/20' },
    { key: 'couples', gradient: 'from-pink-500/20 to-red-500/20' },
    { key: 'wellness', gradient: 'from-green-500/20 to-purple-500/20' },
    { key: 'accessories', gradient: 'from-yellow-500/20 to-purple-500/20' },
  ];

  const featuredProducts = [
    { name: 'Premium Silicone Lubricant', price: 24.99, isNew: true },
    { name: 'Rechargeable Vibrator', price: 89.99, originalPrice: 119.99, isSale: true },
    { name: 'Massage Candle Set', price: 34.99 },
    { name: 'Luxury Bondage Kit', price: 149.99, isNew: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Discover Premium Pleasure
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Curated collection of intimate wellness products for modern individual. Discreet shipping worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Shop Now</Button>
            <Button variant="outline" size="lg">Browse Collection</Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href="#"
                className={`relative aspect-square rounded-2xl bg-gradient-to-br ${cat.gradient} border border-white/5 hover:border-purple-500/30 transition-all duration-300 flex items-center justify-center group overflow-hidden`}
              >
                <span className="text-white font-medium text-lg relative z-10">
                  {cat.key === 'for_her' ? 'For Her' :
                   cat.key === 'for_him' ? 'For Him' :
                   cat.key === 'couples' ? 'Couples' :
                   cat.key === 'wellness' ? 'Wellness' : 'Accessories'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-4 bg-[#111]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white">Featured Products</h2>
              <p className="text-gray-500 mt-2">Handpicked favorites from our latest collection</p>
            </div>
            <Button variant="outline">View All</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, idx) => (
              <ProductCard key={idx} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900/10 to-pink-900/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-gray-400 mb-8">Subscribe for exclusive offers, new arrivals and intimate wellness tips.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-5 py-3 text-sm focus:outline-none focus:border-purple-500"
            />
            <Button size="lg">Subscribe</Button>
          </div>
          <p className="text-gray-600 text-xs mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
