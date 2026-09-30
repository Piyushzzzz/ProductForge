import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

// Public & General Pages
import { MarketplacePage } from './pages/MarketplacePage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CustomerLibraryPage } from './pages/CustomerLibraryPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

// Creator Control Center Pages
import { CreatorLayout } from './pages/creator/CreatorLayout.js';
import { CreatorDashboardView } from './pages/creator/CreatorDashboardView.js';
import { MyProductsView } from './pages/creator/MyProductsView.js';
import { CreateProductView } from './pages/creator/CreateProductView.js';
import { ProductControlCenterView } from './pages/creator/ProductControlCenterView.js';
import { CreatorOrdersView } from './pages/creator/CreatorOrdersView.js';
import { CreatorAnalyticsView } from './pages/creator/CreatorAnalyticsView.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#0B1326] flex items-center justify-center text-xs text-slate-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-[#0B1326] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Marketplace */}
                <Route path="/" element={<MarketplacePage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Customer Library */}
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <CustomerLibraryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Creator Control Center Routes */}
                <Route
                  path="/creator/*"
                  element={
                    <ProtectedRoute allowedRoles={['CREATOR', 'ADMIN']}>
                      <CreatorLayout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/creator/dashboard" replace />} />
                          <Route path="dashboard" element={<CreatorDashboardView />} />
                          <Route path="products" element={<MyProductsView />} />
                          <Route path="products/new" element={<CreateProductView />} />
                          <Route path="products/:id" element={<ProductControlCenterView />} />
                          <Route path="products/:id/*" element={<ProductControlCenterView />} />
                          <Route path="orders" element={<CreatorOrdersView />} />
                          <Route path="analytics" element={<CreatorAnalyticsView />} />
                          <Route path="*" element={<Navigate to="/creator/dashboard" replace />} />
                        </Routes>
                      </CreatorLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Admin Operations */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
