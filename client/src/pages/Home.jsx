import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdaptiveImage from '@/components/ui/AdaptiveImage';
import { API_BASE_URL, getImageUrl, readCachedJSON, readCachedJSONStale, writeCachedJSON } from '@/lib/utils';
import axios from 'axios';

const RecentlyViewed = lazy(() => import('../components/RecentlyViewed'));

const CATEGORY_CACHE_KEY = 'cc:home:categories:v1';
const CATEGORY_CACHE_TTL_MS = 15 * 60 * 1000;
const CATEGORY_FETCH_TIMEOUT_MS = 8000;
const CATEGORY_MAX_RETRIES = 3;
const CATEGORY_RETRY_DELAYS_MS = [0, 800, 1600, 3200];

const CategorySkeleton = () => (
  <div className="w-[160px] md:w-[220px] flex-shrink-0 rounded-xl aspect-[3/4] bg-muted animate-pulse" />
);

const Home = () => {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catsError, setCatsError] = useState('');
  const [catsReloadNonce, setCatsReloadNonce] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    let retryTimeoutId = null;

    const fetchCategories = async ({ showLoading, attempt = 0, allowStale = true } = {}) => {
      if (showLoading) {
        setCatsError('');
        setLoadingCats(true);
      }

      const cachedCategories = readCachedJSON(CATEGORY_CACHE_KEY, CATEGORY_CACHE_TTL_MS, window.sessionStorage);
      if (cachedCategories?.length) {
        if (isMounted) {
          setCategories(cachedCategories);
          setLoadingCats(false);
        }
        return;
      }

      const staleCategories = allowStale ? readCachedJSONStale(CATEGORY_CACHE_KEY, window.sessionStorage) : null;
      if (staleCategories?.length && isMounted) {
        setCategories(staleCategories);
        setLoadingCats(false);
        // Refresh in the background without blocking UI.
        fetchCategories({ showLoading: false, attempt: 0, allowStale: false });
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products/categories`, {
          signal: controller.signal,
          timeout: CATEGORY_FETCH_TIMEOUT_MS,
        });
        if (isMounted) {
          const nextCategories = Array.isArray(data) ? data : [];
          setCategories(nextCategories);
          writeCachedJSON(CATEGORY_CACHE_KEY, nextCategories, window.sessionStorage);
          setCatsError(nextCategories.length ? '' : 'No collections available right now.');
        }
      } catch (error) {
        const isCanceled = error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';
        if (isCanceled) return;
        console.error('Error fetching categories:', error);
        if (attempt < CATEGORY_MAX_RETRIES && isMounted) {
          retryTimeoutId = window.setTimeout(() => {
            fetchCategories({ showLoading: false, attempt: attempt + 1, allowStale });
          }, CATEGORY_RETRY_DELAYS_MS[Math.min(attempt + 1, CATEGORY_RETRY_DELAYS_MS.length - 1)]);
        } else if (isMounted) {
          setCatsError('Could not load collections. Please try again.');
        }
      } finally {
        if (showLoading && isMounted) setLoadingCats(false);
      }
    };

    fetchCategories({ showLoading: true, attempt: 0, allowStale: true });

    return () => {
      isMounted = false;
      controller.abort();
      if (retryTimeoutId) window.clearTimeout(retryTimeoutId);
    };
  }, [catsReloadNonce]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
    scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
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
      <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <AdaptiveImage
            src="/images/hero_banner.png"
            alt="Cloth Couture Artisan Fashion Showcase"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            sizes="100vw"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Timeless Elegance, <br /> Handmade for You.
          </h1>
          <p className="text-lg md:text-xl font-light mb-10 text-gray-200">
            Discover our exclusive collection of ethically crafted garments, designed to bring out your natural
            beauty and confidence.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary-dark text-white rounded-full px-8 py-6 text-lg tracking-wide shadow-lg"
            asChild
          >
            <Link to="/products">Shop the Collection</Link>
          </Button>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4 tracking-tight uppercase">
            Our Premium Collections
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-6 font-light leading-relaxed">
            Discover our meticulously crafted boutique collections, curated for timeless elegance and lasting quality.
          </p>
          <div className="w-16 h-0.5 bg-primary/60 mx-auto" />
        </div>

        <div className="relative group">
          {categories.length > 2 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity -ml-3 hidden md:block"
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity -mr-3 hidden md:block"
                aria-label="Scroll categories right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {loadingCats ? (
            <div className="flex gap-4 overflow-hidden pb-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <CategorySkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            catsError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-muted-foreground mb-4">{catsError}</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCatsError('');
                      setCatsReloadNonce((n) => n + 1);
                    }}
                  >
                    Retry
                  </Button>
                  <Button asChild>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => navigate(`/products?category=${cat.name}`)}
                  className="w-[160px] md:w-[220px] flex-shrink-0 group relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer snap-center shadow-lg bg-muted border border-border/50 transition-all duration-500 hover:shadow-2xl text-left"
                >
                  <AdaptiveImage
                    src={getImageUrl(cat.image)}
                    alt={`${cat.name} Collection | Cloth Couture Handmade Fashion`}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                    sizes="(max-width: 768px) 160px, 220px"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = '/images/hero_banner.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full text-white translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-1.5 block drop-shadow-sm">
                      Discover
                    </span>
                    <h3 className="text-xl md:text-2xl font-serif mb-2 capitalize leading-tight drop-shadow-md">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-700 uppercase tracking-widest text-primary-dark font-serif">
                      Explore All <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted py-24 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-serif font-bold text-primary-dark mb-6">Our Philosophy</h2>
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed font-light">
              We believe fashion should tell a story. In a world of fast production, we choose to slow down. Every
              piece in our collection is hand-cut, hand-stitched, and carefully crafted by skilled artisans.
            </p>
            <p className="text-lg text-foreground/80 mb-8 leading-relaxed font-light">
              By choosing handmade, you&apos;re not just buying clothes; you&apos;re preserving an age-old craft and
              embracing sustainable fashion that lasts a lifetime.
            </p>
            <Button variant="link" className="text-primary-dark p-0 text-lg group">
              <Link to="/about" className="flex items-center">
                Read our full story
                <span className="ml-2 transition-transform group-hover:translate-x-1">{'->'}</span>
              </Link>
            </Button>
          </div>
          <div className="md:w-1/2 aspect-square md:aspect-auto md:h-[500px] border-8 border-white shadow-xl relative">
            <AdaptiveImage
              src="/images/hero_banner.png"
              alt="Craftsmanship"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, 50vw"
              width={1200}
              height={1200}
            />
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary rounded-full -z-10 blur-2xl opacity-40" />
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-40 animate-pulse bg-muted/20" />}>
        <RecentlyViewed />
      </Suspense>

      <section className="py-24 px-4 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Join the Club</h2>
        <p className="text-muted-foreground mb-8">
          Subscribe to receive updates on new arrivals, special offers, and styling inspiration.
        </p>
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
          <p
            className={`mt-4 text-sm font-medium ${
              newsletterStatus === 'success' ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {newsletterStatus === 'success' ? '[OK] ' : '[X] '}
            {newsletterMsg}
          </p>
        )}
      </section>
    </div>
  );
};

export default Home;
