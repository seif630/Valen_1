'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { cartItems } = useCart();
  const { data: session } = useSession();
  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  const isLoggedIn = !!session?.user;
  const isCustomer = isLoggedIn && session.user.role !== 'admin';

  return (
    <header className="bg-black shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          Angel&apos;s
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-white hover:text-gray-300">Home</Link>
          <Link href="/shop" className="text-white hover:text-gray-300">Shop</Link>
          <Link href="/about" className="text-white hover:text-gray-300">About</Link>
          <Link href="/contact" className="text-white hover:text-gray-300">Contact</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative text-white hover:text-gray-300 flex items-center">
            Cart
            {totalQuantity > 0 && (
              <span className="ml-2 flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-semibold text-sm">
                {totalQuantity}
              </span>
            )}
          </Link>
          {isCustomer ? (
            <>
              <Link href="/account" className="text-white hover:text-gray-300">
                {session.user.name?.split(' ')[0] || 'Account'}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-white hover:text-gray-300 text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/account" className="text-white hover:text-gray-300">
              Account
            </Link>
          )}
          {session?.user?.role === 'admin' && (
            <Link href="/admin" className="text-white hover:text-gray-300 font-semibold">
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
