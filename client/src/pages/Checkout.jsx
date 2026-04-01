import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/utils';
import { useToast } from '../context/ToastContext';
import { MapPin, CreditCard, Loader2, Phone } from 'lucide-react';

// Load Razorpay script dynamically
const loadRazorpay = () =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  const { addToast } = useToast();

  // Get coupon/pricing passed from cart
  const cartState = location.state || {};
  const appliedCoupon = cartState.coupon || null;
  const discountAmount = cartState.discountAmount || 0;

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Pre-fill from profile
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.address) {
      setAddress(userInfo.address.address || '');
      setCity(userInfo.address.city || '');
      setPostalCode(userInfo.address.postalCode || '');
      setCountry(userInfo.address.country || '');
      setPhone(userInfo.address.phone || userInfo.phone || '');
      setAlternatePhone(userInfo.address.alternatePhone || '');
    } else if (userInfo?.phone) {
      setPhone(userInfo.phone);
    }
  }, []);

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const shippingPrice = itemsPrice > 1500 ? 0 : 100;
  const taxPrice = itemsPrice * 0.05;
  const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) { addToast('Geolocation not supported', 'error'); return; }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          // Use native fetch (not axios) to avoid global withCredentials:true CORS conflict
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (!res.ok) throw new Error('Reverse geocoding failed');
          const data = await res.json();
          if (data?.address) {
            const a = data.address;
            setAddress(
              [a.house_number, a.road, a.suburb, a.neighbourhood]
                .filter(Boolean).join(', ')
              || data.display_name || ''
            );
            setCity(a.city || a.town || a.village || a.county || '');
            setPostalCode(a.postcode || '');
            setCountry(a.country || '');
          }
          addToast('Location fetched successfully!', 'success');
        } catch { addToast('Could not fetch address. Please enter manually.', 'error'); }
        finally { setFetchingLocation(false); }
      },
      (err) => {
        setFetchingLocation(false);
        if (err.code === 1) addToast('Location permission denied. Please allow location access.', 'error');
        else addToast('Could not get your location. Please enter manually.', 'error');
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) { addToast('Please fill all address fields', 'error'); return; }
    if (!phone) { addToast('Please enter a phone number for delivery', 'error'); return; }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) { addToast('Enter a valid 10-digit Indian mobile number', 'error'); return; }
    if (alternatePhone && !phoneRegex.test(alternatePhone)) { addToast('Enter a valid alternate phone number', 'error'); return; }
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) { navigate('/login'); return; }
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    setPlacingOrder(true);

    try {
      // First, create the order record
      const { data: order } = await axios.post(`${API_BASE_URL}/api/orders`, {
        orderItems: cartItems,
        shippingAddress: { address, city, postalCode, country, phone, alternatePhone },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        couponCode: appliedCoupon?.code || '',
        discountAmount,
      }, config);

      if (paymentMethod === 'Razorpay') {
        const loaded = await loadRazorpay();
        if (!loaded) { addToast('Razorpay failed to load. Try again.', 'error'); setPlacingOrder(false); return; }

        // Create razorpay order
        const { data: rzpOrder } = await axios.post(`${API_BASE_URL}/api/orders/razorpay`,
          { amount: totalPrice }, config);

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'Cloth Couture',
          description: 'Handmade Clothing Purchase',
          order_id: rzpOrder.id,
          handler: async (response) => {
            try {
              await axios.put(`${API_BASE_URL}/api/orders/${order._id}/pay`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }, config);
              clearCart();
              navigate('/order-success', { state: { order: { ...order, paymentStatus: 'Paid' } } });
            } catch { addToast('Payment verification failed', 'error'); }
          },
          prefill: { name: userInfo.name, email: userInfo.email },
          theme: { color: '#c8956c' },
          modal: { ondismiss: () => { setPlacingOrder(false); } },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return; // Don't clearCart here — wait for handler
      }

      // COD
      clearCart();
      navigate('/order-success', { state: { order } });
    } catch (err) {
      addToast(err.response?.data?.message || 'Order failed. Please try again.', 'error');
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-2/3">
          <form id="checkout-form" onSubmit={placeOrderHandler}>
            {/* Shipping */}
            <Card className="mb-6 rounded-2xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Shipping Address
                  </CardTitle>
                  <Button type="button" variant="outline" size="sm" disabled={fetchingLocation}
                    onClick={fetchCurrentLocation} className="rounded-lg text-xs">
                    {fetchingLocation ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    {fetchingLocation ? 'Fetching...' : '📍 Use Location'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Street address..." value={address} onChange={e => setAddress(e.target.value)} required className="rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="City" value={city} onChange={e => setCity(e.target.value)} required className="rounded-xl" />
                  <Input placeholder="PIN Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} required className="rounded-xl" />
                </div>
                <Input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} required className="rounded-xl" />
                {/* Phone Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="tel"
                      placeholder="Phone number (required)"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      maxLength={10}
                      className="rounded-xl pl-9"
                    />
                    {phone.length === 10 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs">✓</span>
                    )}
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="tel"
                      placeholder="Alternate phone (optional)"
                      value={alternatePhone}
                      onChange={e => setAlternatePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      className="rounded-xl pl-9"
                    />
                    {alternatePhone.length === 10 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs">✓</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Our delivery partner will contact you on this number.
                </p>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'Razorpay' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <input type="radio" name="payment" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={e => setPaymentMethod(e.target.value)} className="accent-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Online Payment</p>
                      <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking via Razorpay</p>
                    </div>
                    <span className="ml-auto text-primary font-bold text-sm">Recommended</span>
                  </label>
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={e => setPaymentMethod(e.target.value)} className="accent-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Summary */}
        <div className="lg:w-1/3">
          <Card className="rounded-2xl sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="truncate w-2/3 text-muted-foreground">{item.qty} × {item.name}</span>
                    <span className="font-medium">₹{(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>₹{itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span><span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (5%)</span><span>₹{taxPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>−₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary-dark text-lg">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Button
                type="submit" form="checkout-form"
                disabled={placingOrder}
                className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-6 text-base mt-5"
              >
                {placingOrder
                  ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
                  : paymentMethod === 'Razorpay' ? 'Pay Now' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
