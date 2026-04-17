import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  const sections = [
    { title: 'Information We Collect', content: 'We collect information you provide directly, including your name, email address, shipping address, and payment information when you make a purchase.' },
    { title: 'How We Use Your Information', content: 'We use your information to process orders, provide customer support, send promotional communications (with your consent), and improve our services.' },
    { title: 'Data Protection', content: 'We implement industry-standard security measures to protect your personal information. All transactions are encrypted with SSL technology.' },
    { title: 'Cookies', content: 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage your cookie preferences at any time.' },
    { title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal information. Contact us at privacy@example.com for any privacy-related requests.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: April 2026</p>
        </div>

        <div className="bg-[#111] rounded-2xl p-8 border border-white/5">
          <p className="text-gray-400 mb-12 leading-relaxed">
            Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
          </p>

          {sections.map((section) => (
            <section key={section.title} className="mb-8 last:mb-0">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                {section.title}
              </h2>
              <p className="text-gray-400 leading-relaxed pl-4 border-l-2 border-white/5">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
