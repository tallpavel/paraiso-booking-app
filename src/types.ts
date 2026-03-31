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

export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}
