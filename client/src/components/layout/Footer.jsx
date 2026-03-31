import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-serif font-bold text-primary-dark mb-4 inline-block">
              Cloth Couture
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Handcrafted clothing made with love and care. Every piece tells a story.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-serif">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition">Shop All</Link></li>
              <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-serif">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition">Privacy Policy</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition">Return Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-serif">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition"><Instagram className="h-5 w-5" /></a>
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
