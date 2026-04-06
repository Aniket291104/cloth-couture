import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '../lib/utils';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const moveToCart = (product) => {
    addToCart({
      product: product._id,
      name: product.name,
      image: product.image || product.images?.[0],
      price: product.price,
      countInStock: product.stock,
      qty: 1,
      size: product.sizes?.[0] || '',
    });
    removeFromWishlist(product._id);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-primary-dark flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          My Wishlist
        </h1>
        <p className="text-muted-foreground mt-2">
          {wishlist.length > 0
            ? `${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} saved`
            : 'Your wishlist is empty'}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 flex flex-col items-center"
        >
          <Heart className="h-20 w-20 text-gray-200 mb-6" />
          <h2 className="text-2xl font-serif text-foreground mb-2">Nothing saved yet</h2>
          <p className="text-muted-foreground mb-8">Browse our collections and tap the ♡ heart to save your favourites.</p>
          <Button asChild className="bg-primary hover:bg-primary-dark text-white rounded-full px-8">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <AnimatePresence>
            {wishlist.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.35 }}
                className="group flex flex-col"
              >
                {/* Image */}
                <Link
                  to={`/products/${product._id}`}
                  className="relative aspect-[4/5] overflow-hidden rounded-lg mb-4 bg-muted block"
                >
                  <img
                    src={getImageUrl(product.images?.[0] || product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Remove from wishlist */}
                  <button
                    onClick={(e) => { e.preventDefault(); removeFromWishlist(product._id); }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-red-400 hover:text-red-600 hover:scale-110 transition-all"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Link>

                {/* Info */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Link to={`/products/${product._id}`}>
                      <h3 className="text-base font-serif font-medium text-foreground hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground capitalize mt-0.5">{product.category}</p>
                  </div>
                  <p className="text-base font-semibold text-primary-dark">${product.price?.toFixed(2)}</p>
                </div>

                {/* Move to Cart */}
                <Button
                  size="sm"
                  onClick={() => moveToCart(product)}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-colors mt-auto"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Move to Cart
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Wishlist;
