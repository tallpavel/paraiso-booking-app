import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useI18n } from '../i18n';
import { getOptimizedImageUrl } from '../utils/image';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const FLAT_COORDS: [number, number] = [28.12220241081338, -16.77592957957124];

interface NearbyPoint {
    name: string;
    description?: string;
    linkUrl?: string;
    linkTextKey?: string;
    lat: number;
    lng: number;
}

interface NearbyPlace {
    id: string;
    titleKey: string;
    emoji: string;
    zoom?: number;
    walkTimeKey: string;
    points: NearbyPoint[];
}

const NEARBY_PLACES: NearbyPlace[] = [
    {
        id: 'pool',
        titleKey: 'map.pool',
        emoji: '🏊',
        zoom: 19,
        walkTimeKey: 'map.walkPool',
        points: [{ name: 'Community Pool', description: 'In the complex', lat: 28.121828278202468, lng: -16.776358462989503 }]
    },
    {
        id: 'beach-galgas',
        titleKey: 'Playa Las Galgas',
        emoji: '🏖️',
        zoom: 17,
        walkTimeKey: 'map.walkBeachGalgas',
        points: [{ name: 'Playa Las Galgas', linkTextKey: 'map.discoverBeach', linkUrl: '/discover/beaches#section-0', lat: 28.12186663107742, lng: -16.77819468138301 }]
    },
    {
        id: 'beach-ajabo',
        titleKey: 'Playa de Ajabo',
        emoji: '🌊',
        zoom: 17,
        walkTimeKey: 'map.walkBeachAjabo',
        points: [{ name: 'Playa de Ajabo', linkTextKey: 'map.discoverBeach', linkUrl: '/discover/beaches#section-1', lat: 28.127530502130437, lng: -16.782543495179922 }]
    },
    {
        id: 'restaurants',
        titleKey: 'map.restaurants',
        emoji: '🍽️',
        walkTimeKey: 'map.walkRestaurants',
        points: [
            { name: 'Francis II', description: 'European cuisine', lat: 28.121571665655395, lng: -16.775953901265066 },
            { name: 'Mumbai Masala', description: 'Indian food', lat: 28.1217497277246, lng: -16.775725707607265 },
            { name: 'Cafe Paraiso', description: 'Coffee & snacks', lat: 28.121739168439056, lng: -16.775499936995143 },
            { name: 'Pizzeria', description: 'Italian pizza', lat: 28.12225204682833, lng: -16.773596280175415 },
            { name: 'Burger Pizza', description: 'Casual dining', lat: 28.1218040326065, lng: -16.775183516038005 },
            { name: 'DownTown Sushi', description: 'Japanese sushi', lat: 28.118208377243597, lng: -16.77665757465786 }
        ]
    },
    {
        id: 'supermarket',
        titleKey: 'map.supermarket',
        emoji: '🛒',
        zoom: 18,
        walkTimeKey: 'map.walkSupermarket',
        points: [{ name: 'HiperDino Express', description: 'Quality regional supermarket', lat: 28.121624053354303, lng: -16.77577570156476 }]
    },
    {
        id: 'pharmacy',
        titleKey: 'map.pharmacy',
        emoji: '💊',
        zoom: 18,
        walkTimeKey: 'map.walkPharmacy',
        points: [{ name: 'Pharmacy', description: 'Local pharmacy', lat: 28.122698757884592, lng: -16.773615177755865 }]
    },
    {
        id: 'medical',
        titleKey: 'map.medical',
        emoji: '🏥',
        zoom: 17,
        walkTimeKey: 'map.walkMedical',
        points: [{ name: 'Family Doctors Medical Center', description: 'English-speaking medical clinic', lat: 28.126026265222226, lng: -16.774176133988554 }]
    },
    {
        id: 'shopping',
        titleKey: 'map.shopping',
        emoji: '🛍️',
        zoom: 17,
        walkTimeKey: 'map.walkShopping',
        points: [{ name: 'C.C. Rosa Center', description: 'Shopping center with shops & services', lat: 28.126043754039575, lng: -16.77400420415362 }]
    },
    {
        id: 'airport',
        titleKey: 'map.airport',
        emoji: '✈️',
        zoom: 13,
        walkTimeKey: 'map.walkAirport',
        points: [{ name: 'Tenerife South Airport', description: 'TFS — 20 min drive', lat: 28.04695626053044, lng: -16.572508866970395 }]
    },
];

