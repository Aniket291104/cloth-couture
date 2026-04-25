import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Heart,
  Package,
  ChevronDown,
  LogOut,
  Settings,
  Moon,
  Sun,
  Loader2,
  Coins,
  Clock,
  History,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, getImageUrl, readCachedJSON, writeCachedJSON } from '@/lib/utils';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const SUGGESTION_CACHE_TTL_MS = 5 * 60 * 1000;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState(JSON.parse(localStorage.getItem('searchHistory') || '[]'));
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const suggestionsCacheRef = useRef(new Map());
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (normalizedKeyword.length < 2) {
      setSuggestions([]);
      return;
    }

    const memoryCached = suggestionsCacheRef.current.get(normalizedKeyword);
    if (memoryCached) {
      setSuggestions(memoryCached);
      setLoadingSuggestions(false);
      return;
    }

    const persistedCache = readCachedJSON(
      `cc:suggest:${normalizedKeyword}`,
      SUGGESTION_CACHE_TTL_MS,
      window.sessionStorage
    );
    if (persistedCache) {
      suggestionsCacheRef.current.set(normalizedKeyword, persistedCache);
      setSuggestions(persistedCache);
      setLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const delay = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products/suggestions`, {
          params: { keyword: normalizedKeyword },
          signal: controller.signal,
        });
        setSuggestions(data);
        suggestionsCacheRef.current.set(normalizedKeyword, data);
        writeCachedJSON(`cc:suggest:${normalizedKeyword}`, data, window.sessionStorage);
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        console.error(err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(delay);
    };
  }, [keyword]);

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

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      const query = keyword.trim();
      const updatedHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 5);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      navigate(`/products?keyword=${encodeURIComponent(query)}`);
    } else {
      navigate('/products');
    }
    setIsSearchOpen(false);
    setKeyword('');
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/collections', label: 'Collections' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-md z-50 border-b border-border shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24 px-2">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setIsOpen((prev) => !prev)} aria-label="Toggle mobile menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/" className="flex items-center">
              <div className="relative group">
                <img
                  src="/logo.png"
                  alt="Cloth Couture"
                  width="80"
                  height="80"
                  decoding="async"
                  className="h-16 md:h-20 w-16 md:w-20 object-cover rounded-full border-2 border-primary/30 shadow-2xl transition-all duration-300 hover:scale-110 hover:border-primary cursor-pointer ring-4 ring-primary/5"
                />
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.to ? 'text-primary' : 'text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {userInfo?.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            <div className="relative search-container">
              {isSearchOpen ? (
                <div className="flex items-center animate-in fade-in duration-200">
                  <form onSubmit={handleSearch} className="flex items-center overflow-hidden">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Search products..."
                      className="px-3 py-1.5 text-sm border-b border-primary bg-transparent focus:outline-none w-36 md:w-48 text-foreground"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setKeyword('');
                        setSuggestions([]);
                      }}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>

                  {(suggestions.length > 0 ||
                    (isSearchOpen && keyword.length === 0 && searchHistory.length > 0) ||
                    loadingSuggestions) &&
                    isSearchOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                        {loadingSuggestions && (
                          <div className="p-4 flex justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        )}

                        {!loadingSuggestions && keyword.length === 0 && searchHistory.length > 0 && (
                          <div className="py-2">
                            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 border-b border-border mb-1 bg-muted/30">
                              <History className="h-3 w-3" /> Recent Searches
                            </div>
                            {searchHistory.map((h, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setKeyword(h);
                                  navigate(`/products?keyword=${encodeURIComponent(h)}`);
                                  setIsSearchOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-3 text-sm"
                              >
                                <Clock className="h-3 w-3 opacity-40" /> {h}
                              </button>
                            ))}
                            <button
                              onClick={clearHistory}
                              className="w-full text-center py-2 text-[10px] font-bold text-muted-foreground hover:text-destructive border-t border-border uppercase"
                            >
                              Clear History
                            </button>
                          </div>
                        )}

                        {!loadingSuggestions && suggestions.length > 0 && (
                          <div className="py-2">
                            {suggestions.map((s) => (
                              <Link
                                key={s._id}
                                to={`/products/${s._id}`}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  setKeyword('');
                                  setSuggestions([]);
                                }}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                              >
                                <img
                                  src={getImageUrl(s.images?.[0])}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded"
                                  loading="lazy"
                                  decoding="async"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{s.name}</p>
                                  <p className="text-[10px] text-primary font-bold">INR {s.price}</p>
                                </div>
                              </Link>
                            ))}
                            <Link
                              to={`/products?keyword=${keyword}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="block text-center py-2 text-[10px] text-muted-foreground hover:text-primary border-t border-border mt-1"
                            >
                              See all results for "{keyword}"
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ) : (
                <button onClick={() => setIsSearchOpen(true)} className="text-foreground hover:text-primary transition-colors p-1">
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="text-foreground hover:text-primary transition-colors p-1"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            <Link to="/wishlist" className="relative text-foreground hover:text-primary transition-colors p-1">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative text-foreground hover:text-primary transition-colors p-1">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {cartItems.length}
              </span>
            </Link>

            {userInfo ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary-dark hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                    {userInfo.name?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className={`h-3 w-3 transition-transform hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">{userInfo.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Coins className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary-dark">{userInfo.loyaltyPoints || 0} Couture Coins</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{userInfo.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" /> My Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Package className="h-4 w-4 text-muted-foreground" /> My Orders
                      </Link>
                      {userInfo.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-muted transition-colors"
                        >
                          <User className="h-4 w-4" /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-foreground hover:text-primary transition-colors p-1">
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden overflow-hidden bg-background border-b border-border animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="py-2.5 px-3 text-sm font-medium hover:text-primary hover:bg-muted rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {userInfo && (
              <>
                <Link
                  to="/my-orders"
                  className="py-2.5 px-3 text-sm font-medium hover:text-primary hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                >
                  <Package className="h-4 w-4" /> My Orders
                </Link>
                <Link
                  to="/profile"
                  className="py-2.5 px-3 text-sm font-medium hover:text-primary hover:bg-muted rounded-lg transition-colors flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> My Profile
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    <Coins className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold text-primary-dark">{userInfo.loyaltyPoints || 0}</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-2.5 px-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
