import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Work from './pages/Work';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import ServiceDetail from './pages/ServiceDetail';
import PortfolioDetail from './pages/PortfolioDetail';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const AccessDenied = lazy(() =>
  import('./pages/MemberPortal').then((page) => ({ default: page.AccessDenied })),
);
const MemberDashboard = lazy(() =>
  import('./pages/MemberPortal').then((page) => ({ default: page.MemberDashboard })),
);
const MemberProfile = lazy(() =>
  import('./pages/MemberPortal').then((page) => ({ default: page.MemberProfile })),
);
const MembershipRequestDetail = lazy(() =>
  import('./pages/MemberPortal').then((page) => ({ default: page.MembershipRequestDetail })),
);
const MembershipRequests = lazy(() =>
  import('./pages/MemberPortal').then((page) => ({ default: page.MembershipRequests })),
);
const NewMembershipRequest = lazy(() =>
  import('./pages/MemberPortal').then((page) => ({ default: page.NewMembershipRequest })),
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminConsole').then((page) => ({ default: page.AdminDashboard })),
);
const AdminMembers = lazy(() =>
  import('./pages/AdminConsole').then((page) => ({ default: page.AdminMembers })),
);
const AdminRequestDetail = lazy(() =>
  import('./pages/AdminConsole').then((page) => ({ default: page.AdminRequestDetail })),
);

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
          <a
            href="#main-content"
            className="sr-only z-[60] bg-brand-dark px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="flex-grow pt-[77px] sm:pt-[89px]">
            <Suspense
              fallback={(
                <div className="mx-auto flex min-h-[55svh] max-w-xl items-center justify-center px-5 text-center">
                  <p role="status" className="text-sm text-neutral-400">Loading page…</p>
                </div>
              )}
            >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:servicePath" element={<ServiceDetail />} />
              <Route path="/work" element={<Navigate to="/portfolio" replace />} />
              <Route path="/portfolio" element={<Work />} />
              <Route path="/portfolio/:projectId" element={<PortfolioDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              <Route path="/admin/login" element={<AuthPage mode="login" adminEntry />} />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<MemberDashboard />} />
                <Route path="/profile" element={<MemberProfile />} />
                <Route path="/requests" element={<MembershipRequests />} />
                <Route path="/requests/new" element={<NewMembershipRequest />} />
                <Route path="/requests/:requestId" element={<MembershipRequestDetail />} />
              </Route>
              <Route element={<ProtectedRoute admin />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/requests/:requestId" element={<AdminRequestDetail />} />
                <Route path="/admin/members" element={<AdminMembers />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </main>
          <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;