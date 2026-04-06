import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, Heart, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/utils';

const QuickView = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(product?.sizes?.[0] || '');

  if (!product) return null;

  const handleAddToCart = () => {
    if (!size && product.sizes?.length > 0) {
      addToast('Please select a size', 'error');
      return;
    }
    addToCart({
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      price: product.price,
      countInStock: product.stock,
      qty,
      size,
    });
    addToast(`${product.name} added to cart!`, 'success');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-background w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full text-foreground hover:text-primary transition-colors border border-border"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left: Images */}
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-muted">
              <img
                src={getImageUrl(product.images?.[0])}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current text-muted" />
                </div>
                <span className="text-xs text-muted-foreground">({product.numReviews || 0} reviews)</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">{product.name}</h2>
              <p className="text-xl font-bold text-primary mb-4">₹{product.price.toFixed(2)}</p>
              
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                {product.description}
              </p>

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">Select Size</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`w-10 h-10 rounded-full border-2 text-xs font-bold transition-all ${
                          size === s ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary text-foreground'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty & Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-6 border-t border-border">
                <div className="inline-flex items-center border border-border rounded-xl overflow-hidden h-12">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 hover:bg-muted transition-colors">-</button>
                  <span className="px-4 py-2 font-bold w-12 text-center text-sm">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-2 hover:bg-muted transition-colors">+</button>
                </div>
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 rounded-xl h-12 text-sm font-bold bg-primary hover:bg-primary-dark text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                </Button>
              </div>

              <Link 
                to={`/products/${product._id}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mt-6 hover:gap-2 transition-all"
              >
                View Full Details <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickView;
