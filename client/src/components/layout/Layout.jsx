import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const AIChatbot = lazy(() => import('../storefront/AIChatbot'));

const Layout = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    let idleCallbackId;
    let timeoutId;

    const loadChatbot = () => setShowChatbot(true);

    if ('requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(loadChatbot, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(loadChatbot, 1200);
    }

    return () => {
      if (idleCallbackId) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-24">
        <Outlet />
      </main>
      <Suspense fallback={null}>{showChatbot ? <AIChatbot /> : null}</Suspense>
      <Footer />
    </div>
  );
};

export default Layout;
