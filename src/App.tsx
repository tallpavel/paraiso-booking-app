import { Helmet } from 'react-helmet-async';
import './index.css';
import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AmenitiesGrid from './components/AmenitiesGrid';
import MediaGallery from './components/MediaGallery';
import LocationMap from './components/LocationMap';
import DiscoverSection from './components/DiscoverSection';
import CustomerReviews from './components/CustomerReviews';
import BookingCTA from './components/BookingCTA';
import FAQ from './components/FAQ';
import FloatingContactButton from './components/FloatingContactButton';
import Footer from './components/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import CheckInForm from './components/CheckInForm';
import DiscoverDetailPage from './components/DiscoverDetailPage';
import TermsPage from './components/TermsPage';
import PaymentResultPage from './components/PaymentResultPage';

function PublicSite() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small timeout to let React finish rendering all sections
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hash]);
  return (
    <>
      <Helmet>
        <title>Sea View Holiday Apartment in Playa Paraíso, Tenerife | Book Direct</title>
        <meta name="description" content="Holiday apartment with sea views in Playa Paraíso, Adeje. Pool, terrace, free WiFi &amp; 300 days of sunshine. Book direct — save up to 15%. ★ 5.0 rated." />
        <link rel="canonical" href="https://veronicasflat.com" />
      </Helmet>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ocean focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        <HeroSection />
        <AmenitiesGrid />
        <MediaGallery />
        <LocationMap />
        <DiscoverSection />
        <CustomerReviews />
        <FAQ />
        <BookingCTA />
      </main>
      <Footer />
      <FloatingContactButton />
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/centralni-mozek-stranky/vchod" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/payment" element={<PaymentResultPage />} />
      <Route path="/discover/:slug" element={<DiscoverDetailPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/checkin/:token" element={<CheckInForm />} />
      <Route path="/centralni-mozek-stranky/vchod" element={<AdminLogin />} />
      <Route
        path="/centralni-mozek-stranky/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
