import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const RETURN_STATUSES = ['Requested', 'Approved', 'Rejected', 'Completed'];
const HELP_STATUSES = ['Open', 'In Review', 'Resolved'];

const statusColors = {
  Pending:    'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped:    'bg-purple-100 text-purple-800',
  Delivered:  'bg-green-100 text-green-800',
  Cancelled:  'bg-red-100 text-red-800',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');

  const getConfig = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return { headers: { Authorization: `Bearer ${userInfo?.token}` } };
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/orders`, getConfig());
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${id}/status`, { status }, getConfig());
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: status } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const markPaid = async (id) => {
    setUpdatingId(id);
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${id}/pay`, {}, getConfig());
      setOrders(prev => prev.map(o => o._id === id ? { ...o, paymentStatus: 'Paid' } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const updateReturnStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const { data } = await axios.put(`${API_BASE_URL}/api/orders/${id}/return-status`, { status }, getConfig());
      setOrders(prev => prev.map(o => o._id === id ? data : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Return update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const updateHelpStatus = async (orderId, requestId, status) => {
    setUpdatingId(orderId);
    try {
      const { data } = await axios.put(`${API_BASE_URL}/api/orders/${orderId}/help/${requestId}/status`, { status }, getConfig());
      setOrders(prev => prev.map(o => o._id === orderId ? data : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Help update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o =>
    o._id.includes(search) ||
    (o.userId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.userId?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text" placeholder="Search by ID, name, email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="border border-border rounded-xl px-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary flex-1 sm:w-64"
          />
          <button onClick={fetchOrders} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(order => (
                <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-foreground">{order.userId?.name || 'Guest'}</p>
                    <p className="text-xs text-muted-foreground">{order.userId?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-foreground">
                    ₹{order.totalAmount?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {order.paymentStatus}
                    </span>
                    {order.paymentStatus !== 'Paid' && (
                      <button
                        onClick={() => markPaid(order._id)}
                        disabled={updatingId === order._id}
                        className="ml-2 text-xs text-green-600 hover:underline disabled:opacity-50"
                      >
                        Mark paid
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="relative">
                      <select
                        value={order.orderStatus}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id || order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                        className={`appearance-none text-xs font-medium px-3 py-1.5 pr-7 rounded-full border cursor-pointer transition-all focus:outline-none disabled:cursor-not-allowed ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'} border-transparent`}
                      >
                        {ORDER_STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {!['Delivered','Cancelled'].includes(order.orderStatus) && (
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs text-muted-foreground">
                      <p className="capitalize">{order.paymentMethod}</p>
                      {order.couponCode && <p className="text-green-600">{order.couponCode}</p>}
                      {order.address?.phone && (
                        <p className="text-foreground font-medium mt-0.5">📞 {order.address.phone}</p>
                      )}
                      {order.address?.alternatePhone && (
                        <p className="text-muted-foreground">Alt: {order.address.alternatePhone}</p>
                      )}
                      {order.returnRequest?.status && order.returnRequest.status !== 'None' && (
                        <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-2">
                          <p className="font-semibold text-primary">{order.returnRequest.type}: {order.returnRequest.reason}</p>
                          <select
                            value={order.returnRequest.status}
                            onChange={e => updateReturnStatus(order._id, e.target.value)}
                            disabled={updatingId === order._id}
                            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                          >
                            {RETURN_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </div>
                      )}
                      {order.supportRequests?.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {order.supportRequests.map(request => (
                            <div key={request._id} className="rounded-lg border border-border bg-muted/30 p-2">
                              <p className="font-semibold text-foreground">{request.topic}</p>
                              <p className="line-clamp-2">{request.message}</p>
                              <select
                                value={request.status}
                                onChange={e => updateHelpStatus(order._id, request._id, e.target.value)}
                                disabled={updatingId === order._id}
                                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                              >
                                {HELP_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No orders found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
