import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const { cartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
      setIsSearchOpen(false);
      setKeyword('');
    } else {
      navigate('/products');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/" className="text-2xl font-serif font-bold text-primary-dark">
              Cloth Couture
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">Shop</Link>
            <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">Collections</Link>
            {userInfo && userInfo.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Admin Panel</Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input 
                  type="text" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search..." 
                  className="px-2 py-1 text-sm border-b border-primary bg-transparent focus:outline-none w-24 sm:w-32 md:w-48 transition-all"
                  autoFocus
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="text-foreground hover:text-primary transition-colors">
                <Search className="h-5 w-5" />
              </button>
            )}
            <Link to="/cart" className="relative text-foreground hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartItems.length}
              </span>
            </Link>
            {userInfo ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-primary-dark cursor-default">Hi, {userInfo.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="text-foreground hover:text-primary transition-colors">
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="flex flex-col px-4 py-4 space-y-4">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Shop</Link>
              <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Collections</Link>
              <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Our Story</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
