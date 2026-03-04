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

        // Location Map
        'map.label': 'Location',
        'map.title': 'Perfectly Located',
        'map.subtitle': 'Everything you need is just a short walk away — beaches, restaurants, shops and more.',
        'map.nearby': 'What\'s Nearby',
        'map.beach': 'Playa de la Enramada',
        'map.beachDist': '3 min walk (250 m)',
        'map.restaurants': 'Restaurants & Bars',
        'map.restaurantsDist': '2-5 min walk',
        'map.supermarket': 'Supermarket (HiperDino)',
        'map.supermarketDist': '5 min walk (400 m)',
        'map.pharmacy': 'Pharmacy',
        'map.pharmacyDist': '6 min walk (450 m)',
        'map.pool': 'Communal Pool',
        'map.poolDist': 'In the building',
        'map.airport': 'Tenerife South Airport',
        'map.airportDist': '20 min by car (25 km)',
        'map.directions': 'Get Directions',

        // Discover Playa Paraíso
        'discover.label': 'Discover the Area',
        'discover.title': 'Explore Playa Paraíso',
        'discover.subtitle': 'More than just a place to stay — discover the best experiences, activities, and hidden gems that southern Tenerife has to offer.',
        'discover.beachTitle': 'Pristine Beaches',
        'discover.beachDesc': 'Golden and volcanic black-sand beaches just steps away. Playa del Duque and Playa de la Enramada are local favourites.',
        'discover.snorkelTitle': 'Snorkeling & Diving',
        'discover.snorkelDesc': 'Crystal-clear Atlantic waters with vibrant marine life, sea turtles, and volcanic rock formations perfect for underwater exploration.',
        'discover.whaleTitle': 'Whale & Dolphin Watching',
        'discover.whaleDesc': 'Year-round boat excursions to see pilot whales and bottlenose dolphins in their natural habitat — just minutes from the coast.',
        'discover.hikingTitle': 'Hiking & Nature',
        'discover.hikingDesc': 'From coastal cliff trails to the majestic Teide National Park, Tenerife offers world-class hiking for every fitness level.',
        'discover.foodTitle': 'Local Gastronomy',
        'discover.foodDesc': 'Savor fresh seafood, Canarian wrinkled potatoes with mojo sauce, and local wines from century-old vineyards.',
        'discover.sunsetTitle': 'Magical Sunsets',
        'discover.sunsetDesc': 'Watch the sun dip below the Atlantic from your terrace or the nearby cliffs — the golden hour here is truly spectacular.',
        'discover.funFact': '🌋 Playa Paraíso sits on the sunny southwest coast of Tenerife, enjoying over 300 days of sunshine per year with average temperatures of 22–28°C. Mount Teide, Spain\'s highest peak, is just a 90-minute drive away.',
        'discover.learnMore': 'Learn more',

        // Reviews
        'reviews.label': 'Guest Reviews',
        'reviews.title': 'What Our Guests Say',
        'reviews.count': 'reviews',

        // Booking CTA
        'bookingCta.title': 'Ready for Your Paradise Getaway?',
        'bookingCta.subtitle': 'Book your stay at Verónica\'s Flat and wake up to stunning ocean views, warm Canarian sunshine, and the sound of waves just steps away.',
        'bookingCta.button': 'Check Availability',
        'bookingCta.hint': 'Free cancellation · No booking fees · Instant confirmation',

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
        'booking.from': 'From',
        'booking.total': 'Total',
        'booking.minNights': 'Minimum stay is 3 nights',
        'booking.comment': 'Comment',
        'booking.commentPlaceholder': 'Any special requests or notes…',
        'booking.stepDates': 'Dates',
        'booking.stepDetails': 'Details',
        'booking.stepConfirm': 'Confirm',
        'booking.stepDatesTitle': 'Select Your Dates',
        'booking.stepDetailsTitle': 'Your Details',
        'booking.stepConfirmTitle': 'Review & Confirm',
        'booking.next': 'Continue',
        'booking.back': 'Back',
        'booking.sentSubtitle': 'We will contact you shortly to confirm your reservation.',

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
        'contact.errorServer': 'Something went wrong. Please try again later.',
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

        // Mapa de Ubicación
        'map.label': 'Ubicación',
        'map.title': 'Perfectamente Ubicado',
        'map.subtitle': 'Todo lo que necesitas está a solo unos pasos — playas, restaurantes, tiendas y más.',
        'map.nearby': 'Qué Hay Cerca',
        'map.beach': 'Playa de la Enramada',
        'map.beachDist': '3 min a pie (250 m)',
        'map.restaurants': 'Restaurantes y Bares',
        'map.restaurantsDist': '2-5 min a pie',
        'map.supermarket': 'Supermercado (HiperDino)',
        'map.supermarketDist': '5 min a pie (400 m)',
        'map.pharmacy': 'Farmacia',
        'map.pharmacyDist': '6 min a pie (450 m)',
        'map.pool': 'Piscina Comunitaria',
        'map.poolDist': 'En el edificio',
        'map.airport': 'Aeropuerto Tenerife Sur',
        'map.airportDist': '20 min en coche (25 km)',
        'map.directions': 'Cómo Llegar',

        // Descubrir Playa Paraíso
        'discover.label': 'Descubre la Zona',
        'discover.title': 'Explora Playa Paraíso',
        'discover.subtitle': 'Más que un lugar donde alojarse — descubre las mejores experiencias, actividades y rincones secretos del sur de Tenerife.',
        'discover.beachTitle': 'Playas Paradisíacas',
        'discover.beachDesc': 'Playas de arena dorada y volcánica a pocos pasos. Playa del Duque y Playa de la Enramada son las favoritas de la zona.',
        'discover.snorkelTitle': 'Snorkel y Buceo',
        'discover.snorkelDesc': 'Aguas cristalinas del Atlántico con vida marina vibrante, tortugas marinas y formaciones rocosas volcánicas perfectas para explorar.',
        'discover.whaleTitle': 'Avistamiento de Ballenas',
        'discover.whaleDesc': 'Excursiones en barco durante todo el año para ver ballenas piloto y delfines mulares en su hábitat natural — a minutos de la costa.',
        'discover.hikingTitle': 'Senderismo y Naturaleza',
        'discover.hikingDesc': 'Desde senderos costeros hasta el majestuoso Parque Nacional del Teide, Tenerife ofrece rutas de senderismo de primer nivel.',
        'discover.foodTitle': 'Gastronomía Local',
        'discover.foodDesc': 'Saborea marisco fresco, papas arrugadas con mojo, y vinos locales de viñedos centenarios.',
        'discover.sunsetTitle': 'Atardeceres Mágicos',
        'discover.sunsetDesc': 'Contempla el sol hundiéndose en el Atlántico desde tu terraza o los acantilados cercanos — la hora dorada aquí es verdaderamente espectacular.',
        'discover.funFact': '🌋 Playa Paraíso se encuentra en la soleada costa suroeste de Tenerife, disfrutando de más de 300 días de sol al año con temperaturas medias de 22–28°C. El Teide, el pico más alto de España, está a solo 90 minutos en coche.',
        'discover.learnMore': 'Saber más',

        // Reviews
        'reviews.label': 'Opiniones de Huéspedes',
        'reviews.title': 'Lo que Dicen Nuestros Huéspedes',
        'reviews.count': 'opiniones',

        // CTA de Reserva
        'bookingCta.title': '¿Listo para Tu Escapada al Paraíso?',
        'bookingCta.subtitle': 'Reserva tu estancia en el apartamento de Verónica y despierta con impresionantes vistas al mar, cálido sol canario y el sonido de las olas a pocos pasos.',
        'bookingCta.button': 'Ver Disponibilidad',
        'bookingCta.hint': 'Cancelación gratuita · Sin comisiones · Confirmación inmediata',

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
        'booking.from': 'Desde',
        'booking.total': 'Total',
        'booking.minNights': 'La estancia mínima es de 3 noches',
        'booking.comment': 'Comentario',
        'booking.commentPlaceholder': 'Solicitudes especiales o notas…',
        'booking.stepDates': 'Fechas',
        'booking.stepDetails': 'Datos',
        'booking.stepConfirm': 'Confirmar',
        'booking.stepDatesTitle': 'Selecciona Tus Fechas',
        'booking.stepDetailsTitle': 'Tus Datos',
        'booking.stepConfirmTitle': 'Revisar y Confirmar',
        'booking.next': 'Continuar',
        'booking.back': 'Volver',
        'booking.sentSubtitle': 'Te contactaremos pronto para confirmar tu reserva.',

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
        'contact.errorServer': 'Algo salió mal. Inténtalo de nuevo más tarde.',
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

        // Mapa Polohy
        'map.label': 'Poloha',
        'map.title': 'Perfektní Poloha',
        'map.subtitle': 'Vše, co potřebujete, je jen pár kroků daleko — pláže, restaurace, obchody a další.',
        'map.nearby': 'Co Je Poblíž',
        'map.beach': 'Playa de la Enramada',
        'map.beachDist': '3 min pěšky (250 m)',
        'map.restaurants': 'Restaurace a Bary',
        'map.restaurantsDist': '2-5 min pěšky',
        'map.supermarket': 'Supermarket (HiperDino)',
        'map.supermarketDist': '5 min pěšky (400 m)',
        'map.pharmacy': 'Lékárna',
        'map.pharmacyDist': '6 min pěšky (450 m)',
        'map.pool': 'Společný Bazén',
        'map.poolDist': 'V budově',
        'map.airport': 'Letiště Tenerife Jih',
        'map.airportDist': '20 min autem (25 km)',
        'map.directions': 'Navigovat',

        // Objevte Playa Paraíso
        'discover.label': 'Objevte Okolí',
        'discover.title': 'Prozkoumejte Playa Paraíso',
        'discover.subtitle': 'Více než jen ubytování — poznejte nejlepší zážitky, aktivity a skryté klenoty jižního Tenerife.',
        'discover.beachTitle': 'Nádherné Pláže',
        'discover.beachDesc': 'Zlaté a černé písčité pláže vulkanického původu na dosah ruky. Playa del Duque a Playa de la Enramada jsou místní oblíbenci.',
        'discover.snorkelTitle': 'Šnorchlování a Potápění',
        'discover.snorkelDesc': 'Křišťálově čisté vody Atlantiku s pestrým mořským životem, mořskými želvami a vulkanickými útesy ideálními pro podmořský průzkum.',
        'discover.whaleTitle': 'Pozorování Velryb a Delfínů',
        'discover.whaleDesc': 'Celoroční lodní výlety za grindami a delfíny v jejich přirozeném prostředí — jen pár minut od pobřeží.',
        'discover.hikingTitle': 'Turistika a Příroda',
        'discover.hikingDesc': 'Od pobřežních stezek po majestátní Národní park Teide — Tenerife nabízí turistiku světové úrovně pro všechny zdatnostní kategorie.',
        'discover.foodTitle': 'Místní Gastronomie',
        'discover.foodDesc': 'Vychutnejte si čerstvé mořské plody, kanárské papas arrugadas s omáčkou mojo a místní vína ze staletých vinic.',
        'discover.sunsetTitle': 'Kouzelné Západy Slunce',
        'discover.sunsetDesc': 'Sledujte slunce klesající pod hladinu Atlantiku z vaší terasy nebo z nedaleký útesů — zlatá hodinka je tu opravdu velkolepá.',
        'discover.funFact': '🌋 Playa Paraíso leží na slunném jihozápadním pobřeží Tenerife a těší se více než 300 slunečným dnům ročně s průměrnými teplotami 22–28 °C. Teide, nejvyšší hora Španělska, je jen 90 minut jízdy autem.',
        'discover.learnMore': 'Více informací',

        // Reviews
        'reviews.label': 'Recenze Hostů',
        'reviews.title': 'Co Říkají Naši Hosté',
        'reviews.count': 'recenzí',

        // CTA Rezervace
        'bookingCta.title': 'Připraveni na Rajskou Dovolenou?',
        'bookingCta.subtitle': 'Zarezervujte si pobyt v apartmánu Veroniky a probouzejte se s úžasným výhledem na oceán, teplým kanárským sluncem a zvukem vln jen pár kroků daleko.',
        'bookingCta.button': 'Zkontrolovat Dostupnost',
        'bookingCta.hint': 'Zrušení zdarma · Bez poplatků · Okamžité potvrzení',

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
        'booking.from': 'Od',
        'booking.total': 'Celkem',
        'booking.minNights': 'Minimální pobyt jsou 3 noci',
        'booking.comment': 'Komentář',
        'booking.commentPlaceholder': 'Speciální požadavky nebo poznámky…',
        'booking.stepDates': 'Termín',
        'booking.stepDetails': 'Údaje',
        'booking.stepConfirm': 'Potvrdit',
        'booking.stepDatesTitle': 'Vyberte Termín',
        'booking.stepDetailsTitle': 'Vaše Údaje',
        'booking.stepConfirmTitle': 'Kontrola a Potvrzení',
        'booking.next': 'Pokračovat',
        'booking.back': 'Zpět',
        'booking.sentSubtitle': 'Brzy vás kontaktujeme pro potvrzení rezervace.',

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
        'contact.errorServer': 'Něco se pokazilo. Zkuste to prosím později.',
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
