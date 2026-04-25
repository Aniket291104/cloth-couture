import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart, ChevronRight, Sparkles } from 'lucide-react';
import { getImageUrl } from '../lib/utils';
import AdaptiveImage from '@/components/ui/AdaptiveImage';

const RecentlyViewed = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setProducts(viewed.slice(0, 5));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-24 px-4 bg-muted/30 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
              <Sparkles className="h-3 w-3" /> Still interested in these?
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Pick up where you left off</h2>
          </div>
          <Link to="/products" className="group text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 transition-all hover:gap-3">
             Explore More <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 w-[240px] md:w-[280px]"
            >
              <Link to={`/products/${product._id}`} className="group relative block bg-background rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all h-full border border-border/50">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <AdaptiveImage
                    src={getImageUrl(product.images?.[0] || product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 240px, 280px"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                     <div className="bg-white text-primary px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <Eye className="h-4 w-4" /> View Item
                     </div>
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full tracking-widest animate-pulse">
                      Low Stock
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-serif font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-3">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-dark">₹{product.price?.toFixed(2)}</span>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
          
          {/* Last slide - Explore button */}
          <div className="flex-shrink-0 w-[240px] md:w-[280px] h-full flex items-center justify-center">
             <Link to="/products" className="flex flex-col items-center gap-4 group">
                <div className="w-16 h-16 rounded-full bg-primary/5 group-hover:bg-primary transition-all flex items-center justify-center">
                   <ChevronRight className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">See Collections</span>
             </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
