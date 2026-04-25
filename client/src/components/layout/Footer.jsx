import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Facebook, Instagram, Mail, MapPin, Phone, Send, Twitter } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { to: '/products', label: 'Shop All' },
        { to: '/collections', label: 'Collections' },
        { to: '/products?category=dresses', label: 'Dresses' },
        { to: '/products?category=shirts', label: 'Shirts' },
        { to: '/wishlist', label: 'Wishlist' },
      ],
    },
    {
      title: 'Help',
      links: [
        { to: '/about', label: 'About Us' },
        { to: '/contact', label: 'Contact' },
        { to: '/faq', label: 'FAQ' },
        { to: '/shipping', label: 'Shipping' },
        { to: '/returns', label: 'Returns' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { to: '/terms', label: 'Terms of Service' },
        { to: '/privacy', label: 'Privacy Policy' },
        { to: '/returns', label: 'Return Policy' },
      ],
    },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setMessage('');
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, { email: email.trim() });
      setMessage(data.message || 'Subscribed successfully.');
      setEmail('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Subscription failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-secondary text-secondary-foreground pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 mb-10">
          <div className="lg:col-span-3">
            <Link to="/" className="text-2xl font-serif font-bold text-primary-dark mb-4 inline-block">
              Cloth Couture
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Handcrafted clothing made with love and care. Every piece tells a story.
            </p>
            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <a href="mailto:support@clothcouture.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" /> support@clothcouture.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" /> +91 98765 43210
              </a>
              <p className="flex items-center gap-3">
                <MapPin className="h-4 w-4" /> Mumbai, India
              </p>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h4 className="font-bold mb-4 font-serif">{section.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <Link to={link.to} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-3">
            <h4 className="font-bold mb-4 font-serif">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">New drops, styling notes, and offers in your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
                aria-label="Subscribe to newsletter"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            {message && <p className="mt-2 text-xs text-muted-foreground">{message}</p>}
            <div className="flex space-x-4 mt-6">
              <a href="https://www.facebook.com/" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="https://twitter.com/" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="https://www.instagram.com/" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-muted-foreground/20 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Cloth Couture. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
