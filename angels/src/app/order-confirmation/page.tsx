'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OrderDetails {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: string;
}

export default function OrderConfirmation() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the order details you're looking for.</p>
          <Link href="/" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="border-b pb-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Order Number:</span>
                <p className="text-gray-900">#{orderDetails.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Order Date:</span>
                <p className="text-gray-900">{new Date(orderDetails.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 font-medium">{orderDetails.customer_name}</p>
              <p className="text-gray-600">{orderDetails.customer_email}</p>
              <p className="text-gray-600">{orderDetails.customer_phone}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-line">{orderDetails.shipping_address}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {(() => {
                try {
                  const items = JSON.parse(orderDetails.items);
                  return items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} | Size: {item.size}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">EGP {(item.quantity * item.price).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">EGP {item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ));
                } catch (error) {
                  return <p className="text-gray-500">Unable to load items</p>;
                }
              })()}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
              <span>Total Amount:</span>
              <span>EGP {orderDetails.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              You'll receive an email confirmation with your order details (if email service is configured)
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              We'll process your order and send you shipping updates
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Your order will be delivered to the address provided
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <Link
            href="/shop"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="inline-block bg-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
