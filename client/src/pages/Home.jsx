import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    setNewsletterMsg('');
    try {
      const res = await fetch('http://localhost:5001/api/newsletter/subscribe', {
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
            alt="Handmade Clothing Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
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
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Featured Collections</h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Collection 1 */}
          <motion.div variants={itemVariants} onClick={() => navigate('/products?category=dresses')} className="group relative overflow-hidden rounded-lg aspect-[3/4] cursor-pointer">
            <img
              src="/images/dress.png"
              alt="Women's Collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h3 className="text-3xl font-serif text-white mb-3">Linen Dresses</h3>
              <p className="text-gray-300 font-light mb-4">Breezy, natural fabric for effortless everyday wear.</p>
              <Button variant="outline" className="text-black border-white bg-white hover:bg-primary hover:text-white hover:border-primary">
                <Link to="/products?category=dresses">Explore</Link>
              </Button>
            </div>
          </motion.div>

          {/* Collection 2 */}
          <motion.div variants={itemVariants} onClick={() => navigate('/products?category=shirts')} className="group relative overflow-hidden rounded-lg aspect-[3/4] cursor-pointer">
            <img
              src="/images/shirt.png"
              alt="Men's Collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h3 className="text-3xl font-serif text-white mb-3">Cotton Shirts</h3>
              <p className="text-gray-300 font-light mb-4">Meticulously stitched by artisans for the perfect fit.</p>
              <Button variant="outline" className="text-black border-white bg-white hover:bg-primary hover:text-white hover:border-primary">
                <Link to="/products?category=shirts">Explore</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
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
