import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyle } from './styles/global';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Orders = lazy(() => import('./pages/Orders').then((module) => ({ default: module.Orders })));
const Cart = lazy(() => import('./pages/Cart').then((module) => ({ default: module.Cart })));
const Admin = lazy(() => import('./pages/Admin').then((module) => ({ default: module.Admin })));
const AdminSales = lazy(() => import('./pages/Admin/Sales').then((module) => ({ default: module.AdminSales })));
const AdminCustomers = lazy(() => import('./pages/Admin/Customers').then((module) => ({ default: module.AdminCustomers })));
const AdminAudit = lazy(() => import('./pages/Admin/Audit').then((module) => ({ default: module.AdminAudit })));
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const SignUp = lazy(() => import('./pages/SignUp/index').then((module) => ({ default: module.SignUp })));
const ApiDemo = lazy(() => import('./pages/ApiDemo').then((module) => ({ default: module.ApiDemo })));

function RouteFallback() {
  return (
    <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cfcfcf' }}>
      Carregando tela...
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <GlobalStyle />
          <ToastContainer
            position="top-right"
            autoClose={8000}
            theme="dark"
            newestOnTop
            style={{ zIndex: 20000, top: '84px' }}
          />

          <Routes>
            <Route path="/login" element={<Suspense fallback={<RouteFallback />}><Login /></Suspense>} />
            <Route path="/signup" element={<Suspense fallback={<RouteFallback />}><SignUp /></Suspense>} />

            <Route path="/*" element={
              <Layout>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/api-demo" element={<ProtectedRoute isAdminOnly><ApiDemo /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute isAdminOnly><Admin /></ProtectedRoute>} />
                    <Route path="/admin/sales" element={<ProtectedRoute isAdminOnly><AdminSales /></ProtectedRoute>} />
                    <Route path="/admin/customers" element={<ProtectedRoute isAdminOnly><AdminCustomers /></ProtectedRoute>} />
                    <Route path="/admin/audit" element={<ProtectedRoute isAdminOnly><AdminAudit /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Suspense>
              </Layout>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;