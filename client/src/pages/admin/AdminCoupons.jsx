import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_BASE_URL } from '@/lib/utils';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: 100, expiresAt: '',
  });
  const [creating, setCreating] = useState(false);

  const getConfig = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return { headers: { Authorization: `Bearer ${userInfo?.token}` } };
  };

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/coupons`, getConfig());
      setCoupons(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const createCoupon = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(`${API_BASE_URL}/api/coupons`, form, getConfig());
      setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: 100, expiresAt: '' });
      fetchCoupons();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await axios.delete(`${API_BASE_URL}/api/coupons/${id}`, getConfig());
    setCoupons(prev => prev.filter(c => c._id !== id));
  };

  useEffect(() => { fetchCoupons(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Coupon Codes</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Create and manage discount coupons</p>
      </div>

      {/* Create Form */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" /> Create New Coupon
        </h2>
        <form onSubmit={createCoupon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Code</label>
            <Input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} placeholder="e.g. SAVE20" required className="uppercase" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Discount Type</label>
            <select value={form.discountType} onChange={e => setForm(f => ({...f, discountType: e.target.value}))}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Discount Value</label>
            <Input type="number" value={form.discountValue} onChange={e => setForm(f => ({...f, discountValue: e.target.value}))} placeholder={form.discountType === 'percentage' ? 'e.g. 10 (%)' : 'e.g. 200 (₹)'} required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Min Order (₹)</label>
            <Input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({...f, minOrderAmount: e.target.value}))} placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Max Uses</label>
            <Input type="number" value={form.maxUses} onChange={e => setForm(f => ({...f, maxUses: e.target.value}))} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Expires At</label>
            <Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({...f, expiresAt: e.target.value}))} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={creating} className="bg-primary hover:bg-primary-dark text-white">
              {creating ? 'Creating...' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Uses</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map(c => (
              <tr key={c._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-lg text-sm">{c.code}</span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{c.discountType}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">₹{c.minOrderAmount || 0}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.usedCount}/{c.maxUses}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'No expiry'}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteCoupon(c._id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && !loading && (
          <div className="p-8 text-center text-muted-foreground">No coupons created yet</div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
