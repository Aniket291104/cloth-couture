import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import axios from 'axios';
import { API_BASE_URL } from './lib/utils.js';

axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000;

const addNetworkHints = () => {
  try {
    const apiOrigin = new URL(API_BASE_URL).origin;
    if (apiOrigin.includes('localhost')) return;

    const links = [
      { rel: 'dns-prefetch', href: apiOrigin },
      { rel: 'preconnect', href: apiOrigin, crossOrigin: '' },
    ];

    links.forEach((attrs) => {
      const link = document.createElement('link');
      Object.entries(attrs).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      document.head.appendChild(link);
    });
  } catch {
    // Ignore malformed URL values in local development.
  }
};

addNetworkHints();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  </React.StrictMode>
);
