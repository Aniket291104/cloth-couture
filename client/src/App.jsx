import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Loader2 } from 'lucide-react';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Products = lazy(() => import('./pages/Products'));
const Collections = lazy(() => import('./pages/Collections'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const ProductCreate = lazy(() => import('./pages/admin/ProductCreate'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const ProductEdit = lazy(() => import('./pages/admin/ProductEdit'));
const AdminSubscribers = lazy(() => import('./pages/admin/AdminSubscribers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="products" element={<Products />} />
            <Route path="collections" element={<Collections />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="my-orders" element={<MyOrders />} />
            <Route path="profile" element={<Profile />} />
            <Route path="order-success" element={<OrderSuccess />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="product/create" element={<ProductCreate />} />
              <Route path="product/edit/:id" element={<ProductEdit />} />
              <Route path="subscribers" element={<AdminSubscribers />} />
              <Route path="coupons" element={<AdminCoupons />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
