import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderSuccess = () => {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </motion.div>

        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Order Placed!</h1>
        <p className="text-muted-foreground text-lg mb-2">Thank you for your purchase.</p>
        <p className="text-muted-foreground mb-8">
          Your handcrafted items are being prepared with care. You'll receive updates as your order progresses.
        </p>

        {order && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Order Summary</h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex justify-between">
                <span>Order ID</span>
                <span className="font-mono text-foreground">#{order._id?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Items</span>
                <span className="text-foreground">{order.items?.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <span className="text-foreground">{order.paymentMethod}</span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({order.couponCode})</span>
                  <span>−₹{order.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary-dark">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-primary hover:bg-primary-dark text-white rounded-full px-8">
            <Link to="/my-orders">
              <Package className="h-4 w-4 mr-2" /> Track Your Order
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link to="/products">
              Continue Shopping <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
