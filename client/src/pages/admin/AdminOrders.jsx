import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5001/api/orders', config);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      setLoading(false);
    }
  };

  const deliverHandler = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.put(`http://localhost:5001/api/orders/${id}/deliver`, {}, config);
      fetchOrders();
    } catch (err) {
      alert(err.response && err.response.data.message ? err.response.data.message : err.message);
    }
  };

  const payHandler = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.put(`http://localhost:5001/api/orders/${id}/pay`, {}, config);
      fetchOrders();
    } catch (err) {
      alert(err.response && err.response.data.message ? err.response.data.message : err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Orders List</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">USER</th>
                <th className="p-4 font-medium">DATE</th>
                <th className="p-4 font-medium">TOTAL</th>
                <th className="p-4 font-medium">PAID</th>
                <th className="p-4 font-medium">DELIVERY</th>
                <th className="p-4 font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-500 font-mono">{order._id.substring(0, 8)}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{order.userId?.name || 'Guest'}</td>
                  <td className="p-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-gray-600">${order.totalAmount?.toFixed(2)}</td>
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
                  <td className="p-4 text-sm">
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
          {orders.length === 0 && (
            <div className="p-8 text-center text-gray-500">No orders found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
