import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Lock, Save, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_BASE_URL } from '@/lib/utils';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', postalCode: '', country: '',
    addressPhone: '', alternatePhone: '',
    password: '', confirmPassword: '',
  });

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) { navigate('/login'); return; }
    setForm(prev => ({
      ...prev,
      name: userInfo.name || '',
      email: userInfo.email || '',
      phone: userInfo.phone || '',
      address: userInfo.address?.address || '',
      city: userInfo.address?.city || '',
      postalCode: userInfo.address?.postalCode || '',
      country: userInfo.address?.country || '',
      addressPhone: userInfo.address?.phone || '',
      alternatePhone: userInfo.address?.alternatePhone || '',
    }));
  }, [navigate]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'security' && form.password && form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const payload = activeTab === 'security'
        ? { password: form.password }
        : {
            name: form.name, email: form.email, phone: form.phone,
            address: {
              address: form.address, city: form.city,
              postalCode: form.postalCode, country: form.country,
              phone: form.addressPhone, alternatePhone: form.alternatePhone,
            },
          };

      const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      addToast('Profile updated successfully!', 'success');
      if (activeTab === 'security') setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User className="h-4 w-4" /> },
    { id: 'address', label: 'Address', icon: <MapPin className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-3xl font-serif font-bold text-primary">
            {form.name.charAt(0).toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 hover:bg-primary-dark transition-colors">
            <Camera className="h-3 w-3" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">{form.name || 'My Profile'}</h1>
          <p className="text-muted-foreground text-sm">{form.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <motion.form
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-card rounded-2xl border border-border shadow-sm p-6"
      >
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" className="pl-9" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'address' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Shipping Address</h2>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Street Address</label>
              <Input name="address" value={form.address} onChange={handleChange} placeholder="House/Flat no., Street name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">City</label>
                <Input name="city" value={form.city} onChange={handleChange} placeholder="City" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Postal Code</label>
                <Input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="PIN code" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Country</label>
                <Input name="country" value={form.country} onChange={handleChange} placeholder="Country" />
              </div>
            </div>
            {/* Delivery Phone Numbers */}
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> Delivery Contact Numbers
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="addressPhone"
                      type="tel"
                      value={form.addressPhone}
                      onChange={e => setForm(prev => ({ ...prev, addressPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">For delivery updates & OTP</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Alternate Phone <span className="text-muted-foreground text-xs">(optional)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="alternatePhone"
                      type="tel"
                      value={form.alternatePhone}
                      onChange={e => setForm(prev => ({ ...prev, alternatePhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="Alternate contact number"
                      maxLength={10}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">In case primary is unreachable</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Change Password</h2>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
              <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="New password" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password</label>
              <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm new password" />
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border flex justify-end">
          <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-dark text-white px-8">
            {loading ? (
              <span className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Changes</span>
            )}
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default Profile;
