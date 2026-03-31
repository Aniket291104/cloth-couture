import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Trash2, Download } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubscribers = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/newsletter/subscribers`, config);
      setSubscribers(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_BASE_URL}/api/newsletter/subscribers/${id}`, config);
      setSubscribers((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete subscriber.');
    }
  };

  const exportCSV = () => {
    const rows = [['Email', 'Subscribed At'], ...subscribers.map((s) => [s.email, new Date(s.subscribedAt).toLocaleString()])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading subscribers...</div>;
  if (error)   return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Newsletter Subscribers</h1>
          <p className="text-gray-500 mt-1">{subscribers.length} total subscriber{subscribers.length !== 1 ? 's' : ''}</p>
        </div>
        {subscribers.length > 0 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            Export CSV
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No subscribers yet</p>
            <p className="text-gray-400 text-sm mt-1">Subscribers from the homepage will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">#</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Subscribed At</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub, idx) => (
                  <tr key={sub._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-400">{idx + 1}</td>
                    <td className="p-4 text-sm text-gray-900 font-medium flex items-center gap-2">
                      <Mail size={14} className="text-primary shrink-0" />
                      {sub.email}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(sub.subscribedAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteSubscriber(sub._id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                        title="Remove subscriber"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscribers;
