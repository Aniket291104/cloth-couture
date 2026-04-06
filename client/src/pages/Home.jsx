import React, { useState } from 'react';
import RecentlyViewed from '../components/RecentlyViewed';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { API_BASE_URL, getImageUrl } from '@/lib/utils';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Home = () => {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // idle | loading | success | error
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products/categories`);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    setNewsletterMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterMsg(data.message);
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMsg(data.message || 'Something went wrong.');
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMsg('Could not connect to server. Please try again.');
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_banner.png"
            alt="Cloth Couture Artisan Fashion Showcase"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/40" aria-hidden="true"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight"
          >
            Timeless Elegance, <br/> Handmade for You.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl font-light mb-10 text-gray-200"
          >
            Discover our exclusive collection of ethically crafted garments, designed to bring out your natural beauty and confidence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-white rounded-full px-8 py-6 text-lg tracking-wide shadow-lg" asChild>
              <Link to="/products">Shop the Collection</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className="py-12 md:py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4 tracking-tight uppercase">Our Premium Collections</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-6 font-light leading-relaxed">
            Discover our meticulously crafted boutique collections, curated for timeless elegance and lasting quality. 
          </p>
          <div className="w-16 h-0.5 bg-primary/60 mx-auto"></div>
        </div>

        <div className="relative group">
          {categories.length > 2 && (
            <>
              <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity -ml-3 hidden md:block"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity -mr-3 hidden md:block"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {loadingCats ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div 
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat, index) => (
                  <motion.div 
                  key={index}
                  variants={itemVariants} 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  onClick={() => navigate(`/products?category=${cat.name}`)} 
                  className="w-[160px] md:w-[220px] flex-shrink-0 group relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer snap-center shadow-lg bg-muted border border-border/50 transition-all duration-500 hover:shadow-2xl"
                >
                  <img
                    src={getImageUrl(cat.image)}
                    alt={`${cat.name} Collection | Cloth Couture Handmade Fashion`}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { e.target.src = '/images/hero_banner.png'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full text-white translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-1.5 block drop-shadow-sm">Discover</span>
                    <h3 className="text-xl md:text-2xl font-serif mb-2 capitalize leading-tight drop-shadow-md">{cat.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-700 uppercase tracking-widest text-primary-dark font-serif">
                      Explore All <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-muted py-24 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2"
          >
            <h2 className="text-4xl font-serif font-bold text-primary-dark mb-6">Our Philosophy</h2>
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed font-light">
              We believe fashion should tell a story. In a world of fast production, we choose to slow down. Every piece in our collection is hand-cut, hand-stitched, and carefully crafted by skilled artisans.
            </p>
            <p className="text-lg text-foreground/80 mb-8 leading-relaxed font-light">
              By choosing handmade, you're not just buying clothes; you're preserving an age-old craft and embracing sustainable fashion that lasts a lifetime.
            </p>
            <Button variant="link" className="text-primary-dark p-0 text-lg group">
              <Link to="/about" className="flex items-center">
                Read our full story
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 aspect-square md:aspect-auto md:h-[500px] border-8 border-white shadow-xl relative"
          >
            <img src="/images/hero_banner.png" alt="Craftsmanship" className="w-full h-full object-cover" />
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary rounded-full -z-10 blur-2xl opacity-40"></div>
          </motion.div>
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Newsletter */}
      <section className="py-24 px-4 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Join the Club</h2>
        <p className="text-muted-foreground mb-8">Subscribe to receive updates on new arrivals, special offers, and styling inspiration.</p>
        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
          <input
            type="email"
            placeholder="Enter your email address"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            className="flex-grow px-6 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background shadow-sm max-w-md w-full mx-auto"
            required
          />
          <Button
            type="submit"
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto mt-2 sm:mt-0"
            disabled={newsletterStatus === 'loading'}
          >
            {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
        {newsletterMsg && (
          <p className={`mt-4 text-sm font-medium ${
            newsletterStatus === 'success' ? 'text-green-600' : 'text-red-500'
          }`}>
            {newsletterStatus === 'success' ? '✅ ' : '❌ '}{newsletterMsg}
          </p>
        )}
      </section>
    </div>
  );
};

export default Home;
