import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Heart, Package, ChevronDown, LogOut, Settings, Moon, Sun, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  // Dark mode handler
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Search suggestions handler (debounce)
  useEffect(() => {
    if (keyword.length < 2) {
      setSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products/suggestions?keyword=${keyword}`);
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [keyword]);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (!e.target.closest('.search-container')) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on route change
  useEffect(() => { setIsOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
    } else {
      navigate('/products');
    }
    setIsSearchOpen(false);
    setKeyword('');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/collections', label: 'Collections' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/" className="text-2xl font-serif font-bold text-primary-dark tracking-tight">
              Cloth Couture
            </Link>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.to ? 'text-primary' : 'text-foreground'}`}>
                {link.label}
              </Link>
            ))}
            {userInfo?.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right icons */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative search-container">
              <AnimatePresence>
                {isSearchOpen ? (
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex items-center">
                    <form onSubmit={handleSearch} className="flex items-center overflow-hidden">
                      <input
                        type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
                        placeholder="Search products..."
                        className="px-3 py-1.5 text-sm border-b border-primary bg-transparent focus:outline-none w-36 md:w-48 text-foreground"
                        autoFocus
                      />
                      <button type="button" onClick={() => { setIsSearchOpen(false); setKeyword(''); setSuggestions([]); }} className="ml-1 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                    
                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                      {(suggestions.length > 0 || loadingSuggestions) && isSearchOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-[60]"
                        >
                          {loadingSuggestions ? (
                            <div className="p-4 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                          ) : (
                            <div className="py-2">
                              {suggestions.map(s => (
                                <Link
                                  key={s._id} to={`/products/${s._id}`}
                                  onClick={() => { setIsSearchOpen(false); setKeyword(''); setSuggestions([]); }}
                                  className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                                >
                                  <img src={s.images?.[0]} alt="" className="w-10 h-10 object-cover rounded" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">{s.name}</p>
                                    <p className="text-[10px] text-primary font-bold">₹{s.price}</p>
                                  </div>
                                </Link>
                              ))}
                              <Link to={`/products?keyword=${keyword}`} onClick={() => setIsSearchOpen(false)} className="block text-center py-2 text-[10px] text-muted-foreground hover:text-primary border-t border-border mt-1">
                                See all results for "{keyword}"
                              </Link>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <button onClick={() => setIsSearchOpen(true)} className="text-foreground hover:text-primary transition-colors p-1">
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="text-foreground hover:text-primary transition-colors p-1"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative text-foreground hover:text-primary transition-colors p-1">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-foreground hover:text-primary transition-colors p-1">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {cartItems.length}
              </span>
            </Link>

            {/* User menu */}
            {userInfo ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(v => !v)}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary-dark hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                    {userInfo.name?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className={`h-3 w-3 transition-transform hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">{userInfo.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                          <Settings className="h-4 w-4 text-muted-foreground" /> My Profile
                        </Link>
                        <Link to="/my-orders" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                          <Package className="h-4 w-4 text-muted-foreground" /> My Orders
                        </Link>
                        {userInfo.role === 'admin' && (
                          <Link to="/admin/dashboard" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-muted transition-colors">
                            <User className="h-4 w-4" /> Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-border mt-1 pt-1">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                            <LogOut className="h-4 w-4" /> Logout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="text-foreground hover:text-primary transition-colors p-1">
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="flex flex-col px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className="py-2.5 px-3 text-sm font-medium hover:text-primary hover:bg-muted rounded-lg transition-colors">
                  {link.label}
                </Link>
              ))}
              {userInfo && (
                <>
                  <Link to="/my-orders" className="py-2.5 px-3 text-sm font-medium hover:text-primary hover:bg-muted rounded-lg transition-colors flex items-center gap-2">
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  <Link to="/profile" className="py-2.5 px-3 text-sm font-medium hover:text-primary hover:bg-muted rounded-lg transition-colors flex items-center gap-2">
                    <Settings className="h-4 w-4" /> My Profile
                  </Link>
                  <button onClick={handleLogout} className="py-2.5 px-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left">
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
