import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Us</h1>
          <p className="text-xl text-gray-400">Empowering intimacy with quality and care</p>
        </div>

        {/* Story */}
        <section className="mb-16 bg-[#111] rounded-2xl p-8 border border-white/5">
          <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
          <p className="text-gray-400 leading-relaxed">
            Founded with a mission to break taboos and promote healthy attitudes toward intimacy, we curate only the finest products from trusted brands worldwide. Every item in our collection is carefully tested for quality, safety, and satisfaction.
          </p>
        </section>

        {/* Mission */}
        <section className="mb-16 bg-gradient-to-br from-purple-900/10 to-pink-900/10 rounded-2xl p-8 border border-purple-500/10">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-gray-400 leading-relaxed">
            To create a safe, judgment-free space where everyone can explore and enhance their intimate wellness journey with confidence.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111] rounded-xl p-6 border border-white/5">
              <div className="text-3xl mb-4">★</div>
              <h3 className="text-lg font-bold text-white mb-2">Premium Quality</h3>
              <p className="text-gray-500 text-sm">Only the highest-grade materials and products make it into our collection.</p>
            </div>
            <div className="bg-[#111] rounded-xl p-6 border border-white/5">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-lg font-bold text-white mb-2">Total Discretion</h3>
              <p className="text-gray-500 text-sm">Plain packaging and secure checkout — your privacy is our priority.</p>
            </div>
            <div className="bg-[#111] rounded-xl p-6 border border-white/5">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-white mb-2">Education First</h3>
              <p className="text-gray-500 text-sm">We believe in informed choices and provide resources for sexual wellness education.</p>
            </div>
            <div className="bg-[#111] rounded-xl p-6 border border-white/5">
              <div className="text-3xl mb-4">🌈</div>
              <h3 className="text-lg font-bold text-white mb-2">Inclusive Community</h3>
              <p className="text-gray-500 text-sm">Products and resources for all identities, orientations, and experience levels.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
