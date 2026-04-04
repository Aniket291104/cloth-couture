import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, Mail, Phone, MapPin, Lock, Save, Camera, Coins, Gift, 
  TrendingUp, Home, Briefcase, Plus, Trash2, CheckCircle2, ChevronRight, X, LogOut, Shield 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/utils';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [userInfo, setUserInfo] = useState(null);

  const [personalForm, setPersonalForm] = useState({ name: '', email: '', phone: '' });
  const [securityForm, setSecurityForm] = useState({ password: '', confirmPassword: '' });
  
  // Address Book state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home', address: '', city: '', postalCode: '', country: 'India', phone: ''
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('userInfo'));
    if (!data) { navigate('/login'); return; }
    setUserInfo(data);
    setPersonalForm({
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || ''
    });
  }, [navigate]);

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, personalForm, config);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      addToast('Profile updated!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSecurity = async (e) => {
    e.preventDefault();
    if (securityForm.password !== securityForm.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${API_BASE_URL}/api/auth/profile`, { password: securityForm.password }, config);
      setSecurityForm({ password: '', confirmPassword: '' });
      addToast('Password changed successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Security update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updatedAddressBook = [...(userInfo.addressBook || [])];
    // If setting as default, unset others
    const addressToAdd = { ...newAddress, isDefault: updatedAddressBook.length === 0 };
    updatedAddressBook.push(addressToAdd);

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, { addressBook: updatedAddressBook }, config);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      setShowAddressForm(false);
      setNewAddress({ label: 'Home', address: '', city: '', postalCode: '', country: 'India', phone: '' });
      addToast('Address saved to your book!', 'success');
    } catch (err) {
      addToast('Failed to save address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (index) => {
    const updatedAddressBook = userInfo.addressBook.filter((_, i) => i !== index);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, { addressBook: updatedAddressBook }, config);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      addToast('Address deleted', 'info');
    } catch { addToast('Delete failed', 'error'); }
  };

  const setDefaultAddress = async (index) => {
    const updatedAddressBook = userInfo.addressBook.map((a, i) => ({ ...a, isDefault: i === index }));
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, { addressBook: updatedAddressBook }, config);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      addToast('Default address set', 'success');
    } catch { addToast('Update failed', 'error'); }
  };

  if (!userInfo) return null;

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'address', label: 'Address Book', icon: MapPin },
    { id: 'loyalty', label: 'Loyalty & Rewards', icon: Coins },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end gap-6 pb-8 border-b border-border">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-white shadow-xl flex items-center justify-center text-4xl font-serif font-bold text-primary transition-transform group-hover:scale-105">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-primary-dark transition-all scale-90">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">{userInfo.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {userInfo.email}</span>
            <span className="flex items-center gap-1"><Coins className="h-4 w-4 text-primary" /> {userInfo.loyaltyPoints} Couture Coins (₹{(userInfo.loyaltyPoints * 0.02).toFixed(2)})</span>
            <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">Premium Member</span>
          </div>
        </div>
        <Button variant="outline" onClick={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} className="rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="lg:w-1/4">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium transition-all whitespace-nowrap lg:w-full ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'bg-card text-muted-foreground hover:bg-primary/5 hover:text-primary border border-border/50'
                }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : ''}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <main className="lg:w-3/4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                <CardContent className="p-8">
                  
                  {activeTab === 'personal' && (
                    <form onSubmit={handleUpdatePersonal} className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-serif font-bold text-foreground">Personal Information</h2>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Account Details</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                          <Input 
                            value={personalForm.name} 
                            onChange={e => setPersonalForm({...personalForm, name: e.target.value})} 
                            className="rounded-xl py-6 bg-muted/30 border-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                          <Input 
                            disabled value={personalForm.email} 
                            className="rounded-xl py-6 bg-muted/30 border-none cursor-not-allowed opacity-70"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              value={personalForm.phone} 
                              onChange={e => setPersonalForm({...personalForm, phone: e.target.value})} 
                              className="rounded-xl py-6 pl-11 bg-muted/30 border-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-7 text-base shadow-lg shadow-primary/10">
                        {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                      </Button>
                    </form>
                  )}

                  {activeTab === 'address' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-serif font-bold text-foreground">My Address Book</h2>
                          <p className="text-xs text-muted-foreground mt-1 tracking-wide">Save your shipping info for faster checkouts</p>
                        </div>
                        <Button onClick={() => setShowAddressForm(!showAddressForm)} disabled={showAddressForm} variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/5 h-10 px-6 gap-2">
                          <Plus className="h-4 w-4" /> Add New
                        </Button>
                      </div>

                      {showAddressForm && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-6 bg-primary/5 rounded-3xl border-2 border-primary/20 relative">
                          <button onClick={() => setShowAddressForm(false)} className="absolute top-4 right-4 p-1 hover:bg-primary/10 rounded-full transition-colors"><X className="h-5 w-5 text-primary" /></button>
                          <form onSubmit={handleAddressSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                              <select 
                                value={newAddress.label} 
                                onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                                className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none h-12"
                              >
                                <option>Home</option>
                                <option>Work</option>
                                <option>Other</option>
                              </select>
                              <Input placeholder="Nickname (e.g. Work)" value={newAddress.label !== 'Home' && newAddress.label !== 'Work' ? newAddress.label : ''} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="rounded-xl h-12" />
                            </div>
                            <Input placeholder="Street Address" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} required className="rounded-xl h-12" />
                            <div className="grid grid-cols-2 gap-4">
                              <Input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} required className="rounded-xl h-12" />
                              <Input placeholder="ZIP / Postal Code" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} required className="rounded-xl h-12" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Input placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} required className="rounded-xl h-12" />
                              <Input placeholder="Contact Number" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} required className="rounded-xl h-12" />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl h-12 shadow-md">
                              Save New Address
                            </Button>
                          </form>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userInfo.addressBook?.length > 0 ? (
                          userInfo.addressBook.map((addr, i) => (
                            <div key={i} className={`p-6 rounded-3xl border-2 transition-all relative group ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-border/50 bg-card hover:border-primary/30'}`}>
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    {addr.label === 'Home' ? <Home className="h-5 w-5 text-primary" /> : <Briefcase className="h-5 w-5 text-primary" />}
                                  </div>
                                  <div>
                                    <span className="font-serif font-bold text-base">{addr.label}</span>
                                    {addr.isDefault && <span className="ml-2 text-[8px] font-black tracking-widest bg-primary text-white px-2 py-0.5 rounded-full uppercase">Default</span>}
                                  </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button onClick={() => deleteAddress(i)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"><Trash2 className="h-4 w-4" /></button>
                                </div>
                              </div>
                              <div className="space-y-1 text-sm text-foreground/80">
                                <p className="font-medium">{addr.address}</p>
                                <p>{addr.city}, {addr.postalCode}</p>
                                <p className="flex items-center gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50"><Phone className="h-3 w-3" /> {addr.phone}</p>
                              </div>
                              {!addr.isDefault && (
                                <button onClick={() => setDefaultAddress(i)} className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Apply as Default</button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="md:col-span-2 py-20 text-center bg-muted/20 border-2 border-dashed border-border/50 rounded-3xl">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                              <MapPin className="h-8 w-8 text-muted-foreground opacity-30" />
                            </div>
                            <h3 className="font-serif font-bold text-lg text-foreground/70">Your Address Book is Empty</h3>
                            <p className="text-sm text-muted-foreground mt-1">Save addresses to make checkouts as easy as a single click.</p>
                            <button onClick={() => setShowAddressForm(true)} className="mt-6 text-primary font-bold text-sm tracking-wider hover:underline uppercase">Add My First Address</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'loyalty' && (
                    <div className="space-y-8">
                       <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-serif font-bold text-foreground">Couture Rewards</h2>
                        <Gift className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="relative p-10 bg-gradient-to-br from-primary-dark via-primary to-primary-light rounded-[2rem] text-white shadow-2xl overflow-hidden group">
                        {/* Abstract Background Design */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl mb-6 shadow-inner border border-white/20 transition-transform group-hover:scale-110">
                            <Coins className="h-12 w-12 text-white" />
                          </div>
                          <h4 className="text-sm font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Available Balance</h4>
                          <div className="flex items-baseline gap-3">
                            <span className="text-6xl font-serif font-black">{userInfo.loyaltyPoints}</span>
                            <span className="text-xl font-serif opacity-90">Coins</span>
                          </div>
                          <p className="mt-8 text-sm text-white/80 max-w-sm leading-relaxed">
                            Congratulations! Your loyalty earns you premium benefits. 100 Couture Coins = ₹2 discount.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                        <div className="p-6 bg-card border border-border rounded-3xl flex items-start gap-4 hover:shadow-md transition-shadow">
                          <div className="p-3 bg-amber-50 rounded-2xl"><TrendingUp className="h-6 w-6 text-amber-600" /></div>
                          <div>
                            <h4 className="font-bold text-sm">Earn 2% Back</h4>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">Shop any collection and earn 2 Couture Coins for every ₹100 spent.</p>
                          </div>
                        </div>
                        <div className="p-6 bg-card border border-border rounded-3xl flex items-start gap-4 hover:shadow-md transition-shadow">
                          <div className="p-3 bg-green-50 rounded-2xl"><CheckCircle2 className="h-6 w-6 text-green-600" /></div>
                          <div>
                            <h4 className="font-bold text-sm">Instant Redemption</h4>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">No minimums! Use your coins as cash during checkout instantly.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <form onSubmit={handleUpdateSecurity} className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-serif font-bold text-foreground">Account Security</h2>
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="password"
                              value={securityForm.password} 
                              onChange={e => setSecurityForm({...securityForm, password: e.target.value})} 
                              className="rounded-xl py-6 pl-11 bg-muted/30 border-none focus:ring-2 focus:ring-primary"
                              placeholder="Min. 6 characters"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confirm New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="password"
                              value={securityForm.confirmPassword} 
                              onChange={e => setSecurityForm({...securityForm, confirmPassword: e.target.value})} 
                              className="rounded-xl py-6 pl-11 bg-muted/30 border-none focus:ring-2 focus:ring-primary"
                              placeholder="Repeat password"
                            />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" disabled={loading || !securityForm.password} className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-7 text-base shadow-lg shadow-primary/10">
                        {loading ? 'Updating Security...' : 'Update Password Securely'}
                      </Button>
                    </form>
                  )}

                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Profile;
