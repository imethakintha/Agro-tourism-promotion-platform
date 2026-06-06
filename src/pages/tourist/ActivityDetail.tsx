import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getActivityDetails } from '../../services/searchService';
import {
  MapPin, Clock, Users, Star, ShieldCheck, Languages,
  Share2, Heart, ArrowLeft, Image as ImageIcon, Check
} from 'lucide-react';
import BookingForm from '../../components/booking/BookingForm';
import ReviewList from '../../components/reviews/ReviewList';
import { checkLanguageSupport } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

/* ════════════════════════════════════════════════
   Injected keyframes — reused across sections
   ════════════════════════════════════════════════ */
const DETAIL_ANIM_CSS = `
  @keyframes detailFadeUp {
    0%  { opacity: 0; transform: translateY(16px); }
    100%{ opacity: 1; transform: translateY(0); }
  }
  .detail-fade-up {
    opacity: 0;
    animation: detailFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
  }
`;

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<any>(null);
  const [farm, setFarm]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const { user } = useAuth();
  const [aiBadge, setAiBadge]   = useState<any>(null);
  const [wishlisted, setWishlisted] = useState(false);

  /* Inject keyframes once */
  useEffect(() => {
    if (document.getElementById('agro-detail-anim')) return;
    const tag = document.createElement('style');
    tag.id   = 'agro-detail-anim';
    tag.textContent = DETAIL_ANIM_CSS;
    document.head.appendChild(tag);
  }, []);

  /* ─── Fetch activity + farm ─── */
  useEffect(() => {
    if (id) {
      getActivityDetails(id)
        .then(res => {
          setActivity(res.data.activity);
          setFarm(res.data.farm);
          if (res.data.activity.images.length > 0) {
            setSelectedImage(res.data.activity.images[0].url);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  /* ─── AI language badge ─── */
  useEffect(() => {
    const fetchAiInsights = async () => {
      if (user && farm && farm.location?.coordinates) {
        try {
          let lat, lng;
          const coords = farm.location.coordinates;
          if (Array.isArray(coords)) {
            [lng, lat] = coords;
          } else {
            lat = coords.lat;
            lng = coords.lng;
          }
          const res = await checkLanguageSupport(lat, lng, user.preferredLanguage || 'English');
          if (res.badge) setAiBadge(res.badge);
        } catch (err) {
          console.error("AI Check Failed:", err);
        }
      }
    };
    fetchAiInsights();
  }, [user, farm]);

  /* ─── Image URL helper ─── */
  const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/800x600';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  /* ═══════════════════════════════════════════════
     LOADING
     ═══════════════════════════════════════════════ */
  if (loading) return (
    <div
      className="flex flex-col items-center justify-center min-h-screen font-sans"
      style={{ background: 'linear-gradient(175deg, #FAF9F6 0%, #F3EDE6 100%)' }}
    >
      <div className="relative w-16 h-16 mb-5">
        <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(45,106,79,0.15)' }} />
        <div
          className="absolute inset-2 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2D6A4F, #74C69D)' }}
        >
          <div className="w-6 h-6 border-[2.5px] border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
      <p className="text-sm font-semibold" style={{ color: 'rgba(125,90,80,0.5)' }}>
        Loading experience…
      </p>
    </div>
  );

  /* ═══════════════════════════════════════════════
     NOT FOUND
     ═══════════════════════════════════════════════ */
  if (!activity) return (
    <div
      className="flex flex-col items-center justify-center min-h-screen font-sans"
      style={{ background: 'linear-gradient(175deg, #FAF9F6 0%, #F3EDE6 100%)' }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'linear-gradient(135deg, rgba(45,106,79,0.08), rgba(116,198,157,0.06))' }}
      >
        <ImageIcon size={28} style={{ color: 'rgba(45,106,79,0.35)' }} />
      </div>
      <h2 className="font-serif font-bold text-dark text-xl mb-2">Experience not found</h2>
      <p className="text-sm mb-4" style={{ color: 'rgba(125,90,80,0.5)' }}>
        This activity may have been removed or the link has changed.
      </p>
      <Link
        to="/activities"
        className="
          text-sm font-bold text-primary
          px-5 py-2.5 rounded-xl border border-primary/25
          hover:bg-primary hover:text-white hover:border-primary
          active:scale-95 transition-all duration-200
        "
      >
        Browse all experiences
      </Link>
    </div>
  );

  /* ═══════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: 'linear-gradient(175deg, #FAF9F6 0%, #F3EDE6 100%)' }}
    >
      {/* ══════════════════════════════════════
          HERO GALLERY
          ══════════════════════════════════════ */}
      <div className="relative w-full" style={{ height: '520px' }}>

        {/* Grid of images */}
        <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-1.5 md:gap-2">
          {/* Main image — spans 2 cols + 2 rows on desktop */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden">
            <img
              src={getImageUrl(activity.images[0]?.url)}
              alt={activity.customTitle}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Top-right */}
          <div className="hidden md:block relative group overflow-hidden">
            <img
              src={getImageUrl(activity.images[1]?.url)}
              alt="Gallery"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Far top-right */}
          <div className="hidden md:block relative group overflow-hidden">
            <img
              src={getImageUrl(activity.images[2]?.url)}
              alt="Gallery"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Bottom-right left */}
          <div className="hidden md:block relative group overflow-hidden">
            <img
              src={getImageUrl(activity.images[3]?.url)}
              alt="Gallery"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Bottom-right right — "+N" overlay if more images */}
          <div className="hidden md:block relative group overflow-hidden">
            <img
              src={getImageUrl(activity.images[4]?.url)}
              alt="Gallery"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {activity.images.length > 5 && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-white"
                style={{ background: 'rgba(4,31,12,0.55)', backdropFilter: 'blur(3px)' }}
              >
                <ImageIcon size={22} className="mb-1 opacity-80" />
                <span className="text-sm font-bold">+{activity.images.length - 5}</span>
                <span className="text-[10px] font-medium opacity-70 uppercase tracking-wider">photos</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom gradient fade → page background */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #F3EDE6)' }}
        />

        {/* Top nav bar — glassmorphism strip */}
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 md:px-8 py-4"
          style={{
            background: 'linear-gradient(180deg, rgba(4,31,12,0.45) 0%, transparent 100%)',
          }}
        >
          <Link
            to="/activities"
            className="
              inline-flex items-center gap-1.5 text-white text-sm font-bold
              px-3 py-1.5 rounded-xl
              hover:bg-white/15 active:scale-95 transition-all duration-200
            "
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <ArrowLeft size={15} /> Back
          </Link>

          <div className="flex gap-2">
            {/* Share */}
            <button
              className="
                inline-flex items-center gap-1.5 text-white text-sm font-bold
                px-3 py-1.5 rounded-xl
                hover:bg-white/20 active:scale-95 transition-all duration-200
              "
              style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <Share2 size={14} /> Share
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setWishlisted(prev => !prev)}
              className="
                inline-flex items-center justify-center w-9 h-9 rounded-xl
                hover:bg-white/20 active:scale-95 transition-all duration-200
              "
              style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <Heart
                size={17}
                className="transition-colors duration-200"
                fill={wishlisted ? '#FFB000' : 'none'}
                color={wishlisted ? '#FFB000' : 'white'}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          CONTENT GRID
          ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-2 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-14">

          {/* ─────────────────────────────
              LEFT — main content
              ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* ── Title block ── */}
            <div className="detail-fade-up" style={{ animationDelay: '0.05s' }}>
              {/* Breadcrumb row */}
              <div className="flex items-center gap-2.5 text-[11px] font-bold mb-3">
                <span
                  className="uppercase tracking-widest"
                  style={{ color: '#2D6A4F' }}
                >
                  {activity.categoryData?.categoryName || 'Experience'}
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral/30" />
                <span className="flex items-center gap-1" style={{ color: 'rgba(125,90,80,0.5)' }}>
                  <MapPin size={11} /> {farm.location.city}, Sri Lanka
                </span>
              </div>

              {/* Main title */}
              <h1
                className="font-serif font-bold text-dark leading-tight mb-4"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.6rem)' }}
              >
                {activity.customTitle}
              </h1>

              {/* Meta chips row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Rating */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(255,176,0,0.08)', border: '1px solid rgba(255,176,0,0.2)' }}
                >
                  <Star size={14} fill="#FFB000" color="#FFB000" />
                  <span className="text-sm font-bold text-dark">
                    {activity.averageRating || 'New'}
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(125,90,80,0.5)' }}>
                    ({activity.totalReviews})
                  </span>
                </div>

                {/* Duration */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border"
                  style={{ borderColor: 'rgba(125,90,80,0.12)' }}
                >
                  <Clock size={13} style={{ color: 'rgba(125,90,80,0.5)' }} />
                  <span className="text-[12px] font-semibold text-dark/70">{activity.durationHours} hours</span>
                </div>

                {/* Guests */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border"
                  style={{ borderColor: 'rgba(125,90,80,0.12)' }}
                >
                  <Users size={13} style={{ color: 'rgba(125,90,80,0.5)' }} />
                  <span className="text-[12px] font-semibold text-dark/70">Up to {activity.maxParticipants}</span>
                </div>

                {/* Difficulty */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border"
                  style={{ borderColor: 'rgba(125,90,80,0.12)' }}
                >
                  <ShieldCheck size={13} style={{ color: '#74C69D' }} />
                  <span className="text-[12px] font-semibold text-dark/70">{activity.difficulty}</span>
                </div>
              </div>
            </div>

            {/* ── Host card ── */}
            <div
              className="detail-fade-up rounded-2xl overflow-hidden"
              style={{ animationDelay: '0.12s', background: 'linear-gradient(135deg, #fff 0%, #FAF9F6 100%)', border: '1px solid rgba(125,90,80,0.1)' }}
            >
              <div className="flex items-center justify-between p-5">
                {/* Host info */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full overflow-hidden shrink-0"
                    style={{ border: '2.5px solid #fff', boxShadow: '0 3px 12px rgba(45,106,79,0.18)' }}
                  >
                    <img
                      src="https://via.placeholder.com/150"
                      alt="Host"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-dark text-base leading-tight">
                      {farm.farmName}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full"
                        style={{ background: 'linear-gradient(135deg, #2D6A4F, #74C69D)' }}
                      >
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(125,90,80,0.5)' }}>
                        Verified Farmer
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI badge */}
                {aiBadge && (
                  <div
                    className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl"
                    style={{
                      background: aiBadge.color === 'green'
                        ? 'linear-gradient(135deg, rgba(116,198,157,0.12), rgba(45,106,79,0.08))'
                        : 'linear-gradient(135deg, rgba(255,176,0,0.1), rgba(255,176,0,0.04))',
                      border: aiBadge.color === 'green'
                        ? '1px solid rgba(116,198,157,0.3)'
                        : '1px solid rgba(255,176,0,0.25)',
                    }}
                  >
                    <Languages
                      size={16}
                      style={{ color: aiBadge.color === 'green' ? '#2D6A4F' : '#c48a00' }}
                    />
                    <div className="leading-tight">
                      <span
                        className="block text-[11px] font-bold"
                        style={{ color: aiBadge.color === 'green' ? '#2D6A4F' : '#c48a00' }}
                      >
                        {aiBadge.text}
                      </span>
                      <span
                        className="text-[9px] font-medium uppercase tracking-wider"
                        style={{ color: aiBadge.color === 'green' ? 'rgba(45,106,79,0.5)' : 'rgba(196,138,0,0.5)' }}
                      >
                        AI Verified
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Description ── */}
            <div className="detail-fade-up" style={{ animationDelay: '0.18s' }}>
              <h3 className="font-serif font-bold text-dark text-xl mb-3">About this experience</h3>
              <p
                className="leading-loose whitespace-pre-line"
                style={{ color: 'rgba(125,90,80,0.65)', fontSize: '0.95rem' }}
              >
                {activity.customDescription}
              </p>
            </div>

            {/* ── What's Included ── */}
            <div className="detail-fade-up" style={{ animationDelay: '0.24s' }}>
              <h3 className="font-serif font-bold text-dark text-xl mb-4">What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activity.includedItems.map((item: string, i: number) => (
                  <div
                    key={i}
                    className="detail-fade-up flex items-start gap-3 p-4 rounded-2xl bg-white border"
                    style={{
                      animationDelay: `${0.28 + i * 0.07}s`,
                      borderColor: 'rgba(125,90,80,0.1)',
                    }}
                  >
                    {/* Check icon vessel */}
                    <div
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: 'linear-gradient(135deg, rgba(116,198,157,0.2), rgba(45,106,79,0.1))' }}
                    >
                      <Check size={12} color="#2D6A4F" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-dark/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Reviews ── */}
            <div
              className="detail-fade-up pt-8"
              style={{ animationDelay: '0.3s', borderTop: '1px solid rgba(125,90,80,0.1)' }}
            >
              <h3 className="font-serif font-bold text-dark text-xl mb-2 flex items-center gap-2.5">
                <Star size={20} fill="#FFB000" color="#FFB000" />
                {activity.averageRating}
                <span className="text-base font-sans font-medium" style={{ color: 'rgba(125,90,80,0.45)' }}>
                  · {activity.totalReviews} Reviews
                </span>
              </h3>
              <div className="mt-6">
                <ReviewList targetId={activity._id} />
              </div>
            </div>
          </div>

          {/* ─────────────────────────────
              RIGHT — sticky booking card
              ───────────────────────────── */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-6 rounded-[28px] overflow-hidden"
              style={{
                background: 'linear-gradient(175deg, #fff 0%, #FDFBF8 100%)',
                border: '1px solid rgba(125,90,80,0.1)',
                boxShadow: '0 24px 48px -12px rgba(4,31,12,0.14), 0 4px 8px -2px rgba(4,31,12,0.06)',
              }}
            >
              {/* Subtle top accent stripe */}
              <div
                className="h-1 w-full"
                style={{ background: 'linear-gradient(90deg, #2D6A4F, #74C69D, #FFB000)' }}
              />

              <div className="p-6 md:p-7">
                {/* Price row */}
                <div className="flex items-baseline justify-between mb-5">
                  <div>
                    <span className="font-serif font-bold text-dark" style={{ fontSize: '1.75rem' }}>
                      LKR {activity.pricePerPerson.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium ml-1" style={{ color: 'rgba(125,90,80,0.45)' }}>
                      / person
                    </span>
                  </div>
                  {/* Inline rating pill */}
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(255,176,0,0.08)', border: '1px solid rgba(255,176,0,0.18)' }}
                  >
                    <Star size={12} fill="#FFB000" color="#FFB000" />
                    <span className="text-[12px] font-bold text-dark">{activity.averageRating}</span>
                  </div>
                </div>

                {/* Booking form */}
                <div className="mb-5">
                  <BookingForm
                    activityId={activity._id}
                    pricePerPerson={activity.pricePerPerson}
                    maxParticipants={activity.maxParticipants}
                  />
                </div>

                {/* Divider */}
                <div
                  className="my-4"
                  style={{ borderTop: '1px solid rgba(125,90,80,0.08)' }}
                />

                {/* Trust signals */}
                <div className="text-center">
                  <p className="text-[11px] font-medium mb-3" style={{ color: 'rgba(125,90,80,0.45)' }}>
                    Free cancellation up to 24 hours before
                  </p>
                  {/* Payment icons */}
                  <div className="flex items-center justify-center gap-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                      className="h-4 opacity-40"
                      alt="PayPal"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                      className="h-4 opacity-40"
                      alt="Mastercard"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;