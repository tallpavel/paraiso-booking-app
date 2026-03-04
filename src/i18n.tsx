import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'en' | 'es' | 'cs';

const translations = {
    en: {
        // Header / Nav
        'nav.amenities': 'Amenities',
        'nav.gallery': 'Gallery',
        'nav.reviews': 'Reviews',
        'nav.book': 'Book Now',
        'nav.contact': 'Contact',

        // Hero
        'hero.badge': 'Playa Paraíso · Tenerife',
        'hero.title': 'Your Dream Escape in',
        'hero.titleHighlight': 'Playa Paraíso',
        'hero.subtitle': 'Wake up to ocean views, year-round sunshine, and the serenity of southern Tenerife. Book directly\u00a0— no agency fees.',
        'hero.cta': 'Check Availability',
        'hero.explore': 'Explore the Flat',
        'hero.trust': 'Loved by 120+ guests',

        // Amenities
        'amenities.label': 'What We Offer',
        'amenities.title': 'Everything You Need for a Perfect Stay',
        'amenities.subtitle': 'Our beautifully appointed flat comes with premium amenities to make your Tenerife holiday truly unforgettable.',
        'amenity.oceanView': 'Ocean View',
        'amenity.oceanViewDesc': 'Breathtaking panoramic views of the Atlantic from your private terrace.',
        'amenity.pool': 'Swimming Pool',
        'amenity.poolDesc': 'Relax by the communal pool surrounded by tropical gardens.',
        'amenity.wifi': 'Free High-Speed WiFi',
        'amenity.wifiDesc': 'Stay connected with reliable fibre-optic WiFi throughout the flat.',
        'amenity.terrace': 'Private Terrace',
        'amenity.terraceDesc': 'Your own sun-drenched terrace — perfect for morning coffee or sunset drinks.',
        'amenity.ac': 'Air Conditioning',
        'amenity.acDesc': 'Full climate control for your comfort in every room.',
        'amenity.kitchen': 'Fully Equipped Kitchen',
        'amenity.kitchenDesc': 'Modern kitchen with everything you need to cook your favourite meals.',
        'amenity.tv': 'Smart TV',
        'amenity.tvDesc': 'Netflix, YouTube, and streaming apps on a large flat-screen TV.',
        'amenity.parking': 'Free Parking',
        'amenity.parkingDesc': 'Secure on-site parking space included with your stay.',

        // Gallery
        'gallery.label': 'Gallery',
        'gallery.title': 'Take a Look Inside',
        'gallery.subtitle': 'Explore every corner of the flat and the stunning Playa Paraíso surroundings.',
        'gallery.all': 'All',
        'gallery.interior': 'Interior',
        'gallery.terrace': 'Terrace',
        'gallery.pool': 'Pool',
        'gallery.beach': 'Beach',
        'gallery.views': 'Views',

        // Reviews
        'reviews.label': 'Guest Reviews',
        'reviews.title': 'What Our Guests Say',
        'reviews.count': 'reviews',

        // Booking
        'booking.label': 'Availability',
        'booking.title': 'Book Your Stay',
        'booking.subtitle': 'Select your dates and we\'ll get back to you within 24 hours to confirm your reservation. Book directly for the best price.',
        'booking.yourStay': 'Your Stay',
        'booking.checkIn': 'Check-in',
        'booking.checkOut': 'Check-out',
        'booking.guests': 'Guests',
        'booking.guest': 'Guest',
        'booking.guests_plural': 'Guests',
        'booking.selectDate': 'Select date…',
        'booking.night': 'night',
        'booking.nights': 'nights',
        'booking.request': 'Request Booking',
        'booking.sent': '✓ Request Sent!',
        'booking.noPayment': 'No payment required — we\'ll confirm availability first.',
        'booking.name': 'Your Name',
        'booking.namePlaceholder': 'Full name…',
        'booking.email': 'Your Email',
        'booking.emailPlaceholder': 'you@example.com',
        'booking.errorName': 'Please enter your name',
        'booking.errorEmail': 'Please enter your email',
        'booking.errorEmailInvalid': 'Please enter a valid email',
        'booking.errorDates': 'Please select check-in and check-out dates',
        'booking.sending': 'Sending…',
        'booking.errorServer': 'Something went wrong. Please try again.',

        // Contact
        'contact.label': 'Get in Touch',
        'contact.title': 'We\'d Love to Hear From You',
        'contact.subtitle': 'Have a question about the flat, the area, or your trip? Send us a message and we\'ll reply within 24 hours.',
        'contact.address': 'Address',
        'contact.email': 'Email',
        'contact.location': 'Location',
        'contact.locationValue': 'Southern Tenerife, Canary Islands',
        'contact.locationExtra': '15 min from Tenerife South Airport (TFS)',
        'contact.name': 'Name',
        'contact.phone': 'Phone',
        'contact.phoneOptional': '(optional)',
        'contact.message': 'Message',
        'contact.namePlaceholder': 'Your full name…',
        'contact.emailPlaceholder': 'you@example.com…',
        'contact.phonePlaceholder': '+34 …',
        'contact.messagePlaceholder': 'Tell us about your trip or ask a question…',
        'contact.send': 'Send Message',
        'contact.sending': 'Sending…',
        'contact.messageSent': '✓ Message Sent!',
        'contact.thanks': 'Thank you! We\'ll get back to you within 24 hours.',
        'contact.errorName': 'Please enter your name',
        'contact.errorEmail': 'Please enter your email',
        'contact.errorEmailInvalid': 'Please enter a valid email address',
        'contact.errorMessage': 'Please enter a message',
        'contact.viewMap': 'View on Google Maps',

        // Footer
        'footer.description': 'A beautiful holiday apartment in the heart of Playa Paraíso, Tenerife. Ocean views, pool access, and sunshine year-round.',
        'footer.quickLinks': 'Quick Links',
        'footer.location': 'Location',
        'footer.contact': 'Contact',
        'footer.airport': '15 min from TFS Airport',
        'footer.copyright': 'Verónica\'s Flat — Playa Paraíso, Tenerife. All rights reserved.',
    },

    es: {
        // Header / Nav
        'nav.amenities': 'Comodidades',
        'nav.gallery': 'Galería',
        'nav.reviews': 'Opiniones',
        'nav.book': 'Reservar',
        'nav.contact': 'Contacto',

        // Hero
        'hero.badge': 'Playa Paraíso · Tenerife',
        'hero.title': 'Tu Escapada Soñada en',
        'hero.titleHighlight': 'Playa Paraíso',
        'hero.subtitle': 'Despierta con vistas al océano, sol todo el año y la tranquilidad del sur de Tenerife. Reserva directamente\u00a0— sin comisiones.',
        'hero.cta': 'Ver Disponibilidad',
        'hero.explore': 'Explorar el Apartamento',
        'hero.trust': 'Valorado por más de 120 huéspedes',

        // Amenities
        'amenities.label': 'Qué Ofrecemos',
        'amenities.title': 'Todo lo que Necesitas para una Estancia Perfecta',
        'amenities.subtitle': 'Nuestro apartamento está equipado con comodidades premium para hacer tus vacaciones en Tenerife verdaderamente inolvidables.',
        'amenity.oceanView': 'Vista al Océano',
        'amenity.oceanViewDesc': 'Impresionantes vistas panorámicas del Atlántico desde tu terraza privada.',
        'amenity.pool': 'Piscina',
        'amenity.poolDesc': 'Relájate en la piscina comunitaria rodeada de jardines tropicales.',
        'amenity.wifi': 'WiFi de Alta Velocidad',
        'amenity.wifiDesc': 'Conéctate con WiFi de fibra óptica en todo el apartamento.',
        'amenity.terrace': 'Terraza Privada',
        'amenity.terraceDesc': 'Tu propia terraza soleada — perfecta para el café matutino o el atardecer.',
        'amenity.ac': 'Aire Acondicionado',
        'amenity.acDesc': 'Climatización completa para tu confort en cada habitación.',
        'amenity.kitchen': 'Cocina Completa',
        'amenity.kitchenDesc': 'Cocina moderna con todo lo necesario para preparar tus comidas favoritas.',
        'amenity.tv': 'Smart TV',
        'amenity.tvDesc': 'Netflix, YouTube y apps de streaming en un televisor de pantalla grande.',
        'amenity.parking': 'Aparcamiento Gratuito',
        'amenity.parkingDesc': 'Plaza de aparcamiento seguro incluida con tu estancia.',

        // Gallery
        'gallery.label': 'Galería',
        'gallery.title': 'Echa un Vistazo al Interior',
        'gallery.subtitle': 'Explora cada rincón del apartamento y los espectaculares alrededores de Playa Paraíso.',
        'gallery.all': 'Todo',
        'gallery.interior': 'Interior',
        'gallery.terrace': 'Terraza',
        'gallery.pool': 'Piscina',
        'gallery.beach': 'Playa',
        'gallery.views': 'Vistas',

        // Reviews
        'reviews.label': 'Opiniones de Huéspedes',
        'reviews.title': 'Lo que Dicen Nuestros Huéspedes',
        'reviews.count': 'opiniones',

        // Booking
        'booking.label': 'Disponibilidad',
        'booking.title': 'Reserva Tu Estancia',
        'booking.subtitle': 'Selecciona tus fechas y te responderemos en 24 horas para confirmar tu reserva. Reserva directamente al mejor precio.',
        'booking.yourStay': 'Tu Estancia',
        'booking.checkIn': 'Entrada',
        'booking.checkOut': 'Salida',
        'booking.guests': 'Huéspedes',
        'booking.guest': 'Huésped',
        'booking.guests_plural': 'Huéspedes',
        'booking.selectDate': 'Selecciona fecha…',
        'booking.night': 'noche',
        'booking.nights': 'noches',
        'booking.request': 'Solicitar Reserva',
        'booking.sent': '✓ ¡Solicitud Enviada!',
        'booking.noPayment': 'Sin pago previo — confirmaremos disponibilidad primero.',
        'booking.name': 'Tu Nombre',
        'booking.namePlaceholder': 'Nombre completo…',
        'booking.email': 'Tu Email',
        'booking.emailPlaceholder': 'tu@ejemplo.com',
        'booking.errorName': 'Por favor, introduce tu nombre',
        'booking.errorEmail': 'Por favor, introduce tu email',
        'booking.errorEmailInvalid': 'Por favor, introduce un email válido',
        'booking.errorDates': 'Por favor, selecciona las fechas de entrada y salida',
        'booking.sending': 'Enviando…',
        'booking.errorServer': 'Algo salió mal. Inténtalo de nuevo.',

        // Contact
        'contact.label': 'Contacto',
        'contact.title': 'Nos Encantaría Saber de Ti',
        'contact.subtitle': '¿Tienes alguna pregunta sobre el apartamento, la zona o tu viaje? Envíanos un mensaje y te responderemos en 24 horas.',
        'contact.address': 'Dirección',
        'contact.email': 'Correo electrónico',
        'contact.location': 'Ubicación',
        'contact.locationValue': 'Sur de Tenerife, Islas Canarias',
        'contact.locationExtra': 'A 15 min del Aeropuerto Tenerife Sur (TFS)',
        'contact.name': 'Nombre',
        'contact.phone': 'Teléfono',
        'contact.phoneOptional': '(opcional)',
        'contact.message': 'Mensaje',
        'contact.namePlaceholder': 'Tu nombre completo…',
        'contact.emailPlaceholder': 'tu@ejemplo.com…',
        'contact.phonePlaceholder': '+34 …',
        'contact.messagePlaceholder': 'Cuéntanos sobre tu viaje o haz una pregunta…',
        'contact.send': 'Enviar Mensaje',
        'contact.sending': 'Enviando…',
        'contact.messageSent': '✓ ¡Mensaje Enviado!',
        'contact.thanks': '¡Gracias! Te responderemos en menos de 24 horas.',
        'contact.errorName': 'Por favor, introduce tu nombre',
        'contact.errorEmail': 'Por favor, introduce tu correo electrónico',
        'contact.errorEmailInvalid': 'Por favor, introduce un correo electrónico válido',
        'contact.errorMessage': 'Por favor, escribe un mensaje',
        'contact.viewMap': 'Ver en Google Maps',

        // Footer
        'footer.description': 'Un hermoso apartamento vacacional en el corazón de Playa Paraíso, Tenerife. Vistas al mar, acceso a piscina y sol todo el año.',
        'footer.quickLinks': 'Enlaces Rápidos',
        'footer.location': 'Ubicación',
        'footer.contact': 'Contacto',
        'footer.airport': 'A 15 min del Aeropuerto TFS',
        'footer.copyright': 'Verónica\'s Flat — Playa Paraíso, Tenerife. Todos los derechos reservados.',
    },

    cs: {
        // Header / Nav
        'nav.amenities': 'Vybavení',
        'nav.gallery': 'Galerie',
        'nav.reviews': 'Recenze',
        'nav.book': 'Rezervovat',
        'nav.contact': 'Kontakt',

        // Hero
        'hero.badge': 'Playa Paraíso · Tenerife',
        'hero.title': 'Váš Vysněný Únik na',
        'hero.titleHighlight': 'Playa Paraíso',
        'hero.subtitle': 'Probuďte se s výhledem na oceán, celoročním sluncem a klidem jižního Tenerife. Rezervujte přímo\u00a0— bez provizí.',
        'hero.cta': 'Zkontrolovat Dostupnost',
        'hero.explore': 'Prohlédnout Apartmán',
        'hero.trust': 'Oblíbený u více než 120 hostů',

        // Amenities
        'amenities.label': 'Co Nabízíme',
        'amenities.title': 'Vše, co Potřebujete pro Dokonalý Pobyt',
        'amenities.subtitle': 'Náš krásně zařízený apartmán nabízí prémiové vybavení, díky kterému bude vaše dovolená na Tenerife opravdu nezapomenutelná.',
        'amenity.oceanView': 'Výhled na Oceán',
        'amenity.oceanViewDesc': 'Dechberoucí panoramatické výhledy na Atlantik z vaší soukromé terasy.',
        'amenity.pool': 'Bazén',
        'amenity.poolDesc': 'Relaxujte u společného bazénu obklopeného tropickými zahradami.',
        'amenity.wifi': 'Rychlé WiFi Zdarma',
        'amenity.wifiDesc': 'Zůstaňte připojeni díky spolehlivému optickému WiFi v celém apartmánu.',
        'amenity.terrace': 'Soukromá Terasa',
        'amenity.terraceDesc': 'Vaše vlastní sluncem zalitá terasa — ideální na ranní kávu nebo drink při západu slunce.',
        'amenity.ac': 'Klimatizace',
        'amenity.acDesc': 'Plná klimatizace pro váš komfort v každém pokoji.',
        'amenity.kitchen': 'Plně Vybavená Kuchyně',
        'amenity.kitchenDesc': 'Moderní kuchyně se vším, co potřebujete k přípravě vašich oblíbených jídel.',
        'amenity.tv': 'Smart TV',
        'amenity.tvDesc': 'Netflix, YouTube a streamovací aplikace na velkém televizoru.',
        'amenity.parking': 'Parkování Zdarma',
        'amenity.parkingDesc': 'Zabezpečené parkovací místo v areálu je součástí vašeho pobytu.',

        // Gallery
        'gallery.label': 'Galerie',
        'gallery.title': 'Nahlédněte Dovnitř',
        'gallery.subtitle': 'Prozkoumejte každý kout apartmánu a nádherné okolí Playa Paraíso.',
        'gallery.all': 'Vše',
        'gallery.interior': 'Interiér',
        'gallery.terrace': 'Terasa',
        'gallery.pool': 'Bazén',
        'gallery.beach': 'Pláž',
        'gallery.views': 'Výhledy',

        // Reviews
        'reviews.label': 'Recenze Hostů',
        'reviews.title': 'Co Říkají Naši Hosté',
        'reviews.count': 'recenzí',

        // Booking
        'booking.label': 'Dostupnost',
        'booking.title': 'Rezervujte Si Pobyt',
        'booking.subtitle': 'Vyberte si termín a do 24 hodin vám potvrdíme rezervaci. Rezervujte přímo za nejlepší cenu.',
        'booking.yourStay': 'Váš Pobyt',
        'booking.checkIn': 'Příjezd',
        'booking.checkOut': 'Odjezd',
        'booking.guests': 'Hosté',
        'booking.guest': 'Host',
        'booking.guests_plural': 'Hostů',
        'booking.selectDate': 'Vyberte datum…',
        'booking.night': 'noc',
        'booking.nights': 'nocí',
        'booking.request': 'Odeslat Rezervaci',
        'booking.sent': '✓ Rezervace Odeslána!',
        'booking.noPayment': 'Bez platby předem — nejprve potvrdíme dostupnost.',
        'booking.name': 'Vaše Jméno',
        'booking.namePlaceholder': 'Celé jméno…',
        'booking.email': 'Váš E-mail',
        'booking.emailPlaceholder': 'vas@email.cz',
        'booking.errorName': 'Prosím, zadejte své jméno',
        'booking.errorEmail': 'Prosím, zadejte svůj e-mail',
        'booking.errorEmailInvalid': 'Prosím, zadejte platný e-mail',
        'booking.errorDates': 'Prosím, vyberte datum příjezdu a odjezdu',
        'booking.sending': 'Odesílání…',
        'booking.errorServer': 'Něco se pokazilo. Zkuste to prosím znovu.',

        // Contact
        'contact.label': 'Kontaktujte Nás',
        'contact.title': 'Rádi od Vás Uslyšíme',
        'contact.subtitle': 'Máte dotaz ohledně apartmánu, okolí nebo vaší cesty? Napište nám a odpovíme do 24 hodin.',
        'contact.address': 'Adresa',
        'contact.email': 'E-mail',
        'contact.location': 'Poloha',
        'contact.locationValue': 'Jižní Tenerife, Kanárské ostrovy',
        'contact.locationExtra': '15 min od letiště Tenerife Jih (TFS)',
        'contact.name': 'Jméno',
        'contact.phone': 'Telefon',
        'contact.phoneOptional': '(nepovinné)',
        'contact.message': 'Zpráva',
        'contact.namePlaceholder': 'Vaše celé jméno…',
        'contact.emailPlaceholder': 'vas@email.cz…',
        'contact.phonePlaceholder': '+420 …',
        'contact.messagePlaceholder': 'Řekněte nám o vaší cestě nebo se zeptejte…',
        'contact.send': 'Odeslat Zprávu',
        'contact.sending': 'Odesílání…',
        'contact.messageSent': '✓ Zpráva Odeslána!',
        'contact.thanks': 'Děkujeme! Ozveme se vám do 24 hodin.',
        'contact.errorName': 'Prosím, zadejte své jméno',
        'contact.errorEmail': 'Prosím, zadejte svůj e-mail',
        'contact.errorEmailInvalid': 'Prosím, zadejte platnou e-mailovou adresu',
        'contact.errorMessage': 'Prosím, napište zprávu',
        'contact.viewMap': 'Zobrazit na Google Maps',

        // Footer
        'footer.description': 'Krásný prázdninový apartmán v srdci Playa Paraíso, Tenerife. Výhledy na moře, přístup k bazénu a slunce po celý rok.',
        'footer.quickLinks': 'Rychlé Odkazy',
        'footer.location': 'Poloha',
        'footer.contact': 'Kontakt',
        'footer.airport': '15 min od letiště TFS',
        'footer.copyright': 'Verónica\'s Flat — Playa Paraíso, Tenerife. Všechna práva vyhrazena.',
    },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('locale') as Locale | null;
            if (saved === 'en' || saved === 'es' || saved === 'cs') return saved;
            const browserLang = navigator.language.slice(0, 2);
            if (browserLang === 'cs') return 'cs';
            return browserLang === 'es' ? 'es' : 'en';
        }
        return 'en';
    });

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        document.documentElement.lang = newLocale;
    }, []);

    const t = useCallback(
        (key: TranslationKey): string => {
            return translations[locale][key] ?? translations.en[key] ?? key;
        },
        [locale],
    );

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
