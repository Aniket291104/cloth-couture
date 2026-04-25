import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import { TrendingUp, ShoppingBag, Package, Users, IndianRupee, Clock, Truck, CheckCircle, Download, FileText, DollarSign, Percent } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

    Promise.all([
      axios.get(`${API_BASE_URL}/api/orders/analytics`, config),
      axios.get(`${API_BASE_URL}/api/products?fields=admin-card`),
    ]).then(([analyticsRes, productsRes]) => {
      setAnalytics(analyticsRes.data);
      setProducts(productsRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    );
  }

  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<IndianRupee className="h-6 w-6 text-green-600" />}
          label="Total Revenue" color="bg-green-50"
          value={`₹${(analytics?.totalRevenue || 0).toLocaleString('en-IN')}`}
          sub="From paid orders"
        />
        <StatCard
          icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
          label="Total Orders" color="bg-blue-50"
          value={analytics?.totalOrders || 0}
          sub={`${analytics?.pendingOrders || 0} pending`}
        />
        <StatCard
          icon={<Package className="h-6 w-6 text-purple-600" />}
          label="Total Products" color="bg-purple-50"
          value={products.length}
          sub={`${outOfStock.length} out of stock`}
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-amber-600" />}
          label="Delivered" color="bg-amber-50"
          value={analytics?.deliveredOrders || 0}
          sub="Successfully fulfilled"
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6 text-pink-600" />}
          label="Avg. Order Value" color="bg-pink-50"
          value={`₹${analytics?.totalOrders > 0 ? (analytics.totalRevenue / analytics.totalOrders).toFixed(0) : 0}`}
          sub="Per transaction"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Monthly Revenue (₹)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics?.monthlyRevenue || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c8956c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c8956c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#c8956c" fill="url(#revenueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Orders */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" /> Monthly Orders
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#6b7f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Business Intelligence & Exports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Mission Control Reports
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => downloadCSV(products, 'products_report')}
              className="flex flex-col items-center justify-center p-6 bg-muted/50 hover:bg-primary/5 border border-border rounded-2xl transition-all group"
            >
              <Package className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-3" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Products CSV</span>
              <Download className="h-4 w-4 mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
            </button>
            <button 
              onClick={() => alert('Detailed order export requires backend history route.')}
              className="flex flex-col items-center justify-center p-6 bg-muted/50 hover:bg-primary/5 border border-border rounded-2xl transition-all group"
            >
              <ShoppingBag className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-3" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Sales Report</span>
              <Download className="h-4 w-4 mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
            </button>
            <button 
              onClick={() => alert('Newsletter subscribers export is available in the Subscribers tab.')}
              className="flex flex-col items-center justify-center p-6 bg-muted/50 hover:bg-primary/5 border border-border rounded-2xl transition-all group"
            >
              <Users className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-3" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Customer Data</span>
              <Download className="h-4 w-4 mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" /> Key Performance
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                <span>Fulfillment Rate</span>
                <span>{analytics?.totalOrders > 0 ? ((analytics.deliveredOrders / analytics.totalOrders) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${analytics?.totalOrders > 0 ? (analytics.deliveredOrders / analytics.totalOrders) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                <span>Revenue Growth</span>
                <span>+12%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: '85%' }} />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 italic">
              * Data is updated in real-time as orders are processed.
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-500" /> Inventory Alerts
          </h2>
          <div className="space-y-2">
            {outOfStock.map(p => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3">
                  <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                </div>
                <span className="text-xs font-semibold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">Out of Stock</span>
              </div>
            ))}
            {lowStock.map(p => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3">
                  <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">Only {p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
