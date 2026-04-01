import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

const statusConfig = {
  Pending:    { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <Clock className="h-4 w-4" /> },
  Processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Package className="h-4 w-4" /> },
  Shipped:    { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <Truck className="h-4 w-4" /> },
  Delivered:  { color: 'text-green-600 bg-green-50 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
  Cancelled:  { color: 'text-red-600 bg-red-50 border-red-200', icon: <XCircle className="h-4 w-4" /> },
};

const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) { navigate('/login'); return; }

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setOrders(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary-dark">My Orders</h1>
          <p className="text-muted-foreground mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-muted rounded-2xl border border-border"
        >
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-foreground mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition-colors">
            Shop Now <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const cfg = statusConfig[order.orderStatus] || statusConfig.Pending;
            const stepIndex = steps.indexOf(order.orderStatus);
            const isExpanded = expandedOrder === order._id;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  className="w-full p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="text-sm font-mono text-muted-foreground">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.icon} {order.orderStatus}
                      </span>
                      {order.paymentStatus === 'Paid' && (
                        <span className="text-xs text-green-600 font-medium">✓ Paid</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      &nbsp;·&nbsp; {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      &nbsp;·&nbsp; <span className="font-semibold text-primary-dark">₹{order.totalAmount.toFixed(2)}</span>
                    </p>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    {/* Order Tracking */}
                    {order.orderStatus !== 'Cancelled' && (
                      <div className="px-5 pt-8 pb-4">
                        <div className="relative flex items-center justify-between">
                          {/* Progress Line Background */}
                          <div className="absolute top-4 left-0 right-0 h-1 bg-muted -z-0 rounded-full" />
                          {/* Active Progress Line */}
                          <div 
                            className="absolute top-4 left-0 h-1 bg-primary transition-all duration-1000 -z-0 rounded-full" 
                            style={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }}
                          />

                          {steps.map((step, i) => {
                            const isCompleted = i < stepIndex;
                            const isActive = i === stepIndex;
                            return (
                              <div key={step} className="relative z-10 flex flex-col items-center group">
                                <motion.div
                                  initial={false}
                                  animate={{ 
                                    scale: isActive ? 1.2 : 1,
                                    backgroundColor: isCompleted || isActive ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                                    borderColor: isCompleted || isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                                  }}
                                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors shadow-sm`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-white" />
                                  ) : isActive ? (
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                    </motion.div>
                                  ) : (
                                    <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                                  )}
                                </motion.div>
                                <div className="mt-3 flex flex-col items-center">
                                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isCompleted || isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {step}
                                  </span>
                                  {isActive && (
                                    <motion.span 
                                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                      className="text-[9px] text-primary/70 font-medium px-2 py-0.5 bg-primary/10 rounded-full mt-1"
                                    >
                                      Current State
                                    </motion.span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div className="p-5 space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg bg-muted flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Size: {item.size} · Qty: {item.qty}</p>
                          </div>
                          <p className="text-sm font-semibold text-primary-dark">₹{(item.price * item.qty).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Address & Payment */}
                    <div className="px-5 pb-5 pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground mb-1">Shipping Address</p>
                        <p className="text-muted-foreground leading-relaxed">
                          {order.address?.address}, {order.address?.city}, {order.address?.postalCode}, {order.address?.country}
                        </p>
                        {order.address?.phone && (
                          <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
                            📞 {order.address.phone}
                            {order.address?.alternatePhone && ` · Alt: ${order.address.alternatePhone}`}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground mb-1">Payment</p>
                        <p className="text-muted-foreground">{order.paymentMethod}</p>
                        {order.couponCode && (
                          <p className="text-green-600 text-xs mt-1">Coupon: {order.couponCode} (−₹{order.discountAmount?.toFixed(2)})</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
