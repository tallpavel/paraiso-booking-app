import './index.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AmenitiesGrid from './components/AmenitiesGrid';
import MediaGallery from './components/MediaGallery';
import CustomerReviews from './components/CustomerReviews';
import BookingCalendar from './components/BookingCalendar';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

export default function App() {
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
        <CustomerReviews />
        <BookingCalendar />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
