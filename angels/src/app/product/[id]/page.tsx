'use client';

import Toast from '@/components/Toast';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  is_on_sale?: boolean;
  sale_percentage?: number;
  sale_start_date?: string;
  sale_end_date?: string;
  category_id: number;
  image_url: string;
  video_url?: string; // optional main video url
  additional_images?: string[];
  additional_videos?: string[]; // optional additional videos
  stock_quantity: number;
  sizes: string;
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  // Removed toastMessage state as notification is not needed here
  const [mainImage, setMainImage] = useState<string>('');
  const [mainVideo, setMainVideo] = useState<string>('');
  const [favorites, setFavorites] = useState<boolean>(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setMainImage(data.image_url);
        setMainVideo('');
      } else {
        // For demo purposes, create a mock product
        const mockProduct = {
          id: parseInt(params.id as string),
          name: 'Sample Product',
          description: 'This is a sample product description.',
          price: 29.99,
          category_id: 1,
          image_url: 'https://via.placeholder.com/400x600?text=Product',
          video_url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
          additional_images: [
            'https://via.placeholder.com/100x150?text=Image1',
            'https://via.placeholder.com/100x150?text=Image2',
            'https://via.placeholder.com/100x150?text=Image3',
          ],
          additional_videos: [
            'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
          ],
          stock_quantity: 10,
          sizes: '["S","M","L","XL"]'
        };
        setProduct(mockProduct);
        setMainImage(mockProduct.image_url);
        setMainVideo('');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  };

  const handleAddToCart = () => {
    if (product && selectedSize) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.is_on_sale && product.sale_price ? product.sale_price : product.price,
        size: selectedSize,
        image_url: mainImage,
        quantity: quantity
      });
      // Removed toast notification on product page as per user request
    }
  };

  const toggleFavorite = () => {
    setFavorites(!favorites);
  };

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const sizes = JSON.parse(product.sizes);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-white font-bold mb-4">
            {product.is_on_sale && product.sale_price
              ? <>
                  <span className="line-through text-gray-500 mr-2">EGP {product.price.toFixed(2)}</span>
                  <span>EGP {product.sale_price.toFixed(2)}</span>
                </>
              : <>EGP {product.price.toFixed(2)}</>
            }
          </p>

          {/* Additional Images Thumbnails */}
          <div className="flex space-x-2 mb-4 overflow-x-auto">
          {[product.image_url, ...(product.additional_images || [])].map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMainImage(img);
                setMainVideo('');
              }}
              className={`border rounded p-1 ${mainImage === img ? 'border-purple-600' : 'border-gray-300'}`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-20 h-28 object-cover" />
            </button>
          ))}
          {/* Video thumbnails */}
          {(product.video_url || (product.additional_videos && product.additional_videos.length > 0)) && (
            <>
              {[product.video_url, ...(product.additional_videos || [])].filter((vid): vid is string => vid !== undefined).map((vid, idx) => (
                <button
                  key={`vid-${idx}`}
                  onClick={() => {
                    setMainVideo(vid);
                    setMainImage('');
                  }}
                  className={`border rounded p-1 ${mainVideo === vid ? 'border-purple-600' : 'border-gray-300'}`}
                >
                  <video className="w-20 h-28 object-cover" src={vid} />
                </button>
              ))}
            </>
          )}
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Size</h3>
            <div className="flex space-x-2">
              {sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded ${
                    selectedSize === size
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Quantity</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-3 py-1 border border-gray-300 rounded">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>

          {/* Go to Cart Button */}
          <div className="mb-6">
            <Link href="/cart">
              <button className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600">
                Go to Cart
              </button>
            </Link>
          </div>

          {/* Toast Notification removed as per user request */}

          {/* Additional Product Info */}
          <div>
          </div>
        </div>

        {/* Right: Main Image or Video */}
        <div className="flex justify-center items-center">
          {mainVideo ? (
            <video
              src={mainVideo}
              autoPlay
              muted
              loop
              poster={product.image_url}
              className="max-w-full max-h-[600px] rounded-lg shadow-md transition-transform duration-300 ease-in-out hover:scale-110"
            />
          ) : (
            <img
              src={mainImage}
              alt={product.name}
              className="max-w-full max-h-[600px] rounded-lg shadow-md transition-transform duration-300 ease-in-out hover:scale-110"
            />
          )}
        </div>
      </div>
    </div>
  );
}
