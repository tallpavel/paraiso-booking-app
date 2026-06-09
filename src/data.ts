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
        title: 'Public Parking',
        description: 'Free public street parking is available near the building.',
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
    { id: 1, src: '/gallery/Interior1-livingroom.jpg', alt: 'Bright modern living room with ocean view', category: 'interior' },
    { id: 2, src: '/gallery/Interior2-livingroom.jpg', alt: 'Cozy living room seating area', category: 'interior' },
    { id: 3, src: '/gallery/Interior3-livingroom.jpg', alt: 'Living room interior details', category: 'interior' },
    { id: 14, src: '/gallery/Interior4-kitchen.jpg', alt: 'Fully equipped modern kitchen', category: 'interior' },
    { id: 15, src: '/gallery/Interior5-bathroom.jpg', alt: 'Modern bathroom with walk-in shower', category: 'interior' },
    { id: 16, src: '/gallery/Interior6-bathroom.jpg', alt: 'Bathroom sink and mirror', category: 'interior' },
    { id: 17, src: '/gallery/Interior7-bedroom.jpg', alt: 'Spacious bedroom with king-size bed', category: 'interior' },
    { id: 18, src: '/gallery/Interior8-bedroom.jpg', alt: 'Bedroom interior details', category: 'interior' },
    { id: 19, src: '/gallery/Interior9-gift.jpg', alt: 'Welcome gift for guests', category: 'interior' },
    { id: 20, src: '/gallery/Interior10-bathroomdeco.jpg', alt: 'Bathroom decor details', category: 'interior' },
    { id: 21, src: '/gallery/Interior11-waterfree.jpg', alt: 'Complimentary water', category: 'interior' },
    { id: 22, src: '/gallery/Interior12-towels.jpg', alt: 'Fresh towels provided', category: 'interior' },
    { id: 4, src: '/gallery/Terace1.jpg', alt: 'Private terrace with panoramic ocean view', category: 'terrace' },
    { id: 9, src: '/gallery/Terace2.jpg', alt: 'Private terrace seating area', category: 'terrace' },
    { id: 10, src: '/gallery/Terace3.jpg', alt: 'Private terrace dining area', category: 'terrace' },
    { id: 11, src: '/gallery/Terace4.jpg', alt: 'Private terrace view', category: 'terrace' },
    { id: 5, src: '/gallery/Pool1.jpg', alt: 'Communal swimming pool area', category: 'pool' },
    { id: 12, src: '/gallery/Pool2.jpg', alt: 'Communal swimming pool with tropical gardens', category: 'pool' },
    { id: 13, src: '/gallery/Pool3.jpg', alt: 'Communal swimming pool overview', category: 'pool' },
    { id: 6, src: '/discover/PlayaLasGalgasReal.jpeg', alt: 'Playa Paraíso beach at sunset', category: 'beach' },

    { id: 8, src: '/gallery/Surroundings1.jpg', alt: 'Beautiful surroundings of Playa Paraíso', category: 'exterior' },
    { id: 23, src: '/gallery/Surroundings2.jpg', alt: 'Spectacular local scenery', category: 'exterior' },
] as const;

export const PROPERTY_ADDRESS = 'Avenida Adeje 300, č. 16, 38678 Playa Paraíso, Tenerife, Spain';

export const NAV_LINKS = [
    { label: 'Amenities', href: '#amenities' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Book Now', href: '#booking' },
    { label: 'Contact', href: '#contact' },
] as const;
