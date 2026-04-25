import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Ban,
  CheckCircle,
  ChevronRight,
  Clock,
  LifeBuoy,
  MapPin,
  Package,
  RotateCcw,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '@/lib/utils';
import { useToast } from '../context/ToastContext';

const statusConfig = {
  Pending: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <Clock className="h-4 w-4" /> },
  Processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Package className="h-4 w-4" /> },
  Shipped: { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <Truck className="h-4 w-4" /> },
  Delivered: { color: 'text-green-600 bg-green-50 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
  Cancelled: { color: 'text-red-600 bg-red-50 border-red-200', icon: <XCircle className="h-4 w-4" /> },
};

const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const RETURN_WINDOW_DAYS = 7;

const canCancel = (order) => ['Pending', 'Processing'].includes(order.orderStatus);
const canModifyAddress = (order) => ['Pending', 'Processing'].includes(order.orderStatus);
const getReturnDaysLeft = (order) => {
  if (order.orderStatus !== 'Delivered') return 0;
  const deliveredAt = new Date(order.deliveredAt || order.updatedAt || order.createdAt);
  const elapsed = Math.floor((Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, RETURN_WINDOW_DAYS - elapsed);
};
const canRequestReturn = (order) => (
  order.orderStatus === 'Delivered' &&
  getReturnDaysLeft(order) > 0 &&
  (!order.returnRequest?.status || order.returnRequest.status === 'None')
);

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();
  const { addToast } = useToast();
  const userInfo = useMemo(() => (
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
  ), []);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setOrders(data);
      } catch {
        addToast('Failed to load orders', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [addToast, navigate, userInfo]);

  const updateOrderInList = (updatedOrder) => {
    setOrders((prev) => prev.map((order) => order._id === updatedOrder._id ? updatedOrder : order));
  };

  const openAction = (order, type) => {
    setActionModal({ order, type });
    if (type === 'address') {
      setForm({
        address: order.address?.address || '',
        city: order.address?.city || '',
        postalCode: order.address?.postalCode || '',
        country: order.address?.country || 'India',
        phone: order.address?.phone || '',
        alternatePhone: order.address?.alternatePhone || '',
      });
    } else if (type === 'return') {
      setForm({ type: 'Return', reason: '' });
    } else if (type === 'help') {
      setForm({ topic: 'Delivery question', message: '' });
    } else {
      setForm({ reason: '' });
    }
  };

  const closeAction = () => {
    setActionModal(null);
    setForm({});
  };

  const submitAction = async (e) => {
    e.preventDefault();
    if (!actionModal || !userInfo) return;

    const { order, type } = actionModal;
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const actions = {
      cancel: { method: 'put', url: `${API_BASE_URL}/api/orders/${order._id}/cancel`, payload: { reason: form.reason } },
      address: { method: 'put', url: `${API_BASE_URL}/api/orders/${order._id}/address`, payload: form },
      return: { method: 'post', url: `${API_BASE_URL}/api/orders/${order._id}/return`, payload: { type: form.type, reason: form.reason } },
      help: { method: 'post', url: `${API_BASE_URL}/api/orders/${order._id}/help`, payload: { topic: form.topic, message: form.message } },
    };

    setActionLoading(true);
    try {
      const action = actions[type];
      const { data } = await axios[action.method](action.url, action.payload, config);
      updateOrderInList(data);
      addToast(
        type === 'cancel' ? 'Order cancelled successfully' :
        type === 'address' ? 'Delivery details updated' :
        type === 'return' ? `${form.type} request submitted` :
        'Help request submitted',
        'success'
      );
      closeAction();
    } catch (err) {
      addToast(err.response?.data?.message || 'Request failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
                      {order.paymentStatus === 'Paid' && <span className="text-xs text-green-600 font-medium">Paid</span>}
                      {order.returnRequest?.status && order.returnRequest.status !== 'None' && (
                        <span className="text-xs text-primary font-medium">{order.returnRequest.type}: {order.returnRequest.status}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      &nbsp;·&nbsp; {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      &nbsp;·&nbsp; <span className="font-semibold text-primary-dark">INR {order.totalAmount.toFixed(2)}</span>
                    </p>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-border">
                    {order.orderStatus !== 'Cancelled' && (
                      <div className="px-5 pt-8 pb-4">
                        <div className="relative flex items-center justify-between">
                          <div className="absolute top-4 left-0 right-0 h-1 bg-muted -z-0 rounded-full" />
                          <div className="absolute top-4 left-0 h-1 bg-primary transition-all duration-1000 -z-0 rounded-full" style={{ width: `${Math.max(0, stepIndex) / (steps.length - 1) * 100}%` }} />
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
                                    borderColor: isCompleted || isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                                  }}
                                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors shadow-sm"
                                >
                                  {isCompleted ? <CheckCircle className="h-5 w-5 text-white" /> : isActive ? <div className="w-2.5 h-2.5 bg-white rounded-full" /> : <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />}
                                </motion.div>
                                <span className={`mt-3 text-[11px] font-bold uppercase tracking-wider ${isCompleted || isActive ? 'text-primary' : 'text-muted-foreground'}`}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-muted flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Size: {item.size} · Qty: {item.qty}</p>
                          </div>
                          <p className="text-sm font-semibold text-primary-dark">INR {(item.price * item.qty).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="px-5 pb-5 pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground mb-1">Shipping Address</p>
                        <p className="text-muted-foreground leading-relaxed">
                          {order.address?.address}, {order.address?.city}, {order.address?.postalCode}, {order.address?.country}
                        </p>
                        {order.address?.phone && <p className="text-muted-foreground text-xs mt-1">Phone: {order.address.phone}{order.address?.alternatePhone && ` · Alt: ${order.address.alternatePhone}`}</p>}
                      </div>
                      <div>
                        <p className="font-medium text-foreground mb-1">Payment</p>
                        <p className="text-muted-foreground">{order.paymentMethod} · {order.paymentStatus}</p>
                        {order.couponCode && <p className="text-green-600 text-xs mt-1">Coupon: {order.couponCode} (-INR {order.discountAmount?.toFixed(2)})</p>}
                      </div>
                    </div>

                    <div className="px-5 pb-5 border-t border-border">
                      <div className="rounded-xl bg-muted/40 border border-border p-4 mt-5">
                        <p className="text-sm font-semibold text-foreground">7 day return and replacement policy</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Delivered items can be requested for return or replacement within 7 days, if unused and eligible.
                          {order.orderStatus === 'Delivered' && getReturnDaysLeft(order) > 0 && ` ${getReturnDaysLeft(order)} day${getReturnDaysLeft(order) !== 1 ? 's' : ''} left for this order.`}
                        </p>
                        {order.returnRequest?.status && order.returnRequest.status !== 'None' && (
                          <p className="text-xs text-primary font-semibold mt-2">{order.returnRequest.type} request: {order.returnRequest.status}</p>
                        )}
                        {order.supportRequests?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">Help tickets: {order.supportRequests.length}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {canCancel(order) && <ActionButton onClick={() => openAction(order, 'cancel')} icon={<Ban className="h-4 w-4" />} label="Cancel Order" danger />}
                        {canModifyAddress(order) && <ActionButton onClick={() => openAction(order, 'address')} icon={<MapPin className="h-4 w-4" />} label="Modify Address" />}
                        {canRequestReturn(order) && <ActionButton onClick={() => openAction(order, 'return')} icon={<RotateCcw className="h-4 w-4" />} label="Return / Replace" primary />}
                        <ActionButton onClick={() => openAction(order, 'help')} icon={<LifeBuoy className="h-4 w-4" />} label="Get Help" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {actionModal && (
        <ActionModal
          actionModal={actionModal}
          form={form}
          setForm={setForm}
          onClose={closeAction}
          onSubmit={submitAction}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

const ActionButton = ({ onClick, icon, label, danger = false, primary = false }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
      danger
        ? 'border-red-200 text-red-600 hover:bg-red-50'
        : primary
          ? 'border-primary/30 text-primary hover:bg-primary/5'
          : 'border-border text-foreground hover:bg-muted'
    }`}
  >
    {icon} {label}
  </button>
);

const ActionModal = ({ actionModal, form, setForm, onClose, onSubmit, loading }) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <form onSubmit={onSubmit} className="w-full max-w-lg bg-background rounded-2xl border border-border shadow-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-mono text-muted-foreground">#{actionModal.order._id.slice(-8).toUpperCase()}</p>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            {actionModal.type === 'cancel' && 'Cancel Order'}
            {actionModal.type === 'address' && 'Modify Delivery Details'}
            {actionModal.type === 'return' && 'Return or Replacement'}
            {actionModal.type === 'help' && 'Order Help'}
          </h2>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>
      </div>

      {actionModal.type === 'cancel' && <TextArea value={form.reason || ''} onChange={(value) => setForm((f) => ({ ...f, reason: value }))} placeholder="Tell us why you want to cancel this order" label="Cancellation reason" />}

      {actionModal.type === 'address' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField required value={form.address || ''} onChange={(value) => setForm((f) => ({ ...f, address: value }))} className="sm:col-span-2" placeholder="Full address" />
          <InputField required value={form.city || ''} onChange={(value) => setForm((f) => ({ ...f, city: value }))} placeholder="City" />
          <InputField required value={form.postalCode || ''} onChange={(value) => setForm((f) => ({ ...f, postalCode: value }))} placeholder="Postal code" />
          <InputField value={form.country || ''} onChange={(value) => setForm((f) => ({ ...f, country: value }))} placeholder="Country" />
          <InputField required value={form.phone || ''} onChange={(value) => setForm((f) => ({ ...f, phone: value }))} placeholder="Phone" />
          <InputField value={form.alternatePhone || ''} onChange={(value) => setForm((f) => ({ ...f, alternatePhone: value }))} className="sm:col-span-2" placeholder="Alternate phone (optional)" />
        </div>
      )}

      {actionModal.type === 'return' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {['Return', 'Replacement'].map((type) => (
              <button key={type} type="button" onClick={() => setForm((f) => ({ ...f, type }))} className={`rounded-xl border-2 p-4 text-sm font-semibold ${form.type === type ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}>
                {type}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Available for 7 days after delivery. Items must be unused with original tags and packaging where applicable.</p>
          <TextArea value={form.reason || ''} onChange={(value) => setForm((f) => ({ ...f, reason: value }))} placeholder="Reason for return or replacement" />
        </div>
      )}

      {actionModal.type === 'help' && (
        <div className="space-y-3">
          <select value={form.topic || ''} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
            <option>Delivery question</option>
            <option>Payment issue</option>
            <option>Damaged or wrong item</option>
            <option>Size or fit help</option>
            <option>Other</option>
          </select>
          <TextArea value={form.message || ''} onChange={(value) => setForm((f) => ({ ...f, message: value }))} placeholder="How can we help with this order?" />
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Close</button>
        <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  </div>
);

const InputField = ({ value, onChange, className = '', ...props }) => (
  <input value={value} onChange={(e) => onChange(e.target.value)} className={`rounded-xl border border-border bg-background p-3 text-sm ${className}`} {...props} />
);

const TextArea = ({ value, onChange, label, placeholder }) => (
  <div className="space-y-3">
    {label && <label className="text-sm font-medium">{label}</label>}
    <textarea required value={value} onChange={(e) => onChange(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder={placeholder} />
  </div>
);

export default MyOrders;
