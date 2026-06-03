import axios from 'axios';

export const geocodeAddress = async (address) => {
    try {

        const token = process.env.MAPBOX_ACCESS_TOKEN;
        
        if (!token) {
            console.error("Mapbox Token is missing in .env file");
            return null;
        }

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`;
        
        const response = await axios.get(url);
        
        if (response.data.features && response.data.features.length > 0) {
            const [lng, lat] = response.data.features[0].center;
            return { lat, lng };
        }
        return null;
    } catch (error) {
        console.error("Mapbox Geocoding Error:", error.message);
        return null;
    }
};

export const calculateDistance = async (origin, destination) => {
    if (!origin || !destination) return 0;
    
    const R = 6371;
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLon = (destination.lng - origin.lng) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 1.2);
};