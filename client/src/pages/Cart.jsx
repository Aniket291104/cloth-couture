import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Tag, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, getImageUrl } from '@/lib/utils';
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart } = useCart();
  const { addToast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const updateQuantity = (item, newQty) => addToCart({ ...item, qty: newQty });

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const shippingPrice = itemsPrice > 1500 ? 0 : 100;
  const taxPrice = itemsPrice * 0.05;      // 5% GST
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) { addToast('Please login to apply coupons', 'error'); return; }
    setCouponLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/coupons/validate`,
        { code: couponCode, orderAmount: itemsPrice },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setAppliedCoupon(data);
      addToast(`Coupon applied! You save ₹${data.discountAmount.toFixed(2)}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid coupon', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    addToast('Coupon removed', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-muted rounded-2xl border border-border">
          <h2 className="text-2xl font-serif text-muted-foreground mb-4">Your cart is empty</h2>
          <Button asChild className="bg-primary hover:bg-primary-dark text-white rounded-full px-8">
            <Link to="/products">Go Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Items */}
          <div className="lg:w-2/3">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <ul className="divide-y divide-border">
                {cartItems.map(item => (
                  <li key={`${item.product}-${item.size}`} className="p-5 flex flex-col sm:flex-row gap-4">
                    <img src={getImageUrl(item.image)} alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link to={`/products/${item.product}`} className="font-medium hover:text-primary transition-colors">
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-0.5">Size: {item.size}{item.color && ` · ${item.color}`}</p>
                          <p className="text-sm font-semibold text-primary-dark mt-1">₹{item.price.toFixed(2)}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.product, item.size)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-border rounded-xl overflow-hidden">
                          <button onClick={() => updateQuantity(item, Math.max(1, item.qty - 1))}
                            className="px-3 py-1.5 hover:bg-muted transition-colors text-lg">−</button>
                          <span className="px-4 py-1.5 text-sm font-medium">{item.qty}</span>
                          <button onClick={() => updateQuantity(item, Math.min(item.countInStock || 10, item.qty + 1))}
                            className="px-3 py-1.5 hover:bg-muted transition-colors text-lg">+</button>
                        </div>
                        <p className="font-bold text-primary-dark">₹{(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:w-1/3">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm sticky top-20">
              <h2 className="text-xl font-serif font-bold text-foreground mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" /> Coupon Code
                </p>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-green-700 font-medium flex-1">{appliedCoupon.code} applied</span>
                    <button onClick={removeCoupon} className="text-green-600 hover:text-red-500 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                    />
                    <Button onClick={applyCoupon} disabled={couponLoading} size="sm"
                      className="bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-colors px-4">
                      {couponLoading ? '...' : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 text-sm text-muted-foreground border-t border-border pt-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.qty, 0)} items)</span>
                  <span className="text-foreground font-medium">₹{itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-foreground font-medium">{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="text-foreground font-medium">₹{taxPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>−₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-base">
                  <span>Total</span>
                  <span className="text-primary-dark text-lg">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button asChild className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-6 text-base mt-5"
                state={{ coupon: appliedCoupon, discountAmount }}>
                <Link to="/checkout" state={{ coupon: appliedCoupon, discountAmount, itemsPrice, shippingPrice, taxPrice, totalPrice }}>
                  Proceed to Checkout
                </Link>
              </Button>
              <div className="mt-3 text-center">
                <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">or Continue Shopping</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
