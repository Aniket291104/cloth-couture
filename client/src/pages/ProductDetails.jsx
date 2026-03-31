import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5001/api/products/${id}`);
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSize(data.sizes[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    addToCart({
      product: product._id,
      name: product.name,
      image: product.image || product.images?.[0],
      price: product.price,
      countInStock: product.stock,
      qty,
      size,
    });
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products" className="text-secondary hover:text-primary transition-colors mb-8 inline-block">
        ← Back to Shop
      </Link>
      
      <div className="grid md:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="aspect-[4/5] bg-muted rounded-lg overflow-hidden group"
        >
          <img 
            src={product.image || (product.images && product.images[0])} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center"
        >
          <h1 className="text-4xl font-serif text-foreground font-bold mb-4">{product.name}</h1>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">(12 reviews)</span>
          </div>
          
          <h2 className="text-3xl font-semibold text-primary-dark mb-6">${product.price?.toFixed(2)}</h2>
          
          <p className="text-foreground/80 mb-8 leading-relaxed font-light">{product.description}</p>
          
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Size:</span>
                <span className="text-sm border-b border-primary text-primary cursor-pointer hover:text-primary-dark">Size Guide</span>
              </div>
              <div className="flex space-x-4">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
                      size === s 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-border text-foreground hover:border-primary-dark'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-10">
            <span className="font-medium block mb-4">Quantity:</span>
            <div className="flex items-center space-x-4 border border-border rounded-md w-max px-4 py-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-xl px-2 hover:text-primary transition-colors">-</button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="text-xl px-2 hover:text-primary transition-colors">+</button>
            </div>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 mt-2 block">{product.stock} In Stock</span>
            ) : (
              <span className="text-sm text-destructive mt-2 block">Out of Stock</span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              onClick={addToCartHandler} 
              disabled={product.stock === 0}
              className="flex-1 bg-primary hover:bg-primary-dark text-white rounded-md py-6 text-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="px-6 rounded-md py-6 text-lg group hover:border-primary hover:bg-transparent">
              <Heart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border space-y-4 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground block md:inline w-24">Category:</span> <span className="capitalize">{product.category}</span></p>
            <p><span className="font-medium text-foreground block md:inline w-24">Shipping:</span> Free shipping on orders over $150. Handmade items ship within 7-10 days.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;
