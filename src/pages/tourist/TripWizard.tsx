import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Mountain, ArrowRight, User, Leaf, Utensils, Tent, Anchor,
  Bird, Palette, Heart, Sparkles, ChevronLeft, Check, Car, MapPin,
  Map as MapIcon
} from 'lucide-react';
import axios from 'axios';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import mapboxgl from 'mapbox-gl';
import { toast } from 'react-toastify';

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */
const INTERESTS = [
  { id: 'Plantation', label: 'Tea & Spice',    icon: Leaf },
  { id: 'Village',    label: 'Village Life',   icon: User },
  { id: 'Culinary',   label: 'Food & Cooking', icon: Utensils },
  { id: 'Adventure',  label: 'Hiking & Eco',   icon: Mountain },
  { id: 'Coastal',    label: 'Beach & Aqua',   icon: Anchor },
  { id: 'Wellness',   label: 'Ayurveda',       icon: Heart },
  { id: 'Arts',       label: 'Culture & Arts', icon: Palette },
  { id: 'Animal',     label: 'Wildlife',       icon: Bird },
];

const GROUP_TYPES = ['Solo', 'Couple', 'Family', 'Friends', 'Group'];
const PACE_TYPES  = ['Relaxed', 'Moderate', 'Active'];

const STEP_LABELS = ['Dates & Group', 'Interests', 'Travel Style', 'Add-Ons'];

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
const TripWizard = () => {
  const navigate = useNavigate();
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const geocoderContainerRef    = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    startDate:        '',
    endDate:          '',
    participantCount: 2,
    groupType:        'Couple',
    interests:        [] as string[],
    pace:             'Moderate',
    luxury:           false,
    needTransport:    false,
    needGuide:        false,
    pickupLocation:   { address: '', coords: [] as number[] },
  });

  /* ─── Mapbox geocoder injection (unchanged logic) ─── */
  useEffect(() => {
    if (step === 3 && formData.needTransport && geocoderContainerRef.current) {
      geocoderContainerRef.current.innerHTML = '';
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken || import.meta.env.VITE_MAPBOX_TOKEN,
        types:       'place,address,poi',
        placeholder: 'Search pickup location (e.g. CMB Airport)',
        countries:   'lk',
      });
      geocoder.addTo(geocoderContainerRef.current);
      geocoder.on('result', (e: any) => {
        const { result } = e;
        setFormData(prev => ({
          ...prev,
          pickupLocation: { address: result.place_name, coords: result.center },
        }));
      });
    }
  }, [step, formData.needTransport]);

  /* ─── Handlers (unchanged logic) ─── */
  const handleNext = () => {
    if (step === 0 && (!formData.startDate || !formData.endDate))
      return toast.warn('Please select travel dates.');
    if (step === 1 && formData.interests.length === 0)
      return toast.warn('Please select at least one interest.');
    if (step < 3) setStep(s => s + 1);
    else handleGenerate();
  };

  const handleBack = () => { if (step > 0) setStep(s => s - 1); };

  const toggleInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/ai/generate-trip`,
        formData
      );
      if (response.data.success && response.data.itinerary?.length > 0) {
        navigate('/trip-result', {
          state: {
            itinerary:      response.data.itinerary,
            totalPrice:     response.data.total_price,
            breakdown:      response.data.breakdown,
            needTransport:  formData.needTransport,
            needGuide:      formData.needGuide,
            pickupLocation: formData.pickupLocation,
          },
        });
      } else {
        toast.error('No matching farm activities found for these dates. Try broadening your criteria.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Trip Generation Error', error);
      toast.error('AI Service is busy. Please try again.');
      setLoading(false);
    }
  };

  /* ─── Framer Motion variants (unchanged) ─── */
  const slideVariants = {
    enter:  (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir < 0 ? 48 : -48, opacity: 0 }),
  };

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 font-sans overflow-hidden"
      style={{ background: 'linear-gradient(175deg, #FAF9F6 0%, #F3EDE6 100%)' }}
    >
      {/* ── Ambient background image + deep frosted overlay ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1546658076-2d8c36863266?q=80&w=2070&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(175deg, rgba(250,249,246,0.82) 0%, rgba(243,237,230,0.88) 100%)',
            backdropFilter: 'blur(14px)',
          }}
        />
      </div>

      {/* ══════════════════════════════════════════
          MAIN CARD
          ══════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-7">
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(45,106,79,0.1), rgba(116,198,157,0.06))',
              border: '1px solid rgba(45,106,79,0.18)',
              color: '#2D6A4F',
            }}
          >
            <Sparkles size={12} /> AI Trip Planner
          </span>

          <h1 className="font-serif font-bold text-dark leading-tight mb-2" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)' }}>
            Design Your <span className="text-primary italic">Perfect</span> Journey
          </h1>
          <p className="text-sm font-medium" style={{ color: 'rgba(125,90,80,0.5)' }}>
            Tell us your preferences — we'll curate an authentic farm tour.
          </p>
        </div>

        {/* Glass card shell */}
        <div
          className="rounded-[36px] overflow-hidden"
          style={{
            background: 'linear-gradient(175deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.78) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 32px 64px -16px rgba(4,31,12,0.14), 0 4px 8px -2px rgba(4,31,12,0.06)',
          }}
        >
          {/* ── Animated progress bar ── */}
          <div className="h-1 w-full" style={{ background: 'rgba(125,90,80,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #2D6A4F, #74C69D)' }}
              initial={{ width: '25%' }}
              animate={{ width: `${((step + 1) / 4) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* ── Step indicator strip ── */}
          <div className="flex items-center justify-center gap-0 px-6 pt-5 pb-2">
            {STEP_LABELS.map((label, i) => {
              const isDone    = i < step;
              const isActive  = i === step;
              return (
                <React.Fragment key={i}>
                  {/* Dot + label */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        background: isDone
                          ? 'linear-gradient(135deg, #2D6A4F, #74C69D)'
                          : isActive
                            ? '#fff'
                            : 'rgba(125,90,80,0.1)',
                        border: isActive
                          ? '2px solid #2D6A4F'
                          : isDone
                            ? 'none'
                            : '2px solid rgba(125,90,80,0.18)',
                        boxShadow: isActive ? '0 0 0 3px rgba(45,106,79,0.15)' : 'none',
                      }}
                    >
                      {isDone ? (
                        <Check size={12} color="#fff" strokeWidth={3} />
                      ) : (
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: isActive ? '#2D6A4F' : 'rgba(125,90,80,0.4)' }}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider mt-1.5 hidden sm:block"
                      style={{ color: isActive ? '#2D6A4F' : isDone ? 'rgba(45,106,79,0.6)' : 'rgba(125,90,80,0.35)' }}
                    >
                      {label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className="w-10 sm:w-16 h-px mx-1 rounded-full transition-all duration-500"
                      style={{ background: isDone ? 'linear-gradient(90deg, #74C69D, #2D6A4F)' : 'rgba(125,90,80,0.12)' }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ══════════════════════════════════════
              STEP CONTENT
              ══════════════════════════════════════ */}
          <div className="p-6 md:p-10" style={{ minHeight: '480px' }}>
            <div className="flex flex-col h-full">
              <AnimatePresence mode="wait" custom={step}>

                {/* ──────────────────────
                    STEP 0 — Dates & Group
                    ────────────────────── */}
                {step === 0 && !loading && (
                  <motion.div
                    key="step0"
                    variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    className="flex-1 space-y-7"
                  >
                    <div>
                      <h2 className="font-serif font-bold text-dark text-xl flex items-center gap-2.5">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl"
                          style={{ background: 'linear-gradient(135deg, rgba(255,176,0,0.12), rgba(255,176,0,0.06))', border: '1px solid rgba(255,176,0,0.2)' }}
                        >
                          <Calendar size={16} color="#c48a00" />
                        </span>
                        When & Who?
                      </h2>
                    </div>

                    {/* Date row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(['startDate', 'endDate'] as const).map((field, idx) => (
                        <div key={field} className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(125,90,80,0.45)' }}>
                            {idx === 0 ? 'Check-in' : 'Check-out'}
                          </label>
                          <input
                            type="date"
                            min={idx === 0 ? new Date().toISOString().split('T')[0] : (formData.startDate || new Date().toISOString().split('T')[0])}
                            value={formData[field]}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                            className="
                              w-full px-4 py-3 rounded-2xl text-sm font-medium text-dark
                              bg-white border focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40
                              transition-all duration-200
                            "
                            style={{ borderColor: 'rgba(125,90,80,0.15)' }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Group type pills */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(125,90,80,0.45)' }}>
                        Who is traveling?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {GROUP_TYPES.map(type => {
                          const active = formData.groupType === type;
                          return (
                            <button
                              key={type}
                              onClick={() => setFormData(prev => ({ ...prev, groupType: type }))}
                              className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95"
                              style={active ? {
                                background: '#2D6A4F',
                                color: '#fff',
                                boxShadow: '0 4px 14px rgba(45,106,79,0.28)',
                              } : {
                                background: '#fff',
                                color: 'rgba(125,90,80,0.6)',
                                border: '1px solid rgba(125,90,80,0.15)',
                              }}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Traveller count */}
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white border max-w-xs"
                      style={{ borderColor: 'rgba(125,90,80,0.12)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, rgba(45,106,79,0.08), rgba(116,198,157,0.06))' }}
                        >
                          <User size={15} style={{ color: '#2D6A4F' }} />
                        </div>
                        <span className="text-sm font-semibold text-dark/70">Travelers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, participantCount: Math.max(1, prev.participantCount - 1) }))}
                          className="w-7 h-7 rounded-lg bg-neutral/8 hover:bg-neutral/15 text-neutral flex items-center justify-center text-lg leading-none transition-colors active:scale-90"
                        >−</button>
                        <span className="w-7 text-center text-sm font-bold text-dark">{formData.participantCount}</span>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, participantCount: Math.min(20, prev.participantCount + 1) }))}
                          className="w-7 h-7 rounded-lg bg-neutral/8 hover:bg-neutral/15 text-neutral flex items-center justify-center text-lg leading-none transition-colors active:scale-90"
                        >+</button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ──────────────────────
                    STEP 1 — Interests
                    ────────────────────── */}
                {step === 1 && !loading && (
                  <motion.div
                    key="step1"
                    variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    className="flex-1 space-y-6"
                  >
                    <div>
                      <h2 className="font-serif font-bold text-dark text-xl flex items-center gap-2.5">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl"
                          style={{ background: 'linear-gradient(135deg, rgba(45,106,79,0.1), rgba(116,198,157,0.06))', border: '1px solid rgba(45,106,79,0.18)' }}
                        >
                          <Heart size={16} color="#2D6A4F" />
                        </span>
                        What excites you?
                      </h2>
                      <p className="text-[12px] font-medium mt-1.5 ml-10.5" style={{ color: 'rgba(125,90,80,0.45)' }}>
                        Select topics you love — we'll match farms accordingly.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {INTERESTS.map((item) => {
                        const Icon     = item.icon;
                        const selected = formData.interests.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleInterest(item.id)}
                            className="relative p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all duration-250 active:scale-[0.94] group"
                            style={selected ? {
                              background: 'linear-gradient(135deg, rgba(45,106,79,0.07), rgba(116,198,157,0.05))',
                              border: '1.5px solid rgba(45,106,79,0.35)',
                              boxShadow: '0 4px 14px rgba(45,106,79,0.1)',
                            } : {
                              background: '#fff',
                              border: '1.5px solid rgba(125,90,80,0.1)',
                            }}
                          >
                            {/* Check badge */}
                            {selected && (
                              <div
                                className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #2D6A4F, #74C69D)' }}
                              >
                                <Check size={11} color="#fff" strokeWidth={3} />
                              </div>
                            )}

                            {/* Icon vessel */}
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
                              style={selected ? {
                                background: 'linear-gradient(135deg, #2D6A4F, #74C69D)',
                              } : {
                                background: 'rgba(125,90,80,0.06)',
                              }}
                            >
                              <Icon
                                size={20}
                                color={selected ? '#fff' : 'rgba(125,90,80,0.45)'}
                                className="group-hover:scale-110 transition-transform duration-200"
                              />
                            </div>

                            <span
                              className="text-[11px] font-bold text-center leading-tight"
                              style={{ color: selected ? '#2D6A4F' : 'rgba(125,90,80,0.6)' }}
                            >
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ──────────────────────
                    STEP 2 — Travel Style
                    ────────────────────── */}
                {step === 2 && !loading && (
                  <motion.div
                    key="step2"
                    variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    className="flex-1 space-y-7"
                  >
                    <div>
                      <h2 className="font-serif font-bold text-dark text-xl flex items-center gap-2.5">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl"
                          style={{ background: 'linear-gradient(135deg, rgba(116,198,157,0.12), rgba(45,106,79,0.06))', border: '1px solid rgba(116,198,157,0.22)' }}
                        >
                          <Sparkles size={16} color="#74C69D" />
                        </span>
                        Travel Style
                      </h2>
                    </div>

                    {/* Pace segmented control */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(125,90,80,0.45)' }}>Pace</label>
                      <div
                        className="flex p-1 rounded-2xl"
                        style={{ background: 'rgba(125,90,80,0.06)', border: '1px solid rgba(125,90,80,0.08)' }}
                      >
                        {PACE_TYPES.map(p => {
                          const active = formData.pace === p;
                          return (
                            <button
                              key={p}
                              onClick={() => setFormData(prev => ({ ...prev, pace: p }))}
                              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 active:scale-95"
                              style={active ? {
                                background: '#fff',
                                color: '#2D6A4F',
                                boxShadow: '0 2px 8px rgba(4,31,12,0.1)',
                              } : {
                                color: 'rgba(125,90,80,0.45)',
                              }}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rustic vs Premium cards */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(125,90,80,0.45)' }}>Experience Type</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Rustic */}
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, luxury: false }))}
                          className="text-left p-5 rounded-2xl transition-all duration-200 active:scale-[0.97]"
                          style={!formData.luxury ? {
                            background: 'linear-gradient(135deg, rgba(255,176,0,0.08), rgba(255,176,0,0.03))',
                            border: '1.5px solid rgba(255,176,0,0.3)',
                            boxShadow: '0 4px 14px rgba(255,176,0,0.1)',
                          } : {
                            background: '#fff',
                            border: '1.5px solid rgba(125,90,80,0.12)',
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{ background: !formData.luxury ? 'rgba(255,176,0,0.15)' : 'rgba(125,90,80,0.06)' }}
                            >
                              <Tent size={18} color={!formData.luxury ? '#c48a00' : 'rgba(125,90,80,0.4)'} />
                            </div>
                            {!formData.luxury && (
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #FFB000, #e8a000)' }}
                              >
                                <Check size={11} color="#fff" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <h3 className="text-sm font-bold" style={{ color: !formData.luxury ? '#c48a00' : 'rgba(4,31,12,0.7)' }}>
                            Authentic & Rustic
                          </h3>
                          <p className="text-[11px] mt-1" style={{ color: 'rgba(125,90,80,0.5)' }}>
                            Village homestays, organic food, hands-on farming.
                          </p>
                        </button>

                        {/* Premium */}
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, luxury: true }))}
                          className="text-left p-5 rounded-2xl transition-all duration-200 active:scale-[0.97]"
                          style={formData.luxury ? {
                            background: 'linear-gradient(135deg, rgba(45,106,79,0.07), rgba(116,198,157,0.04))',
                            border: '1.5px solid rgba(45,106,79,0.3)',
                            boxShadow: '0 4px 14px rgba(45,106,79,0.1)',
                          } : {
                            background: '#fff',
                            border: '1.5px solid rgba(125,90,80,0.12)',
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{ background: formData.luxury ? 'rgba(45,106,79,0.12)' : 'rgba(125,90,80,0.06)' }}
                            >
                              <Sparkles size={18} color={formData.luxury ? '#2D6A4F' : 'rgba(125,90,80,0.4)'} />
                            </div>
                            {formData.luxury && (
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #2D6A4F, #74C69D)' }}
                              >
                                <Check size={11} color="#fff" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <h3 className="text-sm font-bold" style={{ color: formData.luxury ? '#2D6A4F' : 'rgba(4,31,12,0.7)' }}>
                            Premium Comfort
                          </h3>
                          <p className="text-[11px] mt-1" style={{ color: 'rgba(125,90,80,0.5)' }}>
                            Boutique eco-lodges, private dining, AC transport.
                          </p>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ──────────────────────
                    STEP 3 — Add-Ons
                    ────────────────────── */}
                {step === 3 && !loading && (
                  <motion.div
                    key="step3"
                    variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    className="flex-1 space-y-5"
                  >
                    <div>
                      <h2 className="font-serif font-bold text-dark text-xl flex items-center gap-2.5">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl"
                          style={{ background: 'linear-gradient(135deg, rgba(125,90,80,0.08), rgba(125,90,80,0.04))', border: '1px solid rgba(125,90,80,0.15)' }}
                        >
                          <MapPin size={16} color="rgba(125,90,80,0.6)" />
                        </span>
                        Add-On Services
                      </h2>
                    </div>

                    {/* Toggle card factory */}
                    {([
                      {
                        key:     'needTransport' as const,
                        Icon:    Car,
                        title:   'Private Transport',
                        desc:    'AC Vehicle & Driver for the full trip.',
                      },
                      {
                        key:     'needGuide' as const,
                        Icon:    MapIcon,
                        title:   'Tour Guide',
                        desc:    'Local expert to travel with you.',
                      },
                    ] as const).map(({ key, Icon, title, desc }) => {
                      const on = formData[key];
                      return (
                        <React.Fragment key={key}>
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, [key]: !prev[key] }))}
                            className="w-full text-left p-4.5 rounded-2xl flex items-center justify-between transition-all duration-200 active:scale-[0.98]"
                            style={on ? {
                              background: 'linear-gradient(135deg, rgba(45,106,79,0.06), rgba(116,198,157,0.04))',
                              border: '1.5px solid rgba(45,106,79,0.28)',
                              boxShadow: '0 4px 14px rgba(45,106,79,0.08)',
                            } : {
                              background: '#fff',
                              border: '1.5px solid rgba(125,90,80,0.12)',
                            }}
                          >
                            <div className="flex items-center gap-4">
                              {/* Icon vessel */}
                              <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                style={on ? {
                                  background: 'linear-gradient(135deg, #2D6A4F, #74C69D)',
                                } : {
                                  background: 'rgba(125,90,80,0.06)',
                                }}
                              >
                                <Icon size={20} color={on ? '#fff' : 'rgba(125,90,80,0.4)'} />
                              </div>

                              <div>
                                <h3 className="text-sm font-bold" style={{ color: on ? '#2D6A4F' : 'rgba(4,31,12,0.75)' }}>{title}</h3>
                                <p className="text-[11px]" style={{ color: 'rgba(125,90,80,0.45)' }}>{desc}</p>
                              </div>
                            </div>

                            {/* Toggle knob */}
                            <div
                              className="w-11 h-6 rounded-full relative shrink-0 transition-all duration-300"
                              style={{ background: on ? '#2D6A4F' : 'rgba(125,90,80,0.18)' }}
                            >
                              <div
                                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300"
                                style={{
                                  left: on ? '22px' : '2px',
                                  boxShadow: on ? '0 1px 4px rgba(45,106,79,0.3)' : '0 1px 3px rgba(0,0,0,0.12)',
                                }}
                              />
                            </div>
                          </button>

                          {/* Pickup location — slides in under transport toggle */}
                          <AnimatePresence>
                            {key === 'needTransport' && formData.needTransport && (
                              <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: '-8px' }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden"
                              >
                                <div
                                  className="mx-3 mt-1 mb-2 p-4 rounded-xl"
                                  style={{ background: 'rgba(45,106,79,0.04)', border: '1px solid rgba(45,106,79,0.1)' }}
                                >
                                  <label className="text-[9px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(45,106,79,0.55)' }}>
                                    Pickup Location
                                  </label>
                                  <div ref={geocoderContainerRef} className="mapbox-geocoder-wrapper" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                  </motion.div>
                )}

                {/* ──────────────────────
                    LOADING
                    ────────────────────── */}
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-8"
                  >
                    {/* Pulsing ring — same pattern as SearchResults / ActivityDetail */}
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(45,106,79,0.12)' }} />
                      <div
                        className="absolute inset-2 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #2D6A4F, #74C69D)' }}
                      >
                        <Sparkles className="text-white animate-pulse" size={24} />
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-dark text-xl">Crafting your itinerary…</h3>
                    <p className="text-sm mt-2 max-w-sm leading-relaxed" style={{ color: 'rgba(125,90,80,0.5)' }}>
                      Our AI is matching your preferences with available farms, checking weather patterns, and optimizing your route.
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* ══════════════════════════════════════
                  FOOTER NAV
                  ══════════════════════════════════════ */}
              {!loading && (
                <div
                  className="mt-auto flex items-center justify-between pt-6"
                  style={{ borderTop: '1px solid rgba(125,90,80,0.08)' }}
                >
                  {/* Back button */}
                  {step > 0 ? (
                    <button
                      onClick={handleBack}
                      className="
                        flex items-center gap-1.5 text-sm font-bold
                        px-4 py-2.5 rounded-xl
                        hover:bg-neutral/6 active:scale-95 transition-all duration-200
                      "
                      style={{ color: 'rgba(125,90,80,0.5)' }}
                    >
                      <ChevronLeft size={17} /> Back
                    </button>
                  ) : <div />}

                  {/* Next / Generate CTA */}
                  <button
                    onClick={handleNext}
                    className="
                      flex items-center gap-2 text-sm font-bold text-white
                      px-6 py-3 rounded-xl
                      active:scale-95 transition-all duration-200
                    "
                    style={{
                      background: 'linear-gradient(135deg, #2D6A4F, #3a8a65)',
                      boxShadow: '0 4px 16px rgba(45,106,79,0.32)',
                    }}
                  >
                    {step === 3 ? 'Generate My Plan' : 'Next Step'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripWizard;