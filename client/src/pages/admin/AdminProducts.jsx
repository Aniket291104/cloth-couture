import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`${API_BASE_URL}/api/products/${id}`, config);
        fetchProducts(); // Refresh list
      } catch (err) {
        alert(err.response && err.response.data.message ? err.response.data.message : err.message);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading products...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Products List</h1>
        <Link to="/admin/product/create" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-primary-dark transition-colors">
          <Plus size={20} className="mr-2" />
          Add Product
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">NAME</th>
                <th className="p-4 font-medium">PRICE</th>
                <th className="p-4 font-medium">CATEGORY</th>
                <th className="p-4 font-medium">STOCK</th>
                <th className="p-4 font-medium text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-400 font-mono">{product._id.substring(0, 8)}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="p-4 text-sm text-gray-600">${product.price.toFixed(2)}</td>
                  <td className="p-4 text-sm text-gray-600">{product.category}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-center">
                    <div className="flex justify-center space-x-3">
                      <Link to={`/admin/product/edit/${product._id}`} className="text-blue-500 hover:text-blue-700">
                        <Edit size={18} />
                      </Link>
                      <button onClick={() => deleteHandler(product._id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-8 text-center text-gray-500">No products found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
