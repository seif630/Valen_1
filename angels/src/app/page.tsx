  import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-black text-white py-32 border-b border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-wider uppercase typing">
            Angel&apos;s
          </h1>
          <p className="text-2xl md:text-4xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Elevate your style with premium fashion that speaks to your soul.
          </p>
          <Link
            href="/shop"
            className="bg-white text-black px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-200 hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Explore Collection
          </Link>
        </div>
      </section>



      {/* About Section */}
      <section className="bg-black text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-8 tracking-wide">About Angel&apos;s</h2>
            <p className="text-xl leading-relaxed text-gray-300 mb-12">
              At Angel&apos;s, we believe fashion is more than clothing—it&apos;s an expression of individuality.
              Our curated collection features timeless pieces and contemporary trends, crafted with quality
              materials and attention to detail. From casual wear to elegant ensembles, find your perfect style
              with us.
            </p>
            <Link
              href="/about"
              className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 hover:scale-105 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-white text-black py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-8 tracking-wide">Ready to Transform Your Wardrobe?</h2>
          <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover pieces that make you feel confident and stylish every day.
          </p>
          <Link
            href="/shop"
            className="bg-black text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-800 hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Start Shopping
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white text-black py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 tracking-wide">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center hover:scale-105 transition-transform duration-300">
              <div className="text-8xl mb-6">✨</div>
              <h3 className="text-3xl font-semibold mb-4">Premium Quality</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Every piece is selected for its superior craftsmanship and durability.
              </p>
            </div>
            <div className="text-center hover:scale-105 transition-transform duration-300">
              <div className="text-8xl mb-6">🚀</div>
              <h3 className="text-3xl font-semibold mb-4">Fast Delivery</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Quick and reliable shipping to get your favorites to you swiftly.
              </p>
            </div>
            <div className="text-center hover:scale-105 transition-transform duration-300">
              <div className="text-8xl mb-6">💎</div>
              <h3 className="text-3xl font-semibold mb-4">Unique Designs</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Exclusive styles that set you apart from the crowd.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
