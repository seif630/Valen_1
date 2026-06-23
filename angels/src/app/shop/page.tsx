'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  image_url: string | null;
  images: string[];
  stock_quantity: number;
  sizes: string;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Invalid products data:', data);
          setProducts([]);
        }
      } else {
        console.error('Failed to fetch products:', response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id.toString() === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="bg-white min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with product count and filter/view buttons */}
          <div className="mb-6 relative">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 mb-4">Angel's</h2>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl font-bold text-black">New / {filteredProducts.length} Products</h1>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Categories</option>
                  <option value="1">T-Shirts</option>
                  <option value="2">Jeans</option>
                  <option value="3">Dresses</option>
                  <option value="4">Jackets</option>
                  <option value="5">Shoes</option>
                </select>
                <button className="border border-black rounded-md px-3 py-1 text-sm font-medium text-black hover:bg-gray-100">View</button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative group">
                <Link href={`/product/${product.id}`}>
          <img
            src={product.image_url && !product.image_url.includes(',') ? product.image_url : (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300x400?text=No+Image')}
            alt={product.name}
            className="w-full h-[400px] object-cover"
          />
                </Link>
              {/* Heart icon */}
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`absolute top-2 right-2 bg-white rounded-full p-1 opacity-70 group-hover:opacity-100 transition ${
                  favorites.has(product.id) ? 'text-red-500' : 'text-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={favorites.has(product.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
                {/* Product info */}
                <div className="mt-2">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-sm font-semibold cursor-pointer hover:underline text-black">{product.name}</h3>
                  </Link>
                  <p className="text-xs text-gray-500 truncate">{product.description}</p>
                  <p className="text-sm font-bold mt-1">
                    {product.is_on_sale && product.sale_price
                      ? <>
                          <span className="line-through text-gray-400 mr-1">EGP {product.price.toFixed(2)}</span>
                          <span className="text-black">EGP {product.sale_price.toFixed(2)}</span>
                        </>
                      : <span className="text-black">EGP {product.price.toFixed(2)}</span>
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
