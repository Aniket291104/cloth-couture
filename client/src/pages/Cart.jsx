import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart } = useCart();

  const updateQuantity = (item, newQty) => {
    addToCart({ ...item, qty: newQty });
  };

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-muted rounded-lg border border-border">
          <h2 className="text-2xl font-serif text-muted-foreground mb-4">Your cart is empty</h2>
          <Button asChild className="bg-primary hover:bg-primary-dark text-white">
            <Link to="/products">Go Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <ul className="divide-y divide-border">
                {cartItems.map((item) => (
                  <li key={`${item.product}-${item.size}`} className="p-6 flex flex-col sm:flex-row gap-6">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link to={`/products/${item.product}`} className="text-lg font-medium hover:text-primary transition-colors">
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">Size: {item.size}</p>
                          <p className="text-sm font-medium text-foreground mt-2">${item.price.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product, item.size)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="text-sm text-muted-foreground mr-4">Qty:</span>
                        <div className="flex items-center space-x-2 border border-border rounded-md px-3 py-1">
                          <button 
                            onClick={() => updateQuantity(item, Math.max(1, item.qty - 1))}
                            className="text-lg text-foreground hover:text-primary transition-colors focus:outline-none"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-foreground">{item.qty}</span>
                          <button 
                            onClick={() => updateQuantity(item, Math.min(item.countInStock || 10, item.qty + 1))}
                            className="text-lg text-foreground hover:text-primary transition-colors focus:outline-none"
                          >
                            +
                          </button>
                        </div>
                        <p className="ml-auto font-medium text-primary-dark text-lg">${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span className="text-foreground font-medium">${itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground font-medium">{itemsPrice > 150 ? 'Free' : '$10.00'}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (Estimated)</span>
                  <span className="text-foreground font-medium">${(itemsPrice * 0.08).toFixed(2)}</span>
                </div>
                
                <div className="border-t border-border pt-4 mt-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary-dark">
                      ${(itemsPrice + (itemsPrice > 150 ? 0 : 10) + itemsPrice * 0.08).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button asChild className="w-full bg-primary hover:bg-primary-dark text-white rounded-md py-6 text-lg">
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <div className="mt-4 text-center">
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
