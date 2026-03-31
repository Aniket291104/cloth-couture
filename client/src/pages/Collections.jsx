import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Static collection definitions with descriptions and cover images
// ✏️ TO EDIT A COLLECTION: change label, description, coverImage, or accent below.
// ✏️ TO ADD A COLLECTION: add a new object with category matching the product category in DB.
const COLLECTION_DEFS = [
  {
    category: 'dresses',
    label: 'Linen Dresses',
    description: 'Breezy, natural fabric for effortless everyday elegance.',
    coverImage: '/images/dress.png',
    accent: 'from-rose-900/60',
  },
  {
    category: 'shirts',
    label: 'Cotton Shirts',
    description: 'Meticulously hand-stitched by artisans for the perfect fit.',
    coverImage: '/images/shirt.png',
    accent: 'from-stone-900/60',
  },
  {
    category: 'pants',
    label: 'Casual Pants',
    description: 'Comfortable handmade pants for any stylish occasion.',
    coverImage: '/images/dress.png',
    accent: 'from-amber-900/60',
  },
  {
    category: 'accessories',
    label: 'Accessories',
    description: 'Handcrafted shawls, bags and more to complete your look.',
    coverImage: '/images/dress.png',
    accent: 'from-teal-900/60',
  },
];

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndGroup = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products`);
        // Group products by category and count them
        const grouped = data.reduce((acc, product) => {
          const cat = product.category?.toLowerCase();
          if (!acc[cat]) acc[cat] = 0;
          acc[cat]++;
          return acc;
        }, {});

        // Merge with static defs, only show categories that have products OR are predefined
        const result = COLLECTION_DEFS.map((def) => ({
          ...def,
          count: grouped[def.category] || 0,
        }));

        // Also add any dynamic categories from DB that aren't in COLLECTION_DEFS
        Object.keys(grouped).forEach((cat) => {
          if (!COLLECTION_DEFS.find((d) => d.category === cat)) {
            result.push({
              category: cat,
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
              description: `Explore our handmade ${cat} collection.`,
              coverImage: '/images/dress.png',
              accent: 'from-neutral-900/60',
              count: grouped[cat],
            });
          }
        });

        setCollections(result);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setCollections(COLLECTION_DEFS.map((d) => ({ ...d, count: 0 })));
      } finally {
        setLoading(false);
      }
    };
    fetchAndGroup();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="relative h-64 md:h-80 w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_banner.png"
            alt="Collections Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-serif font-bold mb-3"
          >
            Our Collections
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-gray-300 text-lg"
          >
            Curated, handcrafted styles for every occasion
          </motion.p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {collections.map((col) => (
              <motion.div key={col.category} variants={itemVariants}>
                <Link
                  to={`/products?category=${col.category}`}
                  className="group block relative overflow-hidden rounded-2xl aspect-[3/4] shadow-lg"
                >
                  <img
                    src={col.coverImage}
                    alt={col.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${col.accent} to-transparent`} />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <p className="text-xs uppercase tracking-widest text-gray-300 mb-1 font-medium">
                      {col.count > 0 ? `${col.count} item${col.count !== 1 ? 's' : ''}` : 'Coming Soon'}
                    </p>
                    <h2 className="text-3xl font-serif font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                      {col.label}
                    </h2>
                    <p className="text-gray-300 text-sm font-light leading-relaxed mb-4">
                      {col.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-white border border-white/40 rounded-full px-5 py-2 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      Explore →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Collections;
