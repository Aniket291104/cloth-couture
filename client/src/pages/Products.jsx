import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '../context/WishlistContext';
import { API_BASE_URL } from '@/lib/utils';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('');
  const location = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');
  const keyword = searchParams.get('keyword');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE_URL}/api/products`;
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (keyword) params.append('keyword', keyword);
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        const { data } = await axios.get(url);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, keyword]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary-dark">
            {keyword ? `Results for "${keyword}"` : category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Products'}
          </h1>
          <p className="text-muted-foreground mt-2">Discover our handmade collection</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-border rounded-md px-4 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          >
            <option value="">Sort by: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <h2 className="text-2xl font-serif mb-2">No products found</h2>
          <p>Try exploring other categories or try again later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...products]
            .sort((a, b) => {
              if (sortOrder === 'price-asc') return a.price - b.price;
              if (sortOrder === 'price-desc') return b.price - a.price;
              return 0;
            })
            .map((product, index) => (
            <motion.div 
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col"
            >
              <Link to={`/products/${product._id}`} className="block relative aspect-[4/5] overflow-hidden rounded-lg mb-4 bg-muted">
                <img
                  src={product.images?.[0] || product.image || '/images/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Wishlist button */}
                <button
                  onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-4 w-4 transition-colors ${
                    isInWishlist(product._id) ? 'text-primary fill-primary' : 'text-gray-400'
                  }`} />
                </button>
              </Link>
              <div className="flex justify-between items-start">
                <div>
                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-lg font-serif font-medium text-foreground hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">{product.category}</p>
                </div>
                <p className="text-lg font-semibold text-primary-dark">${product.price.toFixed(2)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
