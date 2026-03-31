import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5001/api/admin/stats', config);
        setStats(data);
        setLoading(false);
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      setLoading(false);
    }
  };

  const deliverHandler = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`http://localhost:5001/api/orders/${id}/deliver`, {}, config);
      fetchStats();
    } catch (err) {
      alert(err.response && err.response.data.message ? err.response.data.message : err.message);
    }
  };

  const payHandler = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`http://localhost:5001/api/orders/${id}/pay`, {}, config);
      fetchStats();
    } catch (err) {
      alert(err.response && err.response.data.message ? err.response.data.message : err.message);
    }
  };

    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const cards = [
    { title: 'Total Sales', value: `$${stats.totalSales}`, icon: <DollarSign className="w-8 h-8 text-green-500" />, bg: 'bg-green-100' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <ShoppingCart className="w-8 h-8 text-blue-500" />, bg: 'bg-blue-100' },
    { title: 'Total Products', value: stats.totalProducts, icon: <Package className="w-8 h-8 text-purple-500" />, bg: 'bg-purple-100' },
    { title: 'Total Users', value: stats.totalUsers, icon: <Users className="w-8 h-8 text-orange-500" />, bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 border border-gray-100">
            <div className={`p-4 rounded-full ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Delivery</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders?.map(order => (
                <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-900 font-mono">{order._id.substring(0, 8)}...</td>
                  <td className="p-4 text-sm text-gray-900">{order.userId?.name || 'Guest'}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">${order.totalAmount?.toFixed(2)}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.orderStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-sm w-32">
                    <div className="flex flex-col gap-2">
                      {order.paymentStatus !== 'Paid' && (
                        <button onClick={() => payHandler(order._id)} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors">
                          Mark Paid
                        </button>
                      )}
                      {order.orderStatus !== 'Delivered' && (
                        <button onClick={() => deliverHandler(order._id)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors">
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats.recentOrders || stats.recentOrders.length === 0) && (
            <div className="p-8 text-center text-gray-500">No recent orders</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
