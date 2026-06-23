'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Checkout() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: ''
  });

  useEffect(() => {
    if (session?.user?.email && session.user.role !== 'admin') {
      const nameParts = (session.user.name || '').split(' ');
      setFormData((prev) => ({
        ...prev,
        email: session.user.email || prev.email,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(' ') || prev.lastName,
      }));
    }
  }, [session]);

  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.country.trim() !== '' &&
      phoneValid
    );
  };

  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digit characters from phone number
    const cleanedPhone = phone.replace(/\D/g, '');

    if (cleanedPhone.length === 0) {
      setPhoneValid(false);
      setPhoneError('');
      return;
    }

    // Egyptian phone number validation (exactly 11 digits starting with 0)
    if (cleanedPhone.length === 11 && cleanedPhone.startsWith('0')) {
      setPhoneValid(true);
      setPhoneError('');
    } else {
      setPhoneValid(false);
      setPhoneError('Phone number must be exactly 11 digits starting with 0');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // Phone validation
    if (name === 'phone') {
      validatePhoneNumber(value);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number before submission
    const cleanedPhone = formData.phone.replace(/\D/g, '');
    const egyptianPhoneRegex = /^0\d{10}$/;

    if (cleanedPhone.length === 0) {
      alert('Please enter a phone number.');
      return;
    }

    if (cleanedPhone.length !== 11) {
      alert('Phone number must be exactly 11 digits');
      return;
    } else if (!egyptianPhoneRegex.test(cleanedPhone)) {
      alert('Please match the requested format');
      return;
    }

    // Calculate order details
    const subtotal = getTotalPrice();
    const shipping = subtotal > 0 ? 50 : 0;
    const total = subtotal + shipping;

    try {
      // Create order in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
            items: cartItems,
            customer: formData,
            shippingAddress: formData.address,
            customer_phone: formData.phone,
            totalAmount: total.toFixed(2)
          }),
      });

      if (response.ok) {
        const data = await response.json();

        // Send confirmation email
        const emailResponse = await fetch('/api/send-confirmation-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: data.orderId
          }),
        });

        if (emailResponse.ok) {
          // Email sending disabled as per user request
          // alert(`Order created successfully! Order ID: ${data.orderId}. A confirmation email has been sent.`);
        } else {
          // alert(`Order created successfully! Order ID: ${data.orderId}. However, there was an issue sending the confirmation email.`);
        }

        clearCart();
        router.push('/order-confirmation?orderId=' + data.orderId);
      } else {
        alert('Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('There was an error processing your order. Please try again.');
    }
  };

  // Calculate totals dynamically from cart context
  const subtotal = getTotalPrice();
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {session?.user?.role !== 'admin' && session?.user?.email && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
          Signed in as {session.user.email}.{' '}
          <Link href="/account" className="underline hover:text-purple-900">Manage account</Link>
        </div>
      )}

      {!session && (
        <div className="mb-6 p-4 bg-gray-50 border rounded-lg text-sm text-gray-700">
          Have an account?{' '}
          <Link href="/account" className="text-purple-600 hover:text-purple-700 font-medium">
            Sign in
          </Link>{' '}
          to track your orders, or continue as guest.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  pattern="0\d{10}"
                  title="Phone number must be exactly 11 digits starting with 0"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10 ${
                    phoneValid ? 'border-green-500' : phoneError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {phoneValid && (
                  <div className="absolute right-3 top-3 text-green-500">
                    ✓
                  </div>
                )}
                {phoneError && (
                  <p className="text-red-600 text-sm mt-1">{phoneError}</p>
                )}
              </div>
            </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
                {/* Removed ZIP Code input as per user request */}
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </div>



            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full px-6 py-3 rounded-lg font-semibold ${
                isFormValid()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Complete Order
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cartItems.map((item: any) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>EGP {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))
            )}
            <div className="flex justify-between border-t pt-2">
              <span>Subtotal</span>
              <span>EGP {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>EGP {shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span>EGP {total.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            This is a demo checkout. Stripe integration will be added in the next steps.
          </p>
        </div>
      </div>
    </div>
  );
}
