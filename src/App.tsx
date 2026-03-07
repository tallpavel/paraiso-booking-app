import './index.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AmenitiesGrid from './components/AmenitiesGrid';
import MediaGallery from './components/MediaGallery';
import LocationMap from './components/LocationMap';
import DiscoverSection from './components/DiscoverSection';
import CustomerReviews from './components/CustomerReviews';
import BookingCTA from './components/BookingCTA';
import FloatingContactButton from './components/FloatingContactButton';
import Footer from './components/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';

function PublicSite() {
  return (
    <>
      <a
        href="#amenities"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ocean focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Header />
      <main>
        <HeroSection />
        <AmenitiesGrid />
        <MediaGallery />
        <LocationMap />
        <DiscoverSection />
        <CustomerReviews />
        <BookingCTA />
      </main>
      <Footer />
      <FloatingContactButton />
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
