import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { API_BASE_URL, getImageUrl } from '@/lib/utils';
import { useToast } from '../context/ToastContext';
import { MapPin, CreditCard, Loader2, Phone, Coins, CheckCircle2, ChevronRight, Truck, ShoppingBag, Globe, Check, Home, Briefcase, Plus, TrendingUp, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const storedBuyNowItem = (() => {
    if (location.state && !location.state.buyNow) return null;
    try {
      return JSON.parse(sessionStorage.getItem('buyNowItem') || 'null');
    } catch {
      return null;
    }
  })();
  const buyNowItem = location.state?.buyNowItem || storedBuyNowItem;
  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;
  const isBuyNow = Boolean(buyNowItem);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [step, setStep] = useState(1);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  // Loyalty & Coupons
  const [userPoints, setUserPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setUserPoints(userInfo.loyaltyPoints || 0);
      const book = userInfo.addressBook || [];
      setSavedAddresses(book);
      const def = book.findIndex(a => a.isDefault);
      if (def !== -1) {
        setSelectedAddressIndex(def);
        const addr = book[def];
        setAddress(addr.address); setCity(addr.city); setPostalCode(addr.postalCode); 
        setCountry(addr.country); setPhone(addr.phone); setAlternatePhone(addr.alternatePhone);
      }
    }
  }, []);

  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = subtotal > 1500 ? 0 : 150;
  
  // Loyalty redemption: 100 coins = 2rs (1 coin = 0.02rs)
  // Max usage capped at 50% of itemsPrice
  const maxPossibleDiscount = subtotal * 0.5;
  const maxRedeemablePoints = Math.floor(maxPossibleDiscount / 0.02);
  const pointsToUse = Math.min(userPoints, maxRedeemablePoints);
  const pointsDiscount = usePoints ? (pointsToUse * 0.02) : 0;
  
  const finalTotal = subtotal + shippingPrice - pointsDiscount - discountAmount;

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center rounded-2xl border border-border bg-card p-10 shadow-sm">
          <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-foreground mb-3">Your checkout is empty</h1>
          <p className="text-muted-foreground mb-6">Add a product first, or use Buy Now from a product page to start checkout directly.</p>
          <Button asChild className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8">
            <Link to="/products">Shop Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    try {
      const userInfoLocal = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfoLocal) {
        addToast('Please login to apply coupons', 'error');
        return;
      }
      const { data } = await axios.post(`${API_BASE_URL}/api/orders/validate-coupon`, 
        { code: couponCode, amount: subtotal },
        { headers: { Authorization: `Bearer ${userInfoLocal.token}` } }
      );
      setDiscountAmount(data.discount);
      addToast(data.message, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid coupon', 'error');
      setDiscountAmount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSelectSavedAddress = (index) => {
    setSelectedAddressIndex(index);
    const addr = savedAddresses[index];
    setAddress(addr.address); setCity(addr.city); setPostalCode(addr.postalCode);
    setCountry(addr.country); setPhone(addr.phone); setAlternatePhone(addr.alternatePhone);
  };

  const finishSuccessfulOrder = (userInfoLocal, earnCoins = false) => {
    const updatedUser = {
      ...userInfoLocal,
      loyaltyPoints:
        (userInfoLocal.loyaltyPoints || 0) -
        (usePoints ? pointsToUse : 0) +
        (earnCoins ? Math.floor(finalTotal * 0.02) : 0),
    };
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));

    if (isBuyNow) {
      sessionStorage.removeItem('buyNowItem');
    } else {
      clearCart();
    }
  };

  const buildOrderData = (method) => ({
    orderItems: checkoutItems.map(item => ({ ...item, product: item.product })),
    shippingAddress: { address, city, postalCode, country, phone, alternatePhone },
    paymentMethod: method,
    itemsPrice: subtotal,
    shippingPrice,
    taxPrice: 0,
    totalPrice: finalTotal,
    pointsSpent: usePoints ? pointsToUse : 0,
    couponCode,
    discountAmount,
  });

  const placeOrderHandler = async () => {
    if (!address || !city || !postalCode) { addToast('Please fill all address fields', 'error'); return; }
    if (!phone) { addToast('Please add a primary contact number', 'error'); return; }
    setPlacingOrder(true);
    try {
      const userInfoLocal = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfoLocal) {
        addToast('Please login to continue checkout', 'error');
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      const config = { headers: { Authorization: `Bearer ${userInfoLocal.token}` } };
      const orderData = buildOrderData(paymentMethod);

      if (paymentMethod === 'COD') {
        await axios.post(`${API_BASE_URL}/api/orders`, orderData, config);
        finishSuccessfulOrder(userInfoLocal, false);
        addToast('Cash on Delivery order placed successfully!', 'success');
        navigate('/my-orders');
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) { addToast('Razorpay failed to load', 'error'); return; }

      const { data: rzOrder } = await axios.post(`${API_BASE_URL}/api/orders/razorpay`, { amount: finalTotal }, config);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzOrder.amount,
        currency: rzOrder.currency,
        name: 'Cloth Couture',
        description: 'Premium Handmade Clothing',
        order_id: rzOrder.id,
        handler: async (response) => {
          try {
            const { data } = await axios.post(`${API_BASE_URL}/api/orders`, orderData, config);
            await axios.put(`${API_BASE_URL}/api/orders/${data._id}/pay`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, config);

            finishSuccessfulOrder(userInfoLocal, true);
            addToast('Order placed successfully!', 'success');
            navigate('/profile');
          } catch (err) {
            addToast(err.response?.data?.message || 'Payment processing failed', 'error');
          }
        },
        prefill: { name: userInfoLocal.name, email: userInfoLocal.email, contact: phone },
        theme: { color: '#E17009' }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      addToast(err.response?.data?.message || 'Order creation failed', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) { addToast('Geolocation not supported', 'error'); return; }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const { data } = await axios.get(`${API_BASE_URL}/api/geocode/reverse`, {
            params: { lat: latitude, lon: longitude },
          });
          setAddress(data.address || `Near ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          setCity(data.city || '');
          setPostalCode(data.postalCode || '');
          setCountry(data.country || 'India');
          addToast('Location detected!', 'success');
        } catch {
          const { latitude, longitude } = pos.coords;
          setAddress(`Near ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          addToast('Could not find full address. Please complete it manually.', 'warning');
        }
        finally { setFetchingLocation(false); }
      },
      () => { addToast('Location access denied', 'error'); setFetchingLocation(false); }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-muted/20 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          
          {/* Progress Header */}
          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3].map(s => (
              <React.Fragment key={s}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-muted text-muted-foreground'}`}>{s}</div>
                {s < 3 && <div className={`flex-1 h-1 transition-all ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="step1">
                <Card className="rounded-3xl border-none shadow-premium overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-8 border-b border-primary/10">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-serif">Shipping Destination</CardTitle>
                      <Button variant="ghost" size="sm" onClick={fetchCurrentLocation} disabled={fetchingLocation} className="text-primary hover:bg-primary/10 rounded-full h-10 px-6 gap-2">
                         {fetchingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />} Auto Detect
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {savedAddresses.length > 0 && (
                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select from Address Book</label>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                          {savedAddresses.map((addr, i) => (
                            <button key={i} onClick={() => handleSelectSavedAddress(i)} className={`relative flex-shrink-0 w-56 p-6 rounded-2xl border-2 text-left transition-all ${selectedAddressIndex === i ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border/50 hover:border-primary/20 bg-background'}`}>
                              <div className="flex items-center gap-2 mb-3">
                                 {addr.label === 'Home' ? <Home className="h-4 w-4 text-primary" /> : <Briefcase className="h-4 w-4 text-primary" />}
                                 <span className="text-xs font-black uppercase tracking-widest">{addr.label}</span>
                                 {selectedAddressIndex === i && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                              </div>
                              <p className="text-[10px] text-foreground/80 line-clamp-1">{addr.address}</p>
                              <p className="text-[10px] text-muted-foreground">{addr.city}, {addr.postalCode}</p>
                            </button>
                          ))}
                          <button onClick={() => navigate('/profile')} className="flex-shrink-0 w-40 h-[104px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-all">
                             <Plus className="h-5 w-5" /> <span className="text-[10px] font-bold uppercase tracking-widest">Manage Book</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Street Address</label>
                        <Input value={address} onChange={e => { setAddress(e.target.value); setSelectedAddressIndex(-1); }} className="rounded-xl h-14 bg-muted/20 border-none px-6 focus:ring-2 focus:ring-primary" placeholder="Apt, Suite, Street name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City</label>
                        <Input value={city} onChange={e => setCity(e.target.value)} className="rounded-xl h-14 bg-muted/20 border-none px-6" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Postal Code</label>
                        <Input value={postalCode} onChange={e => setPostalCode(e.target.value)} className="rounded-xl h-14 bg-muted/20 border-none px-6" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary Contact</label>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} className="rounded-xl h-14 bg-muted/20 border-none px-6" placeholder="10-digit mobile" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alternate Contact</label>
                        <Input value={alternatePhone} onChange={e => setAlternatePhone(e.target.value)} className="rounded-xl h-14 bg-muted/20 border-none px-6" placeholder="Optional" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="mt-8 flex justify-end">
                   <Button onClick={() => setStep(2)} className="rounded-2xl px-12 py-7 text-lg bg-primary hover:bg-primary-dark shadow-xl">Continue to Payment <ChevronRight className="ml-2 h-5 w-5" /></Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="step2">
                 <Card className="rounded-3xl border-none shadow-premium p-8">
                    <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
                       <CreditCard className="h-6 w-6 text-primary" /> Payment Method
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                       <button
                         type="button"
                         onClick={() => setPaymentMethod('Razorpay')}
                         className={`flex items-center gap-4 rounded-2xl border-2 p-6 text-left transition-all ${
                           paymentMethod === 'Razorpay' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background hover:border-primary/30'
                         }`}
                       >
                          <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-primary" />
                          </span>
                          <span>
                            <span className="block font-bold text-foreground">Online Payment</span>
                            <span className="block text-xs text-muted-foreground mt-1">UPI, cards, netbanking via Razorpay</span>
                          </span>
                          {paymentMethod === 'Razorpay' && <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />}
                       </button>

                       <button
                         type="button"
                         onClick={() => setPaymentMethod('COD')}
                         className={`flex items-center gap-4 rounded-2xl border-2 p-6 text-left transition-all ${
                           paymentMethod === 'COD' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background hover:border-primary/30'
                         }`}
                       >
                          <span className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                            <Banknote className="h-6 w-6 text-green-600" />
                          </span>
                          <span>
                            <span className="block font-bold text-foreground">Cash on Delivery</span>
                            <span className="block text-xs text-muted-foreground mt-1">Pay when your order arrives</span>
                          </span>
                          {paymentMethod === 'COD' && <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />}
                       </button>
                    </div>
                    
                    {/* Coupon Input */}
                    <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20 mb-8">
                       <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Exclusive Coupon Code</p>
                       <div className="flex gap-4">
                          <Input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="COUTRE20" className="rounded-xl h-14 flex-1 bg-white border-none shadow-sm px-6" />
                          <Button onClick={handleApplyCoupon} disabled={validatingCoupon || !couponCode} className="h-14 rounded-xl px-10 bg-primary-dark text-white hover:bg-black transition-all">
                             {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                          </Button>
                       </div>
                       {discountAmount > 0 && (
                         <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-green-600 font-bold mt-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Coupon applied: -₹{discountAmount.toFixed(2)}</motion.p>
                       )}
                    </div>

                    <div className="flex items-center justify-between p-6 bg-card rounded-2xl border-2 border-primary/10 shadow-sm hover:border-primary/40 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Coins className="h-7 w-7 text-primary" /></div>
                          <div>
                             <p className="font-bold text-lg">{userPoints} Couture Coins</p>
                             <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-0.5">Value: ₹{(userPoints * 0.02).toFixed(2)}</p>
                          </div>
                       </div>
                       <Button variant={usePoints ? "default" : "outline"} onClick={() => setUsePoints(!usePoints)} disabled={userPoints < 50} className={`rounded-xl px-8 h-12 ${usePoints ? 'bg-primary' : 'border-primary text-primary hover:bg-primary/5'}`}>
                          {usePoints ? 'Redeemed' : 'Redeem'}
                       </Button>
                    </div>

                    <div className="mt-12 flex items-center gap-4 p-8 bg-muted/40 rounded-3xl border border-border">
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><Check className="h-6 w-6 text-green-600" /></div>
                       <p className="text-sm font-medium">
                         {paymentMethod === 'COD'
                           ? 'Cash on Delivery selected. Keep the exact payable amount ready at delivery.'
                           : <>Safe & Secure Payment via <span className="font-bold">Razorpay</span> (UPI, Cards, Netbanking)</>}
                       </p>
                    </div>
                    
                    <div className="mt-12 flex justify-between gap-4">
                       <Button variant="ghost" onClick={() => setStep(1)} className="rounded-2xl h-14 px-8 border-border">Previous Step</Button>
                       <Button onClick={() => setStep(3)} className="rounded-2xl h-14 px-12 bg-primary text-white shadow-xl">Final Review <ChevronRight className="ml-2 h-5 w-5" /></Button>
                    </div>
                 </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key="step3">
                 <Card className="rounded-3xl border-none shadow-premium p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100%] transition-transform hover:scale-110" />
                    <h2 className="text-2xl font-serif font-bold mb-8">Confirm Your Order</h2>
                    <div className="space-y-6">
                       <div className="flex items-start gap-4 p-5 bg-muted/30 rounded-2xl">
                          <Truck className="h-5 w-5 text-primary mt-1" />
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Delivering To</p>
                             <p className="text-sm font-medium">{address}, {city}, {postalCode}</p>
                             <p className="text-[10px] text-muted-foreground mt-1 tracking-wider underline">{phone}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4 p-5 bg-muted/30 rounded-2xl">
                          {paymentMethod === 'COD' ? <Banknote className="h-5 w-5 text-green-600 mt-1" /> : <CreditCard className="h-5 w-5 text-primary mt-1" />}
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Payment Method</p>
                             <p className="text-sm font-medium">{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment via Razorpay'}</p>
                          </div>
                       </div>
                       
                       <div className="space-y-4 pt-4 border-t border-border">
                          {checkoutItems.map(item => (
                            <div key={`${item.product}-${item.size}`} className="flex items-center gap-4">
                               <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                               <div className="flex-1">
                                  <p className="text-sm font-bold">{item.name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase font-black">{item.size} · {item.qty} Unit{item.qty > 1 ? 's' : ''}</p>
                               </div>
                               <p className="font-bold text-sm">₹{(item.price * item.qty).toFixed(2)}</p>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="mt-10 flex justify-between gap-4 pt-6 border-t border-border">
                       <Button variant="ghost" onClick={() => setStep(2)} className="rounded-2xl h-14">Modify Details</Button>
                       <Button onClick={placeOrderHandler} disabled={placingOrder} className="rounded-2xl h-14 flex-1 bg-black text-white shadow-xl hover:bg-primary-dark transition-all">
                          {placingOrder ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShoppingBag className="h-5 w-5 mr-2" />} 
                          {paymentMethod === 'COD' ? `Place COD Order - ₹${finalTotal.toFixed(2)}` : `Pay ₹${finalTotal.toFixed(2)} Securely`}
                       </Button>
                    </div>
                 </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:w-[400px]">
          <div className="sticky top-28 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-premium-dark bg-primary-dark text-white overflow-hidden p-8">
               <h3 className="text-lg font-serif font-bold mb-8 border-b border-white/10 pb-4">{isBuyNow ? 'Buy Now Summary' : 'Order Summary'}</h3>
               <div className="space-y-5 text-sm">
                  <div className="flex justify-between items-center opacity-80">
                     <span>Item Subtotal</span>
                     <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-green-300 font-bold">
                       <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> Coupon Offset</span>
                       <span>−₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {usePoints && (
                    <div className="flex justify-between items-center text-amber-300 font-bold">
                       <span className="flex items-center gap-1.5"><Coins className="h-3 w-3" /> Coins Redemption</span>
                       <span>−₹{pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center opacity-80">
                     <span>Shipping (Pan India)</span>
                     <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}</span>
                  </div>
                  <div className="pt-6 border-t border-white/20 mt-4 flex justify-between items-baseline">
                     <span className="text-base font-serif opacity-70">Payable Total</span>
                     <span className="text-4xl font-serif font-black tracking-tight">₹{finalTotal.toFixed(2)}</span>
                  </div>
               </div>
            </Card>

            <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-border/50 text-center relative group">
               <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-primary" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Loyalty Perk</p>
               <h4 className="text-xl font-serif font-bold text-foreground">Earn {Math.floor(finalTotal * 0.02)} Coins</h4>
               <p className="text-[10px] text-muted-foreground mt-2 font-medium">Earn 2 coins for every ₹100 spent.<br/> Redeem them at ₹0.02 per coin! 👑</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
