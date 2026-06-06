import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, Clock } from 'lucide-react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface SmartRouteMapProps {
  origin: [number, number];      // [lng, lat]
  destination: [number, number]; // [lng, lat]
}

const SmartRouteMap: React.FC<SmartRouteMapProps> = ({ origin, destination }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/traffic-day-v2', // 🔥 Traffic Layer Enabled!
      center: origin,
      zoom: 10,
    });

    map.current.on('load', async () => {
      if (!map.current) return;

      // 1. Add Markers
      new mapboxgl.Marker({ color: '#3B82F6' }).setLngLat(origin).setPopup(new mapboxgl.Popup().setText("Pickup Location")).addTo(map.current);
      new mapboxgl.Marker({ color: '#16A34A' }).setLngLat(destination).setPopup(new mapboxgl.Popup().setText("Farm Destination")).addTo(map.current);

      // 2. Fetch Directions (Driving with Traffic)
      await fetchRoute(origin, destination);
    });

  }, [origin, destination]);

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const json = await query.json();
      const data = json.routes[0];
      
      // Update UI Stats
      setDuration(Math.round(data.duration / 60) + ' min');
      setDistance((data.distance / 1000).toFixed(1) + ' km');

      const routeGeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: data.geometry
      };

      // 3. Draw Route Line
      if (map.current?.getSource('route')) {
        (map.current.getSource('route') as any).setData(routeGeoJSON);
      } else {
        map.current?.addLayer({
          id: 'route',
          type: 'line',
          source: { type: 'geojson', data: routeGeoJSON as any },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#4F46E5', 'line-width': 6, 'line-opacity': 0.8 }
        });
      }

      // 4. Fit Bounds (Zoom to show full route)
      const bounds = new mapboxgl.LngLatBounds(start, start);
      data.geometry.coordinates.forEach((coord: any) => bounds.extend(coord));
      map.current?.fitBounds(bounds, { padding: 80 });

    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border shadow-sm group">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Route Info Overlay */}
      {duration && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg flex items-center space-x-4 border border-gray-200">
              <div className="flex items-center text-blue-700 font-bold">
                  <Navigation size={16} className="mr-1"/> {distance}
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center text-amber-700 font-bold">
                  <Clock size={16} className="mr-1"/> {duration}
              </div>
          </div>
      )}
    </div>
  );
};

export default SmartRouteMap;