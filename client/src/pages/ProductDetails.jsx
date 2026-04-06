import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star, ZoomIn, X, Share2, ChevronLeft, ChevronRight, Ruler, Users, Flame, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL, getImageUrl } from '@/lib/utils';

/* ── Loading Skeleton ── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
);

/* ── Size Guide Modal ── */
const SizeGuideModal = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
      onClick={e => e.stopPropagation()}
      className="bg-background rounded-2xl shadow-2xl p-6 max-w-lg w-full"
    >
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-serif font-bold flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" /> Size Guide
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-full"><X className="h-5 w-5" /></button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted">
            {['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)'].map(h => (
              <th key={h} className="py-2 px-3 text-left font-semibold text-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['XS', '31–33', '23–25', '33–35'],
            ['S',  '34–36', '26–28', '36–38'],
            ['M',  '37–39', '29–31', '39–41'],
            ['L',  '40–42', '32–34', '42–44'],
            ['XL', '43–45', '35–37', '45–47'],
            ['XXL','46–48', '38–40', '48–50'],
          ].map(([size, ...rest], i) => (
            <tr key={size} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
              <td className="py-2 px-3 font-medium">{size}</td>
              {rest.map((v, j) => <td key={j} className="py-2 px-3 text-muted-foreground">{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground mt-4">* Measurements are approximate. For best fit, compare with your own measurements.</p>
    </motion.div>
  </motion.div>
);

/* ── Image Zoom Modal ── */
const ZoomModal = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length);
  const next = () => setCurrent(c => (c + 1) % images.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
        <X className="h-8 w-8" />
      </button>
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 text-white hover:text-gray-300 bg-white/10 rounded-full p-2 z-10">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={next} className="absolute right-4 text-white hover:text-gray-300 bg-white/10 rounded-full p-2 z-10">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      <motion.img
        key={current}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        src={getImageUrl(images[current])} alt="Product zoom"
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

/* ── Star Rating Display ── */
const StarRating = ({ rating, size = 'sm' }) => {
  const s = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${s} ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
      ))}
    </div>
  );
};

/* ── Review Form ── */
const ReviewForm = ({ productId, onReviewAdded }) => {
  const { addToast } = useToast();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) { addToast('Please login to leave a review', 'error'); return; }
    if (!comment.trim()) { addToast('Please write a comment', 'error'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/products/${productId}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      addToast('Review submitted!', 'success');
      setComment('');
      setRating(5);
      onReviewAdded();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-muted/50 rounded-xl p-5 border border-border">
      <h3 className="font-semibold text-foreground mb-4">Write a Review</h3>
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map(i => (
          <button type="button" key={i}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
          >
            <Star className={`h-7 w-7 transition-colors ${(hover || rating) >= i ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment} onChange={e => setComment(e.target.value)}
        placeholder="Share your experience with this product..."
        rows={3}
        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
      <Button type="submit" disabled={submitting} className="mt-3 bg-primary hover:bg-primary-dark text-white">
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

/* ── Pulsing Badge for Urgency ── */
const PulsingBadge = ({ icon: Icon, text, colorClass = "text-amber-600 bg-amber-50 border-amber-200" }) => (
  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider animate-pulse ${colorClass}`}>
    <Icon className="h-3 w-3" /> {text}
  </div>
);

/* ── Main Component ── */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [showZoom, setShowZoom] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 12) + 4);
  const [boughtToday, setBoughtToday] = useState(Math.floor(Math.random() * 6) + 1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/products/${id}/reviews`);
      setReviews(data);
    } catch {}
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [productRes, relatedRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products/${id}`),
          axios.get(`${API_BASE_URL}/api/products/${id}/related`),
        ]);
        setProduct(productRes.data);
        setRelated(relatedRes.data);
        if (productRes.data.sizes?.length > 0) setSize(productRes.data.sizes[0]);
        if (productRes.data.colors?.length > 0) setColor(productRes.data.colors[0]);
        setActiveImage(0);
      } catch {
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    fetchReviews();
  }, [id, navigate]);

  // Track recently viewed
  useEffect(() => {
    if (!product) return;
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = viewed.filter(p => p._id !== product._id);
    localStorage.setItem('recentlyViewed', JSON.stringify([product, ...filtered].slice(0, 6)));
  }, [product]);

  const addToCartHandler = async () => {
    if (!size && product.sizes?.length > 0) { addToast('Please select a size', 'error'); return; }
    
    // Save preference for "easy visit"
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && size) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, { 
          preferences: { ...userInfo.preferences, size } 
        }, config);
        localStorage.setItem('userInfo', JSON.stringify(data));
      } catch (err) { console.error("Could not save preference"); }
    }

    addToCart({
      product: product._id, name: product.name,
      image: product.images?.[0], price: product.price,
      countInStock: product.stock, qty, size, color,
    });
    addToast(`${product.name} added to cart!`, 'success');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, url });
    } else {
      navigator.clipboard.writeText(url);
      addToast('Link copied to clipboard!', 'info');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
        <div className="space-y-3">
          <Skeleton className="aspect-[4/5]" />
          <div className="flex gap-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="w-20 h-20" />)}</div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const images = product?.images || [];
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm">
        <ChevronLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-12 mb-20">
        {/* ── Images ── */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="relative aspect-[4/5] bg-muted rounded-2xl overflow-hidden group cursor-zoom-in mb-3"
            onClick={() => setShowZoom(true)}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={getImageUrl(images[activeImage])}
                alt={product.name}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </AnimatePresence>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/80 backdrop-blur-sm rounded-full p-3">
                <ZoomIn className="h-6 w-6 text-gray-700" />
              </div>
            </div>
            {images.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); setActiveImage(i => (i - 1 + images.length) % images.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={e => { e.stopPropagation(); setActiveImage(i => (i + 1) % images.length); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? 'border-primary' : 'border-transparent hover:border-border'}`}>
                <img src={getImageUrl(img)} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Info ── */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-serif font-bold text-foreground flex-1">{product.name}</h1>
            <button onClick={handleShare} className="ml-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating || 0} />
            <span className="text-sm text-muted-foreground">
              {product.rating > 0 ? product.rating.toFixed(1) : 'No'} rating · {product.numReviews} review{product.numReviews !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="text-3xl font-bold text-primary-dark mb-4">₹{product.price?.toFixed(2)}</div>

          {/* Social Proof Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-[10px] font-medium text-muted-foreground">
              <Eye className="h-3 w-3" /> {viewers} people are viewing this right now
            </div>
            {boughtToday > 2 && (
              <PulsingBadge icon={Flame} text={`${boughtToday} sold in last 24h`} />
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <PulsingBadge icon={Flame} text={`Only ${product.stock} left in stock!`} colorClass="text-red-600 bg-red-50 border-red-200" />
            )}
          </div>

          <p className="text-foreground/80 mb-6 leading-relaxed font-light">{product.description}</p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mb-6">
              <span className="font-medium text-sm mb-2 block text-foreground">Color: <span className="text-muted-foreground">{color}</span></span>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${color === c ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary text-foreground'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm text-foreground">Size: <span className="text-muted-foreground">{size}</span></span>
                <button onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-primary border-b border-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-all ${size === s ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary text-foreground'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <span className="font-medium text-sm block mb-2 text-foreground">Quantity</span>
            <div className="inline-flex items-center border border-border rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 hover:bg-muted transition-colors text-lg">−</button>
              <span className="px-5 py-2 font-medium text-center w-14">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-2 hover:bg-muted transition-colors text-lg">+</button>
            </div>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 ml-3 font-medium">{product.stock} in stock</span>
            ) : (
              <span className="text-sm text-destructive ml-3 font-medium">Out of stock</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" onClick={addToCartHandler} disabled={product.stock === 0}
              className="flex-1 bg-primary hover:bg-primary-dark text-white rounded-xl py-6 text-base">
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button size="lg" variant="outline" onClick={() => { toggleWishlist(product); addToast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist!', 'info'); }}
              className={`px-5 rounded-xl py-6 border-2 hover:bg-transparent ${inWishlist ? 'border-primary' : 'border-border hover:border-primary'}`}>
              <Heart className={`h-5 w-5 ${inWishlist ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
            </Button>
          </div>

          {/* Meta */}
          <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground space-y-2">
            <p><span className="text-foreground font-medium">Category:</span> <span className="capitalize">{product.category}</span></p>
            <p><span className="text-foreground font-medium">Shipping:</span> Free on orders over ₹1500. Handmade items ship in 7–10 days.</p>
          </div>
        </motion.div>
      </div>

      {/* ── Reviews Section ── */}
      <div className="mb-20">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground mb-6">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-4 mb-6">
            {reviews.map(review => (
              <div key={review._id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-foreground">{review.name}</span>
                    <span className="text-xs text-muted-foreground ml-3">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
        <ReviewForm productId={id} onReviewAdded={fetchReviews} />
      </div>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map(p => (
              <Link key={p._id} to={`/products/${p._id}`} className="group">
                <div className="aspect-[4/5] bg-muted rounded-xl overflow-hidden mb-3 relative">
                  <img src={getImageUrl(p.images?.[0])} alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="font-serif font-medium text-sm text-foreground hover:text-primary transition-colors truncate">{p.name}</h3>
                <p className="text-sm font-semibold text-primary-dark mt-0.5">₹{p.price?.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showZoom && <ZoomModal images={images} startIndex={activeImage} onClose={() => setShowZoom(false)} />}
        {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
