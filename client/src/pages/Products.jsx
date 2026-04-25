import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Heart, SlidersHorizontal, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL, getImageUrl, readCachedJSON, writeCachedJSON } from '@/lib/utils';

const QuickView = lazy(() => import('../components/storefront/QuickView.jsx'));

const ProductSkeleton = () => (
  <div className="flex flex-col animate-pulse">
    <div className="aspect-[4/5] bg-muted rounded-xl mb-3" />
    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
    <div className="h-4 bg-muted rounded w-1/3" />
  </div>
);

const CATEGORY_CACHE_KEY = 'cc:products:categories:v1';
const CATEGORY_CACHE_TTL_MS = 15 * 60 * 1000;
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', size: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [categories, setCategories] = useState(['All']);
  const location = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');
  const keyword = searchParams.get('keyword');

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      const cachedCategories = readCachedJSON(CATEGORY_CACHE_KEY, CATEGORY_CACHE_TTL_MS, window.sessionStorage);
      if (cachedCategories?.length) {
        if (isMounted) setCategories(cachedCategories);
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products/categories`);
        const categoryNames = ['All', ...new Set((data || []).map((item) => item.name).filter(Boolean))];
        if (isMounted) {
          setCategories(categoryNames);
          writeCachedJSON(CATEGORY_CACHE_KEY, categoryNames, window.sessionStorage);
        }
      } catch {
        // Keep fallback categories.
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (keyword) params.append('keyword', keyword);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.size) params.append('size', filters.size);
        params.append('fields', 'card');

        const { data } = await axios.get(`${API_BASE_URL}/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        setProducts(data);
      } catch (error) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          addToast('Failed to load products', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, [addToast, category, keyword, filters]);

  const handleWishlist = (e, product) => {
    e.preventDefault();
    toggleWishlist(product);
    addToast(isInWishlist(product._id) ? 'Removed from wishlist' : 'Added to wishlist!', 'info');
  };

  const handleQuickView = (e, product) => {
    e.preventDefault();
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const sortedProducts = useMemo(() => {
    const productCopy = [...products];
    return productCopy.sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      if (sortOrder === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [products, sortOrder]);

  const clearFilters = () => setFilters({ minPrice: '', maxPrice: '', size: '' });
  const hasFilters = filters.minPrice || filters.maxPrice || filters.size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary-dark">
            {keyword ? `Results for "${keyword}"` : category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Products'}
          </h1>
          <p className="text-muted-foreground mt-1">{loading ? '...' : `${products.length} products found`}</p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              hasFilters ? 'border-primary text-primary bg-primary/5' : 'border-border text-foreground hover:border-primary'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
          </button>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-border rounded-xl px-4 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
          >
            <option value="">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Price Range (INR)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Size</label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilters((f) => ({ ...f, size: f.size === s ? '' : s }))}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    filters.size === s ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" /> Clear filters
              </button>
            )}
          </div>
        </motion.div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
        {categories.map((cat) => {
          const active = (cat === 'All' && !category) || cat.toLowerCase() === category?.toLowerCase();
          const target = cat === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat)}`;
          return (
            <Link
              key={cat}
              to={target}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                active ? 'bg-primary text-white border-primary' : 'bg-background border-border text-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {cat === 'All' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Link>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <h2 className="text-2xl font-serif mb-2">No products found</h2>
          <p className="mb-4">Try adjusting your filters or explore other categories.</p>
          <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group flex flex-col"
            >
              <Link to={`/products/${product._id}`} className="block relative aspect-[4/5] overflow-hidden rounded-xl mb-4 bg-muted">
                <img
                  src={getImageUrl(product.images?.[0])}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white/90 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
                  </div>
                )}
                <button
                  onClick={(e) => handleWishlist(e, product)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product._id) ? 'text-primary fill-primary' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={(e) => handleQuickView(e, product)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white shadow-lg flex items-center gap-1.5"
                >
                  <Eye className="h-3 w-3" /> Quick View
                </button>
              </Link>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 mr-2">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-sm font-serif font-medium text-foreground hover:text-primary transition-colors truncate">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">{product.category}</p>
                  {product.numReviews > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-amber-400 text-xs">★</span>
                      <span className="text-xs text-muted-foreground">{product.rating?.toFixed(1)} ({product.numReviews})</span>
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-primary-dark flex-shrink-0">INR {product.price?.toFixed(2)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isQuickViewOpen && selectedProduct && (
        <Suspense fallback={null}>
          <QuickView
            product={selectedProduct}
            isOpen={isQuickViewOpen}
            onClose={() => setIsQuickViewOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Products;
