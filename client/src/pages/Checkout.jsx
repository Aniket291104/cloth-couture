import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const shippingPrice = itemsPrice > 150 ? 0 : 10;
  const taxPrice = itemsPrice * 0.08;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const [fetchingLocation, setFetchingLocation] = useState(false);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          
          if (data) {
            // Use the full display_name to ensure a complete "real" address
            setAddress(data.display_name || data.address?.road || '');
            setCity(data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || '');
            setPostalCode(data.address?.postcode || '');
            setCountry(data.address?.country || '');
          }
        } catch (error) {
          console.error('Error fetching location details:', error);
          alert('Failed to get address details from your location.');
        } finally {
          setFetchingLocation(false);
        }
      },
      (error) => {
        setFetchingLocation(false);
        alert('Unable to retrieve your location. Please allow location permissions.');
      }
    );
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };

      const { data } = await axios.post('http://localhost:5001/api/orders', {
        orderItems: cartItems,
        shippingAddress: { address, city, postalCode, country },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      }, config);

      if (paymentMethod === 'Razorpay') {
        alert('Integrating Razorpay. Assuming success for demo.');
        await axios.put(`http://localhost:5001/api/orders/${data._id}/pay`, {}, config);
      }

      clearCart();
      alert('Order placed successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order');
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <form id="checkout-form" onSubmit={placeOrderHandler}>
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-serif">Shipping Address</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    disabled={fetchingLocation}
                    onClick={fetchCurrentLocation}
                  >
                    {fetchingLocation ? 'Fetching...' : 'Use Current Location'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Enter address..." value={address} onChange={(e) => setAddress(e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                  <Input placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                </div>
                <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="payment" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-primary" />
                    <span className="text-foreground">Online Payment (Razorpay)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-primary" />
                    <span className="text-foreground">Cash on Delivery</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
        
        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="truncate w-2/3">{item.qty} x {item.name}</span>
                    <span className="font-medium">${(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t border-border pt-4 mt-6">
                  <div className="flex justify-between text-muted-foreground mb-2">
                    <span>Subtotal</span>
                    <span>${itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground mb-2">
                    <span>Shipping</span>
                    <span>${shippingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground mb-4">
                    <span>Tax</span>
                    <span>${taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary-dark">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Button type="submit" form="checkout-form" className="w-full bg-primary hover:bg-primary-dark text-white rounded-md py-6 text-lg">
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