export default function LocationMap() {
    const { t } = useI18n();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markersRef = useRef<{ [key: string]: L.Marker | L.FeatureGroup }>({});
    const currentLayerRef = useRef<L.Layer | null>(null);
    const [activeId, setActiveId] = useState<string>('flat');

    useEffect(() => {
        if (!mapRef.current) return;

        const DefaultIcon = L.icon({
            iconUrl: markerIcon,
            shadowUrl: markerShadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });
        L.Marker.prototype.options.icon = DefaultIcon;

        const map = L.map(mapRef.current, {
            zoomControl: false,
            scrollWheelZoom: false,
            trackResize: true,
        }).setView(FLAT_COORDS, 16);

        mapInstance.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Logo marker with pulse ring
        const mainIcon = L.divIcon({
            className: 'custom-main-icon',
            html: `
                <div class="location-logo-pin">
                    <div class="location-logo-pulse"></div>
                    <div class="location-logo-img">
                        <img src="${getOptimizedImageUrl('/logo.png', 100)}" alt="Verónica's Flat" />
                    </div>
                </div>`,
            iconSize: [56, 56],
            iconAnchor: [28, 28],
        });

        const flatMarker = L.marker(FLAT_COORDS, { icon: mainIcon }).addTo(map);
        markersRef.current['flat'] = flatMarker;

        // Category marker icon — emoji circle
        const createCategoryIcon = (emoji: string) => L.divIcon({
            className: 'custom-category-icon',
            html: `<div class="location-category-pin"><span>${emoji}</span></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -24],
        });

        NEARBY_PLACES.forEach(place => {
            const group = L.featureGroup();
            place.points.forEach(point => {
                const icon = createCategoryIcon(place.emoji);
                L.marker([point.lat, point.lng], { icon })
                    .addTo(group)
                    .bindPopup(`
                        <div class="location-popup">
                            <strong>${point.name}</strong>
                            ${
                                point.linkUrl 
                                    ? `<a href="${point.linkUrl}" class="location-popup-link">${t(point.linkTextKey as any) || 'Discover'} &rarr;</a>` 
                                    : `<span>${point.description}</span>`
                            }
                        </div>
                    `);
            });
            markersRef.current[place.id] = group;
        });

        setTimeout(() => map.invalidateSize(), 100);

        return () => { map.remove(); };
    }, [t]);

    const handlePlaceClick = useCallback((category: NearbyPlace | 'flat') => {
        if (!mapInstance.current) return;

        if (currentLayerRef.current) {
            mapInstance.current.removeLayer(currentLayerRef.current);
            currentLayerRef.current = null;
        }

        if (category === 'flat') {
            setActiveId('flat');
            mapInstance.current.flyTo(FLAT_COORDS, 17, { duration: 1.5 });
        } else {
            setActiveId(category.id);
            const group = markersRef.current[category.id];

            if (group instanceof L.FeatureGroup) {
                group.addTo(mapInstance.current);
                currentLayerRef.current = group;

                if (category.points.length === 1) {
                    mapInstance.current.flyTo(
                        [category.points[0].lat, category.points[0].lng],
                        category.zoom || 17,
                        { duration: 1.5 }
                    );
                    setTimeout(() => {
                        const layers = group.getLayers();
                        if (layers.length > 0) (layers[0] as L.Marker).openPopup();
                    }, 800);
                } else {
                    mapInstance.current.flyToBounds(group.getBounds(), {
                        padding: [50, 50],
                        duration: 1.5,
                        maxZoom: 17,
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const focusId = urlParams.get('focusMap');
        if (focusId && mapInstance.current) {
            const timer = setTimeout(() => {
                const place = NEARBY_PLACES.find(p => p.id === focusId);
                if (place) {
                    handlePlaceClick(place);
                }
            }, 600); // Give the standard map zoom a chance to finish first
            return () => clearTimeout(timer);
        }
    }, [handlePlaceClick]);

    return (
        <section id="location" className="location-section">
            <div className="mx-auto max-w-7xl px-6">
                {/* ── Editorial Header ─────────────────────────────────── */}
                <div className="location-header">
                    <span className="location-label">{t('map.label')}</span>
                    <h2 className="location-title">{t('map.title')}</h2>
                    <p className="location-subtitle">{t('map.subtitle')}</p>
                </div>

                {/* ── Map + Sidebar Grid ───────────────────────────────── */}
                <div className="location-grid">
                    {/* Map Container */}
                    <div className="location-map-wrap">
                        <div ref={mapRef} className="location-map" />
                        <div className="location-map-vignette" />
                    </div>

                    {/* Sidebar */}
                    <div className="location-sidebar">
                        <div className="location-sidebar-header">
                            <h3 className="location-sidebar-title">
                                {t('map.nearby')}
                            </h3>
                            <p className="location-sidebar-hint">
                                {t('map.hint' as any)}
                            </p>
                        </div>

                        {/* Home tile */}
                        <button
                            onClick={() => handlePlaceClick('flat')}
                            className={`location-tile ${activeId === 'flat' ? 'location-tile--active' : ''}`}
                        >
                            <div className="location-tile__icon">
                                <img
                                    src={getOptimizedImageUrl('/logo.png', 100)}
                                    alt="Verónica's Flat"
                                    className="location-tile__logo"
                                />
                            </div>
                            <div className="location-tile__body">
                                <p className="location-tile__name">Verónica's Flat</p>
                                <p className="location-tile__meta">{t('map.yourHome' as any)}</p>
                            </div>
                            <svg className="location-tile__chevron" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                        </button>

                        {/* Category tiles */}
                        {NEARBY_PLACES.map((cat) => (
                            <button
                                key={cat.id}
                                data-cat={cat.id}
                                onClick={() => handlePlaceClick(cat)}
                                className={`location-tile ${activeId === cat.id ? 'location-tile--active' : ''}`}
                            >
                                <div className="location-tile__icon">
                                    <span className="location-tile__emoji">{cat.emoji}</span>
                                </div>
                                <div className="location-tile__body">
                                    <p className="location-tile__name">
                                        {t(cat.titleKey as any) || cat.titleKey}
                                    </p>
                                    <p className="location-tile__meta">
                                        {t(cat.walkTimeKey as any)}
                                    </p>
                                </div>
                                <span className="location-tile__cta">
                                    {activeId === cat.id ? '📍' : t('map.explore' as any)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
