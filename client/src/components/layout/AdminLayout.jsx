import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PackagePlus, Package, ShoppingCart, LogOut, Mail, Tag } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Add Product', path: '/admin/product/create', icon: <PackagePlus size={20} /> },
    { name: 'Products List', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Orders List', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Subscribers', path: '/admin/subscribers', icon: <Mail size={20} /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <Tag size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (!userInfo || userInfo.role !== 'admin') {
     // Redirect non-admin users
     navigate('/');
     return null;
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] bg-gray-50 bg-neutral-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-100 flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold font-heading text-neutral-900">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-neutral-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-neutral-900'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
