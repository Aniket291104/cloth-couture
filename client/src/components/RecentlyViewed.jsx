import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const RecentlyViewed = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setProducts(viewed.slice(0, 4));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-serif font-bold text-foreground">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, i) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link to={`/products/${product._id}`} className="group block">
              <div className="aspect-[4/5] bg-muted rounded-xl overflow-hidden mb-2">
                <img
                  src={product.images?.[0] || product.image || '/images/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-sm font-serif font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {product.name}
              </h3>
              <p className="text-sm font-semibold text-primary-dark mt-0.5">₹{product.price?.toFixed(2)}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
