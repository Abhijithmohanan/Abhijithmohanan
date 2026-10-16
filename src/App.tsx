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
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="flex min-h-screen flex-col">
          <a
            href="#main-content"
            className="sr-only z-[60] bg-brand-dark px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="flex-grow pt-[77px] sm:pt-[89px]">
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;