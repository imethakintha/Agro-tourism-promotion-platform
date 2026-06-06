import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAvailability, createBooking, getTransportCost } from '../../services/bookingService';
import { validatePromotion } from '../../services/publicService';
import {
  Calendar, Users, Clock, Loader2, CheckCircle, Map as MapIcon,
  Bus, MapPin, Tag, CreditCard, ChevronRight, User, Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PaymentForm from '../payment/PaymentForm';
import AdvancedLocationPicker from '../common/AdvancedLocationPicker';

/* ════════════════════════════════════════════════
   INJECTED KEYFRAMES   
   ════════════════════════════════════════════════ */
const BOOKING_ANIM_CSS = `
  @keyframes bookingFadeUp {
    0%   { opacity:0; transform:translateY(10px); }
    100% { opacity:1; transform:translateY(0); }
  }
  .booking-fade-up {
    opacity:0;
    animation: bookingFadeUp 0.36s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  @keyframes slotPop {
    0%   { opacity:0; transform:scale(0.92); }
    100% { opacity:1; transform:scale(1); }
  }
  .slot-pop {
    opacity:0;
    animation: slotPop 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('agro-booking-anim')) {
  const t = document.createElement('style');
  t.id = 'agro-booking-anim';
  t.textContent = BOOKING_ANIM_CSS;
  document.head.appendChild(t);
}

/* ════════════════════════════════════════════════
   PROPS
   ════════════════════════════════════════════════ */
interface BookingFormProps {
  activityId: string;
  pricePerPerson: number;
  maxParticipants: number;
}

/* ════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════ */
const BookingForm: React.FC<BookingFormProps> = ({ activityId, pricePerPerson, maxParticipants }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  /* ─── state (unchanged) ─── */
  const [date, setDate]                         = useState('');
  const [participants, setParticipants]         = useState(1);
  const [availableSlots, setAvailableSlots]     = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot]         = useState<string>('');
  const [checking, setChecking]                 = useState(false);
  const [submitting, setSubmitting]             = useState(false);
  const [availabilityMsg, setAvailabilityMsg]   = useState('');
  const [pickupCoords, setPickupCoords]         = useState<[number, number] | null>(null);

  const [addGuide, setAddGuide]                 = useState(false);
  const [addTransport, setAddTransport]         = useState(false);
  const [pickupAddress, setPickupAddress]       = useState('');
  const [transportCost, setTransportCost]       = useState(0);
  const [calculatingCost, setCalculatingCost]   = useState(false);

  const [promoCode, setPromoCode]               = useState('');
  const [discount, setDiscount]                 = useState(0);
  const [promoMessage, setPromoMessage]         = useState('');
  const [isValidPromo, setIsValidPromo]         = useState(false);

  const [contactName, setContactName]           = useState('');
  const [contactPhone, setContactPhone]         = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount]           = useState(0);

  /* ─── effects (logic unchanged) ─── */
  useEffect(() => {
    if (user) { setContactName(user.fullName); setContactPhone(user.phoneNumber); }
  }, [user]);

  useEffect(() => {
    const checkSlots = async () => {
      if (!date) return;
      setChecking(true); setAvailabilityMsg(''); setSelectedSlot(''); setAvailableSlots([]);
      try {
        const res = await checkAvailability({ activityId, date, participants });
        if (res.success && res.available) setAvailableSlots(res.slots);
        else setAvailabilityMsg('No slots available for this date.');
      } catch { setAvailabilityMsg('Error checking availability.'); }
      finally { setChecking(false); }
    };
    const d = setTimeout(() => { if (date) checkSlots(); }, 500);
    return () => clearTimeout(d);
  }, [date, participants, activityId]);

  useEffect(() => {
    const calc = async () => {
      if (!addTransport || !pickupAddress || pickupAddress.length < 5) { setTransportCost(0); return; }
      setCalculatingCost(true);
      try {
        const res = await getTransportCost(activityId, pickupAddress);
        if (res.success) setTransportCost(res.estimatedCost);
      } catch { console.error('Failed to calculate transport cost'); }
      finally { setCalculatingCost(false); }
    };
    const t = setTimeout(calc, 1000);
    return () => clearTimeout(t);
  }, [pickupAddress, addTransport, activityId]);

  /* ─── derived (unchanged) ─── */
  const activityCost = pricePerPerson * participants;
  const guideEst     = addGuide ? 3000 : 0;
  const subTotal     = activityCost + guideEst + transportCost;
  const totalEst     = subTotal - discount;

  /* ─── handlers (logic unchanged) ─── */
  const applyPromo = async () => {
    if (!promoCode) return;
    setPromoMessage('Validating…');
    try {
      const res = await validatePromotion(promoCode, subTotal);
      setDiscount(res.data.discountAmount); setIsValidPromo(true);
      setPromoMessage(`Coupon Applied: -LKR ${res.data.discountAmount}`);
    } catch (err: any) {
      setDiscount(0); setIsValidPromo(false);
      setPromoMessage(err.response?.data?.message || 'Invalid code');
    }
  };

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!date || !selectedSlot || !contactName || !contactPhone) { alert('Please fill in all fields'); return; }
    if (addTransport && !pickupAddress) { alert('Please enter a pickup location for transport'); return; }
    setSubmitting(true);
    const [startTime, endTime] = selectedSlot.split('-');
    try {
      const res = await createBooking({
        activityId, activityDate: date,
        timeSlot: { startTime, endTime },
        numberOfParticipants: participants,
        contactName, contactPhone,
        participantDetails: [],
        needsGuide: addGuide,
        needsTransport: addTransport,
        pickupAddress: addTransport ? pickupAddress : undefined,
        pickupCoordinates: addTransport && pickupCoords ? { lat: pickupCoords[1], lng: pickupCoords[0] } : undefined,
        promoCode: isValidPromo ? promoCode : undefined,
      });
      if (res.success || res.data?.success) {
        setPendingBookingId(res.data._id);
        setTotalAmount(res.data.pricing.totalCost);
        setShowPaymentModal(true);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Booking failed');
      setSubmitting(false);
    }
  };

  /* ════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════ */
  return (
    <div
      className="font-sans"
      style={{
        background: 'linear-gradient(175deg, #fff 0%, #FDFBF8 100%)',
        borderRadius: '28px',
        border: '1px solid rgba(125,90,80,0.1)',
        boxShadow: '0 24px 48px -12px rgba(4,31,12,0.14), 0 4px 8px -2px rgba(4,31,12,0.06)',
        padding: '24px',
      }}
    >
      {/* ── Header ── */}
      <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(125,90,80,0.08)' }}>
        <h3 className="font-serif font-bold text-dark" style={{ fontSize: '1.15rem' }}>Book Your Experience</h3>
        <p className="text-[11px] mt-1 font-medium" style={{ color: 'rgba(125,90,80,0.4)' }}>Reserve your spot instantly.</p>
      </div>

      <div className="space-y-5">

        {/* ════════════════════════════════════
            DATE + GUESTS ROW
            ════════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-3">
          {/* Date */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2" style={{ color: 'rgba(125,90,80,0.45)' }}>
              <Calendar size={11} style={{ color: '#2D6A4F' }} /> Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-[12.5px] font-medium text-dark focus:outline-none transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #F5F2ED, #FAF9F6)',
                border: '1px solid rgba(125,90,80,0.12)',
                borderRadius: '14px',
                padding: '10px 12px',
              }}
              onFocus={e => { e.target.style.border = '1px solid rgba(45,106,79,0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.1)'; }}
              onBlur={e  => { e.target.style.border = '1px solid rgba(125,90,80,0.12)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Guests */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2" style={{ color: 'rgba(125,90,80,0.45)' }}>
              <Users size={11} style={{ color: '#2D6A4F' }} /> Guests
            </label>
            <div className="flex items-center rounded-[14px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F2ED, #FAF9F6)', border: '1px solid rgba(125,90,80,0.12)' }}>
              <button
                onClick={() => setParticipants(Math.max(1, participants - 1))}
                className="w-9 h-10 flex items-center justify-center text-lg font-bold transition-colors duration-150 active:scale-90"
                style={{ color: 'rgba(125,90,80,0.4)' }}
              >−</button>
              <span className="flex-1 text-center text-[13px] font-bold text-dark">{participants}</span>
              <button
                onClick={() => setParticipants(Math.min(maxParticipants, participants + 1))}
                className="w-9 h-10 flex items-center justify-center text-lg font-bold transition-colors duration-150 active:scale-90"
                style={{ color: '#2D6A4F' }}
              >+</button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════
            TIME SLOTS
            ════════════════════════════════════ */}
        <div style={{ minHeight: '72px' }}>
          {/* Checking — pulsing ring */}
          {checking && (
            <div className="flex items-center justify-center py-5 rounded-2xl" style={{ background: 'rgba(45,106,79,0.04)', border: '1px solid rgba(45,106,79,0.1)' }}>
              <div className="relative w-7 h-7 mr-3">
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(45,106,79,0.12)' }} />
                <div className="absolute inset-1 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D6A4F, #74C69D)' }}>
                  <Loader2 className="animate-spin text-white" size={12} />
                </div>
              </div>
              <span className="text-[11px] font-bold" style={{ color: '#2D6A4F' }}>Checking availability…</span>
            </div>
          )}

          {/* Error message */}
          {!checking && availabilityMsg && (
            <div className="booking-fade-up flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: 'rgba(125,90,80,0.05)', border: '1px solid rgba(125,90,80,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'rgba(125,90,80,0.5)' }} />
              <span className="text-[11.5px] font-medium" style={{ color: 'rgba(125,90,80,0.6)' }}>{availabilityMsg}</span>
            </div>
          )}

          {/* Slots grid */}
          {!checking && !availabilityMsg && availableSlots.length > 0 && (
            <div className="booking-fade-up">
              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2" style={{ color: 'rgba(125,90,80,0.45)' }}>
                <Clock size={11} style={{ color: '#2D6A4F' }} /> Available Slots
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                {availableSlots.map((slot, idx) => {
                  const key = `${slot.startTime}-${slot.endTime}`;
                  const active = selectedSlot === key;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(key)}
                      className="slot-pop text-[11px] font-bold py-2.5 px-2 rounded-xl transition-all duration-200 active:scale-[0.95]"
                      style={{
                        animationDelay: `${idx * 0.05}s`,
                        background: active ? 'linear-gradient(135deg, #2D6A4F, #3a8a65)' : '#fff',
                        color: active ? '#fff' : 'rgba(125,90,80,0.55)',
                        border: active ? '1px solid transparent' : '1px solid rgba(125,90,80,0.12)',
                        boxShadow: active ? '0 4px 14px rgba(45,106,79,0.28)' : 'none',
                      }}
                    >
                      {slot.startTime} – {slot.endTime}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Placeholder when no date selected */}
          {!checking && !availabilityMsg && availableSlots.length === 0 && (
            <div className="flex items-center justify-center py-5 rounded-2xl" style={{ background: 'rgba(125,90,80,0.03)', border: '1px dashed rgba(125,90,80,0.18)' }}>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(125,90,80,0.35)' }}>Select a date to see available times</span>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════
            ADD-ONS (visible after slot selected)
            ════════════════════════════════════ */}
        {selectedSlot && (
          <div className="booking-fade-up space-y-3 pt-4" style={{ borderTop: '1px solid rgba(125,90,80,0.08)' }}>
            <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(125,90,80,0.45)' }}>
              Customize Your Trip
            </h4>

            {/* ── Guide toggle card ── */}
            <div
              onClick={() => setAddGuide(!addGuide)}
              className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98]"
              style={addGuide ? {
                background: 'linear-gradient(135deg, rgba(45,106,79,0.06), rgba(116,198,157,0.04))',
                border: '1px solid rgba(45,106,79,0.2)',
              } : {
                background: '#fff',
                border: '1px solid rgba(125,90,80,0.1)',
              }}
            >
              {/* Knob switch */}
              <div
                className="shrink-0 w-10 h-5.5 rounded-full relative transition-colors duration-200"
                style={{ background: addGuide ? '#2D6A4F' : 'rgba(125,90,80,0.2)' }}
              >
                <div
                  className="absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-200"
                  style={{ left: addGuide ? '21px' : '2px' }}
                />
              </div>

              {/* Icon vessel */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,176,0,0.12), rgba(255,176,0,0.06))' }}
              >
                <MapIcon size={15} style={{ color: '#c48a00' }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-dark">Professional Guide</span>
                  <span className="text-[11px] font-bold" style={{ color: '#2D6A4F' }}>+ LKR 3,000</span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(125,90,80,0.4)' }}>English-speaking expert for cultural insights.</p>
              </div>
            </div>

            {/* ── Transport toggle card ── */}
            <div
              className="rounded-2xl transition-all duration-200"
              style={addTransport ? {
                background: 'linear-gradient(135deg, rgba(45,106,79,0.06), rgba(116,198,157,0.04))',
                border: '1px solid rgba(45,106,79,0.2)',
              } : {
                background: '#fff',
                border: '1px solid rgba(125,90,80,0.1)',
              }}
            >
              {/* Toggle row */}
              <div
                onClick={() => setAddTransport(!addTransport)}
                className="flex items-center gap-3 p-3.5 cursor-pointer"
              >
                {/* Knob switch */}
                <div
                  className="shrink-0 w-10 h-5.5 rounded-full relative transition-colors duration-200"
                  style={{ background: addTransport ? '#2D6A4F' : 'rgba(125,90,80,0.2)' }}
                >
                  <div
                    className="absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-200"
                    style={{ left: addTransport ? '21px' : '2px' }}
                  />
                </div>

                {/* Icon vessel */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(45,106,79,0.1), rgba(116,198,157,0.06))' }}
                >
                  <Bus size={15} style={{ color: '#2D6A4F' }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-dark">Private Transport</span>
                    {transportCost > 0 ? (
                      <span className="text-[11px] font-bold" style={{ color: '#2D6A4F' }}>+ LKR {transportCost.toLocaleString()}</span>
                    ) : (
                      <span className="text-[10px] font-medium" style={{ color: 'rgba(125,90,80,0.35)' }}>Calculated below</span>
                    )}
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(125,90,80,0.4)' }}>Round trip from your location.</p>
                </div>
              </div>

              {/* Location picker slide-in */}
              {addTransport && (
                <div className="booking-fade-up px-3.5 pb-3.5">
                  <div className="pt-3 pl-18" style={{ borderTop: '1px solid rgba(45,106,79,0.1)' }}>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: 'rgba(125,90,80,0.5)' }}>
                      <MapPin size={11} style={{ color: '#2D6A4F' }} /> Pickup Location
                      <span style={{ color: 'rgba(125,90,80,0.5)' }}>*</span>
                    </label>
                    <AdvancedLocationPicker
                      onLocationSelect={(loc: { address: string; coordinates: [number, number] }) => {
                        setPickupAddress(loc.address);
                        setPickupCoords(loc.coordinates);
                      }}
                    />
                    {calculatingCost && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Loader2 size={11} className="animate-spin" style={{ color: '#FFB000' }} />
                        <span className="text-[10px] font-bold" style={{ color: '#c48a00' }}>Calculating route cost…</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            CHECKOUT SUMMARY (visible after slot selected)
            ════════════════════════════════════ */}
        {selectedSlot && (
          <div className="booking-fade-up space-y-4 pt-4" style={{ borderTop: '1px solid rgba(125,90,80,0.08)' }}>

            {/* Contact fields */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: <User size={13} style={{ color: 'rgba(125,90,80,0.35)' }} />, placeholder: 'Your Name', value: contactName, set: setContactName },
                { icon: <Phone size={13} style={{ color: 'rgba(125,90,80,0.35)' }} />, placeholder: 'Phone Number', value: contactPhone, set: setContactPhone },
              ].map((f, i) => (
                <div key={i} className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 shrink-0">{f.icon}</div>
                  <input
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full pl-8 pr-3 text-[12px] font-medium text-dark focus:outline-none transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #F5F2ED, #FAF9F6)',
                      border: '1px solid rgba(125,90,80,0.12)',
                      borderRadius: '14px',
                      padding: '10px 12px 10px 32px',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(45,106,79,0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.1)'; }}
                    onBlur={e  => { e.target.style.border = '1px solid rgba(125,90,80,0.12)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              ))}
            </div>

            {/* Promo code row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(125,90,80,0.35)' }} />
                <input
                  placeholder="Have a promo code?"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full pl-8 pr-3 text-[12px] font-medium text-dark uppercase focus:outline-none transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #F5F2ED, #FAF9F6)',
                    border: '1px solid rgba(125,90,80,0.12)',
                    borderRadius: '14px',
                    padding: '10px 12px 10px 30px',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid rgba(45,106,79,0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.1)'; }}
                  onBlur={e  => { e.target.style.border = '1px solid rgba(125,90,80,0.12)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button
                onClick={applyPromo}
                className="text-[11px] font-bold text-dark px-4 rounded-xl transition-all duration-200 active:scale-[0.95] shrink-0"
                style={{ background: '#fff', border: '1px solid rgba(125,90,80,0.18)' }}
              >
                Apply
              </button>
            </div>

            {/* Promo feedback */}
            {promoMessage && (
              <div className="flex items-center gap-1.5">
                {isValidPromo && <CheckCircle size={11} style={{ color: '#2D6A4F' }} />}
                <span
                  className="text-[11px] font-bold"
                  style={{ color: isValidPromo ? '#2D6A4F' : 'rgba(125,90,80,0.55)' }}
                >
                  {promoMessage}
                </span>
              </div>
            )}

            {/* ── Cost summary card ── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(125,90,80,0.1)' }}
            >
              {/* Tri-color accent stripe */}
              <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #2D6A4F, #74C69D, #FFB000)' }} />

              <div
                className="px-4 py-3.5 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, rgba(45,106,79,0.05), rgba(116,198,157,0.03))' }}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(125,90,80,0.45)' }}>
                    Total Estimate
                  </span>
                  {isValidPromo && (
                    <span className="block text-[11px] line-through mt-0.5" style={{ color: 'rgba(125,90,80,0.3)' }}>
                      LKR {subTotal.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="font-serif font-bold text-dark" style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                  LKR {totalEst.toLocaleString()}
                </span>
              </div>
            </div>

            {/* ── Pay CTA ── */}
            <button
              onClick={handleBook}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 text-white text-[13px] font-bold py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #FFB000, #e8a000)',
                boxShadow: '0 6px 20px rgba(255,176,0,0.3)',
              }}
            >
              {submitting ? (
                <><Loader2 className="animate-spin" size={18} /> Processing…</>
              ) : (
                <>Proceed to Payment <ChevronRight size={17} /></>
              )}
            </button>

            {/* Secure badge */}
            <p className="text-center text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5" style={{ color: 'rgba(125,90,80,0.3)' }}>
              <CreditCard size={10} /> Secure payment powered by Stripe / PayHere
            </p>
          </div>
        )}
      </div>

      {/* Payment modal (logic unchanged) */}
      {showPaymentModal && pendingBookingId && (
        <PaymentForm bookingId={pendingBookingId} amount={totalAmount} />
      )}
    </div>
  );
};

export default BookingForm;