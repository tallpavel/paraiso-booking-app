import type { Amenity, Review, GalleryItem } from './types';

export const amenities: readonly Amenity[] = [
    {
        icon: '🌊',
        title: 'Ocean View',
        description: 'Breathtaking panoramic views of the Atlantic from your private terrace.',
    },
    {
        icon: '🏊',
        title: 'Swimming Pool',
        description: 'Relax by the communal pool surrounded by tropical gardens.',
    },
    {
        icon: '📶',
        title: 'Free High-Speed WiFi',
        description: 'Stay connected with reliable fibre-optic WiFi throughout the flat.',
    },
    {
        icon: '🌴',
        title: 'Private Terrace',
        description: 'Your own sun-drenched terrace — perfect for morning coffee or sunset drinks.',
    },
    {
        icon: '❄️',
        title: 'Air Conditioning',
        description: 'Full climate control for your comfort in every room.',
    },
    {
        icon: '🍳',
        title: 'Fully Equipped Kitchen',
        description: 'Modern kitchen with everything you need to cook your favourite meals.',
    },
    {
        icon: '📺',
        title: 'Smart TV',
        description: 'Netflix, YouTube, and streaming apps on a large flat-screen TV.',
    },
    {
        icon: '🅿️',
        title: 'Free Parking',
        description: 'Secure on-site parking space included with your stay.',
    },
] as const;

export const reviews: readonly Review[] = [
    {
        id: 1,
        name: 'Sophie & Martin',
        country: '🇩🇪 Germany',
        avatar: '',
        rating: 5,
        quote: 'Absolutely stunning flat with the most incredible ocean view. Verónica was an amazing host — we felt right at home. Already planning our next visit!',
        date: 'October 2025',
    },
    {
        id: 2,
        name: 'James Richardson',
        country: '🇬🇧 United Kingdom',
        avatar: '',
        rating: 5,
        quote: 'The location is unbeatable. Steps from the beach, gorgeous pool, and the flat is beautifully decorated. Best holiday rental we have ever stayed at.',
        date: 'August 2025',
    },
    {
        id: 3,
        name: 'Émilie Dupont',
        country: '🇫🇷 France',
        avatar: '',
        rating: 5,
        quote: 'Un séjour parfait! The terrace sunset views are magical. The flat has everything you need and more. We will definitely return.',
        date: 'July 2025',
    },
    {
        id: 4,
        name: 'Carlos & Ana',
        country: '🇪🇸 Spain',
        avatar: '',
        rating: 5,
        quote: 'Playa Paraíso es un lugar mágico y este apartamento es su joya. Limpio, moderno y con unas vistas espectaculares. ¡Muy recomendable!',
        date: 'September 2025',
    },
    {
        id: 5,
        name: 'Petra Novák',
        country: '🇨🇿 Czech Republic',
        avatar: '',
        rating: 5,
        quote: 'Wonderful apartment, exactly as described. The pool area is beautiful and the beach is just a short walk away. Perfect for families!',
        date: 'June 2025',
    },
    {
        id: 6,
        name: 'Lars & Ingrid',
        country: '🇳🇴 Norway',
        avatar: '',
        rating: 5,
        quote: 'Escaped the Nordic winter to paradise! The flat is spotless, modern, and the sunsets from the terrace are unforgettable. Highly recommend.',
        date: 'January 2026',
    },
] as const;

export const galleryItems: readonly GalleryItem[] = [
    { id: 1, src: '/gallery/living-room.jpg', alt: 'Bright modern living room with ocean view', category: 'interior' },
    { id: 2, src: '/gallery/bedroom.jpg', alt: 'Spacious bedroom with king-size bed', category: 'interior' },
    { id: 3, src: '/gallery/kitchen.jpg', alt: 'Fully equipped modern kitchen', category: 'interior' },
    { id: 4, src: '/gallery/terrace.jpg', alt: 'Private terrace with panoramic ocean view', category: 'terrace' },
    { id: 5, src: '/gallery/pool.jpg', alt: 'Communal swimming pool with tropical gardens', category: 'pool' },
    { id: 6, src: '/gallery/beach.jpg', alt: 'Playa Paraíso beach at sunset', category: 'beach' },
    { id: 7, src: '/gallery/bathroom.jpg', alt: 'Modern bathroom with walk-in shower', category: 'interior' },
    { id: 8, src: '/gallery/sunset.jpg', alt: 'Spectacular sunset from the terrace', category: 'exterior' },
] as const;

export const PROPERTY_ADDRESS = 'Avenida Adeje 300, č. 16, 38678 Playa Paraíso, Tenerife, Spain';

export const NAV_LINKS = [
    { label: 'Amenities', href: '#amenities' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Book Now', href: '#booking' },
    { label: 'Contact', href: '#contact' },
] as const;
