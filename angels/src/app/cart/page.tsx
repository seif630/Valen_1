'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Suspense, useState, useEffect } from 'react';
import Toast from '@/components/Toast';

export default function Cart() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading cart...</div>}>
      <CartContent />
    </Suspense>
  );
}

function CartContent() {
  const searchParams = useSearchParams();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
  } = useCart();

  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    const addedProduct = searchParams.get('added');
    const size = searchParams.get('size');
    const qty = searchParams.get('qty');

    if (addedProduct && size && qty) {
      setToastMessage(`Added ${qty} ${addedProduct} (Size: ${size}) to cart!`);
      // Optionally, clear the URL query params after showing the message
      // This requires router.replace or similar, but Next.js app router doesn't support it easily here
    }
  }, [searchParams]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        {cartItems.length > 0 && (
          <div className="ml-4 flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white font-semibold text-sm">
            {cartItems.reduce((total, item) => total + item.quantity, 0)}
          </div>
        )}
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link
            href="/shop"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center border-b border-gray-200 py-4">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded mr-4"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">Size: {item.size}</p>
                  <p className="text-purple-600 font-bold">EGP {item.price}</p>
                </div>
                <div className="flex items-center mr-4">
                  <button
                    onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                    className="px-2 py-1 border border-gray-300 rounded-l hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-t border-b border-gray-300">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                    className="px-2 py-1 border border-gray-300 rounded-r hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <div className="text-right mr-4">
                  <p className="font-semibold">EGP {(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>EGP {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `EGP ${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>EGP {total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 text-center block"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/shop"
              className="w-full mt-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 text-center block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
