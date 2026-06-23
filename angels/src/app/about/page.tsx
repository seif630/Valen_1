export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">About Angel&apos;s</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Angel&apos;s was founded with a passion for fashion and a commitment to quality.
            We believe that everyone deserves to look and feel their best, which is why
            we carefully curate our collection to include timeless pieces that never go out of style.
          </p>
          <p className="text-gray-600 mb-4">
            Our journey began in 2020, and since then, we&apos;ve been dedicated to providing
            our customers with high-quality clothing at affordable prices. We work directly
            with ethical manufacturers to ensure fair labor practices and sustainable production.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Quality craftsmanship in every piece</li>
            <li>• Ethical and sustainable manufacturing</li>
            <li>• Inclusive sizing for all body types</li>
            <li>• Transparent pricing with no hidden fees</li>
            <li>• Exceptional customer service</li>
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Why Choose Angel&apos;s?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👕</span>
            </div>
            <h3 className="font-semibold mb-2">Premium Quality</h3>
            <p className="text-gray-600 text-sm">Every item is carefully inspected for the highest quality standards.</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="font-semibold mb-2">Fast Shipping</h3>
            <p className="text-gray-600 text-sm">Free shipping on orders over EGP 50 with quick delivery times.</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">↩️</span>
            </div>
            <h3 className="font-semibold mb-2">Easy Returns</h3>
            <p className="text-gray-600 text-sm">4-day return policy for your peace of mind.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
