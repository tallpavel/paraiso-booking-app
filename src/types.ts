export interface Amenity {
    readonly icon: string;
    readonly title: string;
    readonly description: string;
}

export interface Review {
    readonly id: number;
    readonly name: string;
    readonly country: string;
    readonly avatar: string;
    readonly rating: number;
    readonly quote: string;
    readonly date: string;
}

export interface GalleryItem {
    readonly id: number;
    readonly src: string;
    readonly alt: string;
    readonly category: 'interior' | 'exterior' | 'pool' | 'beach' | 'terrace';
}

export interface BookingFormData {
    checkIn: string;
    checkOut: string;
    guests: number;
    name: string;
    email: string;
}

export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isPast: boolean;
    isSelected: boolean;
    isInRange: boolean;
}
