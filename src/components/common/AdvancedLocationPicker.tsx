import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Crosshair, MapPin, Loader2, Navigation } from 'lucide-react';

// Token from .env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface AdvancedLocationPickerProps {
    onLocationSelect: (location: { address: string; coordinates: [number, number]; city: string; district: string }) => void;
    initialCoordinates?: [number, number]; // [lng, lat]
}

const AdvancedLocationPicker: React.FC<AdvancedLocationPickerProps> = ({ onLocationSelect, initialCoordinates }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [currentAddress, setCurrentAddress] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);

    // Default: Sri Lanka Center
    const defaultCenter: [number, number] = [80.7718, 7.8731];

    useEffect(() => {
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v12', // Light theme fits "Linen White" well
            center: initialCoordinates && initialCoordinates[0] !== 0 ? initialCoordinates : defaultCenter,
            zoom: initialCoordinates && initialCoordinates[0] !== 0 ? 14 : 7,
            projection: { name: 'globe' }
        });

        // Add Geocoder (Search Bar)
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken!,
            mapboxgl: mapboxgl as any,
            marker: false,
            placeholder: 'Search for your farm or location...',
            countries: 'lk',
        });

        map.current.addControl(geocoder, 'top-left');
        
        // Add Navigation Controls (Zoom buttons)
        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

        // Custom Marker with Brand Color (Saffron #FFB000)
        marker.current = new mapboxgl.Marker({
            draggable: true,
            color: '#FFB000', // Changed to Secondary Color
            scale: 1.2
        })
            .setLngLat(initialCoordinates && initialCoordinates[0] !== 0 ? initialCoordinates : defaultCenter)
            .addTo(map.current);

        // --- Events ---
        
        map.current.on('load', () => setMapLoaded(true));

        geocoder.on('result', (e) => {
            const coords = e.result.center;
            updateMarkerAndAddress(coords as [number, number]);
        });

        marker.current.on('dragend', () => {
            const lngLat = marker.current!.getLngLat();
            updateMarkerAndAddress([lngLat.lng, lngLat.lat]);
        });

        map.current.on('click', (e) => {
            updateMarkerAndAddress([e.lngLat.lng, e.lngLat.lat]);
        });

    }, [initialCoordinates]);

    const updateMarkerAndAddress = async (coords: [number, number], isGPS = false) => {
        if (!marker.current || !map.current) return;

        // Move Marker & Fly to location
        marker.current.setLngLat(coords);
        map.current.flyTo({ center: coords, zoom: 16, essential: true });

        // Immediate feedback for GPS
        if (isGPS) {
            setCurrentAddress("Fetching exact address...");
            onLocationSelect({
                address: "Pinned Location (Loading...)",
                coordinates: coords,
                city: "",
                district: ""
            });
        }

        let fullAddress = "Pinned Location";
        let city = "";
        let district = "";

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                fullAddress = feature.place_name || fullAddress;

                if (feature.context) {
                    feature.context.forEach((ctx: any) => {
                        if (ctx.id.startsWith('place') || ctx.id.startsWith('locality')) city = ctx.text;
                        if (ctx.id.startsWith('district')) district = ctx.text;
                        else if (!district && ctx.id.startsWith('region')) district = ctx.text;
                    });
                }
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        }

        setCurrentAddress(fullAddress);
        onLocationSelect({
            address: fullAddress,
            coordinates: coords,
            city: city || "Unknown City",
            district: district || "Unknown District"
        });
    };

    const handleLocateMe = () => {
        setLoadingLocation(true);
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            setLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
                updateMarkerAndAddress(coords, true);
                setLoadingLocation(false);
            },
            (err) => {
                console.error(err);
                alert("Unable to retrieve location. Please allow location access.");
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="space-y-4 font-sans">
            
            {/* Map Wrapper with Premium Styling */}
            <div className="relative w-full h-[450px] rounded-[32px] overflow-hidden border border-gray-200 shadow-xl group">
                
                {/* Map Container */}
                <div ref={mapContainer} className="w-full h-full" />

                {/* Loading Overlay (Initial Load) */}
                {!mapLoaded && (
                    <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-20">
                         <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                            <p className="text-sm text-gray-400 font-medium">Loading Map...</p>
                         </div>
                    </div>
                )}

                {/* "Locate Me" Button - Styled as a floating action button */}
                <button
                    type="button"
                    onClick={handleLocateMe}
                    className="absolute top-24 left-3 bg-white text-gray-700 p-2.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-primary hover:text-white transition-all duration-300 z-10 border border-gray-100 flex items-center gap-2 group/btn"
                    title="Use My Current Location"
                >
                    {loadingLocation ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Crosshair className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                    )}
                    {/* Only show text on larger screens or hover if needed, keeping it icon-only for cleanness is often better, 
                        but let's keep it icon-only to match mapbox controls style */}
                </button>

                {/* Decorative bottom gradient for depth */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
            </div>

            {/* Address Feedback Bar */}
            <div className={`
                flex items-start gap-3 p-4 rounded-2xl border transition-all duration-500
                ${currentAddress ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 border-gray-100'}
            `}>
                <div className={`
                    p-2 rounded-full flex-shrink-0 mt-0.5
                    ${currentAddress ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-400'}
                `}>
                    <MapPin size={20} />
                </div>
                
                <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Selected Location
                    </p>
                    <p className={`text-sm font-medium leading-relaxed ${currentAddress ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                        {currentAddress || "Click on the map or use the search bar to pin your exact location."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedLocationPicker;