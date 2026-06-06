import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Clock, MapPin, DollarSign, ArrowRight, CheckCircle,
  Car, CloudSun, Sparkles, Navigation, Loader2,
  Ticket, UserCheck, Receipt, X, Leaf
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

/* ── Mapbox token ── */
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

/* ── types (unchanged) ── */
interface Activity {
  title: string;
  location: string;
  coords?: [number, number];
  time?: string;
  image?: string;
  travel_time_from_prev?: string;
}
interface Stay {
  name: string;
  location: string;
  price: number;
}
interface DayPlan {
  date: string;
  activities: Activity[];
  stay?: Stay;
}
interface LocationState {
  itinerary: DayPlan[];
  totalPrice: number;
  efficiency_score?: string;
  breakdown?: {
    transport: number;
    guide: number;
    distance_km: number;
    activities: number;
    stays: number;
    participantCount: number;
  };
  needTransport?: boolean;
  needGuide?: boolean;
  pickupLocation?: any;
}

/* ═════════════════════════════════════════════
   TRIP RESULT
   ═════════════════════════════════════════════ */
const TripResult = () => {
  const location      = useLocation();
  const navigate      = useNavigate();
  const mapContainer  = useRef<HTMLDivElement | null>(null);
  const map           = useRef<mapboxgl.Map | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const state = location.state as LocationState | null;
  const {
    itinerary, totalPrice, efficiency_score,
    breakdown, needTransport, needGuide, pickupLocation
  } = state || { itinerary: [], totalPrice: 0, efficiency_score: undefined };

  const transportCost  = breakdown?.transport || 0;
  const guideCost      = breakdown?.guide || 0;
  const activitiesCost = totalPrice - transportCost - guideCost;

  /* ── modal + booking state ── */
  const [showBookingModal, setShowBookingModal]   = useState(false);
  const [showPaymentModal, setShowPaymentModal]   = useState(false);
  const [contactDetails, setContactDetails]       = useState({ name: '', phone: '' });
  const [paymentId, setPaymentId]                 = useState('');

  /* ── redirect guard (unchanged) ── */
  useEffect(() => {
    if (!itinerary || itinerary.length === 0) navigate('/generate-trip');
  }, [itinerary, navigate]);

  /* ── Mapbox init (unchanged logic) ── */
  useEffect(() => {
    if (!itinerary.length || !mapContainer.current) return;
    if (map.current) return;

    const startCoords = itinerary[0]?.activities[0]?.coords || [80.7718, 7.8731];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [startCoords[0], startCoords[1]],
      zoom: 8,
      projection: { name: 'globe' }
    });

    const mapInstance = map.current;
    const routeCoords: [number, number][] = [];

    mapInstance.on('load', () => {
      mapInstance.setFog({
        'range': [0.5, 10],
        'color': '#ffffff',
        'horizon-blend': 0.1
      });

      itinerary.forEach((day, dayIndex) => {
        day.activities.forEach((act) => {
          if (act.coords) {
            const el = document.createElement('div');
            el.className = 'marker-day';
            el.innerHTML = `
              <div style="width:2.25rem;height:2.25rem;background:#2D6A4F;border-radius:0.75rem;
                          display:flex;align-items:center;justify-content:center;
                          color:#fff;font-weight:700;border:2.5px solid #fff;
                          box-shadow:0 4px 12px rgba(45,106,79,0.35);font-size:0.8rem;
                          font-family:'Plus Jakarta Sans',sans-serif;">
                ${dayIndex + 1}
              </div>`;

            new mapboxgl.Marker(el)
              .setLngLat(act.coords)
              .setPopup(
                new mapboxgl.Popup({ offset: 28, closeButton: false }).setHTML(`
                  <div style="padding:0.75rem 1rem;border-radius:0.5rem;font-family:'Plus Jakarta Sans',sans-serif;">
                    <h3 style="font-weight:700;color:#1e293b;font-size:0.8rem;margin:0 0 0.25rem;">${act.title}</h3>
                    <p style="color:#94a3b8;font-size:0.7rem;margin:0;">${act.location}</p>
                  </div>`)
              )
              .addTo(mapInstance);
            routeCoords.push(act.coords);
          }
        });
      });

      if (routeCoords.length > 1) {
        mapInstance.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: routeCoords }
          }
        });
        mapInstance.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#2D6A4F', 'line-width': 3.5, 'line-dasharray': [2.5, 1.5] }
        });

        const bounds = new mapboxgl.LngLatBounds(routeCoords[0], routeCoords[0]);
        for (const coord of routeCoords) bounds.extend(coord);
        mapInstance.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 60, right: 60 } });
      }
    });
  }, [itinerary]);

  /* ── booking handlers (unchanged logic) ── */
  const handleBookAll = () => setShowBookingModal(true);

  const confirmBookingData = async () => {
    if (!contactDetails.name || !contactDetails.phone) return alert('Please provide contact details.');
    setBookingLoading(true);
    try {
      const response = await api.post('/bookings/expedition', {
        itinerary, totalPrice,
        contactName: contactDetails.name,
        contactPhone: contactDetails.phone,
        participantCount: breakdown?.participantCount || 1,
        needTransport, needGuide, pickupLocation,
        guideCost: breakdown?.guide || 0,
        transportCost: breakdown?.transport || 0
      });
      if (response.data.success) {
        const paymentRes = await api.post('/payments/create-intent', { bookingIds: response.data.bookingIds });
        if (paymentRes.data.success) {
          setPaymentId(paymentRes.data.paymentId);
          setShowBookingModal(false);
          setShowPaymentModal(true);
        }
      }
    } catch (error: any) {
      console.error('Booking Error', error);
      alert(error.response?.data?.message || 'Failed to book.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleMockPayment = async () => {
    try {
      const res = await api.post('/payments/confirm', { paymentIntentId: paymentId });
      if (res.data.success) {
        alert('Payment Successful! Your journey is confirmed.');
        navigate('/profile');
      }
    } catch {
      alert('Payment failed.');
    }
  };

  /* ── shared input class (matches Login/Register) ── */
  const inputCls = `w-full px-4 py-3 bg-slate-50 border border-slate-200
                    rounded-xl text-sm font-medium text-slate-700
                    placeholder-slate-300
                    focus:outline-none focus:bg-white
                    focus:ring-2 focus:ring-primary/20 focus:border-primary
                    transition-all duration-300`;

  /* ── render ── */
  return (
    <div className="flex flex-col h-screen bg-bg-white font-sans overflow-hidden">

      {/* ╔══════════════════════════════════════════
          ║  TOP HEADER BAR
          ╚══════════════════════════════════════════ */}
      <header className="flex-shrink-0 bg-white/90 backdrop-blur-xl
                         border-b border-slate-200/60 shadow-sm
                         px-4 sm:px-6 py-3 z-30
                         flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* icon */}
          <div className="w-10 h-10 bg-primary/8 border border-primary/15 rounded-xl
                          flex items-center justify-center">
            <Navigation size={20} className="text-primary" />
          </div>
          {/* title block */}
          <div className="flex flex-col leading-none">
            <h1 className="text-base font-serif font-bold text-slate-800 tracking-[-0.01em]">
              Your Expedition
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400 font-medium">
                {itinerary.length} {itinerary.length === 1 ? 'Day' : 'Days'}
                · {breakdown?.participantCount || 1} {(breakdown?.participantCount || 1) === 1 ? 'Traveller' : 'Travellers'}
              </span>
              {efficiency_score && (
                <span className="inline-flex items-center gap-1 bg-subtle-accent/12 border border-subtle-accent/20
                                 text-subtle-accent text-[9px] font-bold uppercase tracking-wider
                                 px-2 py-0.5 rounded-full">
                  <Sparkles size={9} /> {efficiency_score} Efficient
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* total cost — hidden on very small screens */}
          <div className="hidden sm:flex flex-col items-end leading-none">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Est. Cost</span>
            <span className="text-xl font-serif font-bold text-secondary tabular-nums mt-0.5">
              LKR {totalPrice.toLocaleString()}
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={handleBookAll}
            className="group inline-flex items-center justify-center gap-2
                       bg-primary text-white text-sm font-bold
                       px-5 py-2.5 rounded-xl
                       shadow-md shadow-primary/30
                       hover:shadow-lg hover:shadow-primary/40
                       hover:-translate-y-0.5
                       transition-all duration-300"
          >
            {bookingLoading
              ? <Loader2 size={16} className="animate-spin" />
              : <CheckCircle size={16} />
            }
            Confirm & Pay
          </button>
        </div>
      </header>

      {/* ╔══════════════════════════════════════════
          ║  MAIN SPLIT
          ╚══════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: itinerary panel ── */}
        <div className="w-full md:w-[440px] lg:w-[480px] flex-shrink-0
                        bg-white border-r border-slate-200
                        overflow-y-auto z-20 flex flex-col">

          {/* cost breakdown card */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex-shrink-0">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">

              {/* header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <div className="w-7 h-7 bg-primary/8 rounded-lg flex items-center justify-center">
                  <Receipt size={14} className="text-primary" />
                </div>
                <span className="text-sm font-serif font-bold text-slate-800">Cost Analysis</span>
              </div>

              {/* line items */}
              <div className="flex flex-col gap-3.5">

                {/* activities */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Ticket size={13} className="text-secondary" />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-xs font-semibold text-slate-700">Activities & Fees</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {breakdown?.activities || 0} Experiences
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-800 tabular-nums">
                    LKR {activitiesCost.toLocaleString()}
                  </span>
                </div>

                {/* guide — conditional */}
                {guideCost > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-subtle-accent/12 rounded-lg flex items-center justify-center">
                        <UserCheck size={13} className="text-subtle-accent" />
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="text-xs font-semibold text-slate-700">Professional Guide</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">
                          {itinerary.length}-day service
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800 tabular-nums">
                      LKR {guideCost.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* transport — conditional */}
                {transportCost > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Car size={13} className="text-primary" />
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="text-xs font-semibold text-slate-700">Private Transport</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">
                          AC Vehicle · ~{breakdown?.distance_km} km
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800 tabular-nums">
                      LKR {transportCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* total */}
              <div className="border-t border-slate-200 pt-3.5 mt-4 flex items-end justify-between">
                <span className="text-xs font-semibold text-slate-400">Estimated Total</span>
                <div className="flex flex-col items-end leading-none">
                  <span className="text-xl font-serif font-bold text-primary tabular-nums">
                    LKR {totalPrice.toLocaleString()}
                  </span>
                  <span className="text-[8px] text-slate-400 mt-0.5">
                    *Subject to provider availability
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* timeline */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col gap-8 pb-24">
            {itinerary.map((day, idx) => (
              <div key={idx} className="relative pl-7">

                {/* vertical line */}
                <div className="absolute left-3 top-9 bottom-0 w-0.5 bg-slate-100" />

                {/* day node */}
                <div className="absolute left-0 top-0 w-6 h-6 rounded-lg bg-primary
                                flex items-center justify-center shadow-md shadow-primary/25 z-10">
                  <span className="text-[10px] font-bold text-white">{idx + 1}</span>
                </div>

                {/* day header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-serif font-bold text-slate-800">
                      Day {idx + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">— {day.date}</span>
                  </div>
                  <CloudSun size={15} className="text-secondary/60" />
                </div>

                {/* activity cards */}
                <div className="flex flex-col gap-3">
                  {day.activities.map((act, aIdx) => (
                    <motion.div
                      key={aIdx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 + aIdx * 0.04, duration: 0.35 }}
                    >
                      {/* travel connector */}
                      {act.travel_time_from_prev && (
                        <div className="flex items-center gap-1.5 px-2 py-1 mb-1.5">
                          <Car size={10} className="text-slate-300" />
                          <div className="flex-1 h-px bg-slate-200 border-dashed" />
                          <span className="text-[9px] font-semibold text-slate-400 bg-slate-50
                                           border border-slate-200 px-2 py-0.5 rounded-full">
                            +{act.travel_time_from_prev} drive
                          </span>
                          <div className="flex-1 h-px bg-slate-200 border-dashed" />
                        </div>
                      )}

                      {/* card */}
                      <div className="group bg-white rounded-2xl border border-slate-100
                                      shadow-sm hover:shadow-md hover:border-primary/20
                                      transition-all duration-300 overflow-hidden">
                        <div className="flex gap-3 p-3">
                          {/* thumbnail */}
                          <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                            {act.image && (
                              <img
                                src={act.image}
                                alt={act.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* text */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              {/* time badge */}
                              <span className={`inline-block text-[9px] font-bold uppercase tracking-wider
                                               px-2 py-0.5 rounded-md mb-1
                                               ${act.time === 'Morning'
                                                 ? 'bg-secondary/10 text-secondary'
                                                 : 'bg-primary/8 text-primary'
                                               }`}>
                                {act.time}
                              </span>
                              <h4 className="text-xs font-bold text-slate-800 truncate
                                             group-hover:text-primary transition-colors duration-200">
                                {act.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium mt-1">
                              <MapPin size={9} className="text-primary/40" />
                              <span className="truncate">{act.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: map ── */}
        <div className="hidden md:flex flex-1 relative bg-slate-100">
          <div ref={mapContainer} className="w-full h-full" />

          {/* AI optimisation overlay — glassmorphism matching Home stats bar */}
          <div className="absolute bottom-6 left-6 z-10
                          bg-white/80 backdrop-blur-xl border border-white/60
                          shadow-lg shadow-black/8 rounded-2xl
                          px-4 py-3.5 max-w-[260px]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={13} className="text-secondary fill-secondary" />
              <span className="text-xs font-bold text-slate-700">AI Route Optimisation</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              This route minimises travel time by{' '}
              {Math.round((1 - parseInt(efficiency_score || '80') / 100) * 10)}% compared to standard tours.
            </p>
          </div>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════
          ║  BOOKING MODAL
          ╚══════════════════════════════════════════ */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
                        flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100
                          shadow-2xl shadow-black/10
                          px-6 py-7 sm:px-8 sm:py-8
                          w-full max-w-md animate-fade-in">

            {/* header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-800 tracking-[-0.01em]">
                  Finalize Booking
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  A few details to secure your spot.
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50
                           rounded-lg transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* fields */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Full Name
                </label>
                <input
                  className={inputCls}
                  placeholder="John Doe"
                  value={contactDetails.name}
                  onChange={e => setContactDetails({ ...contactDetails, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Phone Number
                </label>
                <input
                  className={inputCls}
                  placeholder="+94 7X XXX XXXX"
                  value={contactDetails.phone}
                  onChange={e => setContactDetails({ ...contactDetails, phone: e.target.value })}
                />
              </div>
            </div>

            {/* actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-2.5 text-sm font-bold text-slate-400
                           hover:text-slate-600 hover:bg-slate-50
                           rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmBookingData}
                disabled={bookingLoading}
                className="flex-1 inline-flex items-center justify-center gap-2
                           bg-primary text-white text-sm font-bold
                           py-2.5 rounded-xl
                           shadow-md shadow-primary/30
                           hover:shadow-lg hover:shadow-primary/40
                           hover:-translate-y-0.5
                           disabled:opacity-60 disabled:cursor-not-allowed
                           disabled:hover:translate-y-0 disabled:hover:shadow-md
                           transition-all duration-300"
              >
                {bookingLoading && <Loader2 size={15} className="animate-spin" />}
                {bookingLoading ? 'Processing…' : 'Proceed to Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ╔══════════════════════════════════════════
          ║  PAYMENT MODAL
          ╚══════════════════════════════════════════ */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
                        flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100
                          shadow-2xl shadow-black/10
                          px-6 py-7 sm:px-8 sm:py-8
                          w-full max-w-md animate-fade-in">

            {/* close */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50
                           rounded-lg transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* icon + headline */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-primary/8 border border-primary/15 rounded-2xl
                              flex items-center justify-center mx-auto mb-3">
                <DollarSign size={24} className="text-primary" />
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-800 tracking-[-0.01em]">
                Secure Payment
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Complete your transaction safely.
              </p>
            </div>

            {/* amount summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl
                            px-4 py-3 mb-5 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Amount</span>
              <span className="text-lg font-serif font-bold text-primary tabular-nums">
                LKR {totalPrice.toLocaleString()}
              </span>
            </div>

            {/* mock card form placeholders */}
            <div className="flex flex-col gap-2.5 mb-5 opacity-50 pointer-events-none select-none">
              <div className="h-11 bg-slate-100 border border-slate-200 rounded-xl" />
              <div className="flex gap-2.5">
                <div className="h-11 bg-slate-100 border border-slate-200 rounded-xl flex-1" />
                <div className="h-11 bg-slate-100 border border-slate-200 rounded-xl flex-1" />
              </div>
            </div>

            {/* pay button */}
            <button
              onClick={handleMockPayment}
              className="w-full inline-flex items-center justify-center gap-2
                         bg-primary text-white text-sm font-bold
                         py-3 rounded-xl
                         shadow-md shadow-primary/30
                         hover:shadow-lg hover:shadow-primary/40
                         hover:-translate-y-0.5
                         transition-all duration-300"
            >
              Pay Now
            </button>

            <p className="text-center text-[9px] text-slate-400 mt-3">
              Encrypted · Test Mode
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripResult;