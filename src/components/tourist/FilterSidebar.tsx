import React, { useState } from 'react';
import { Filter, X, MapPin, Navigation, Loader2, Star, Check } from 'lucide-react';
import { geocodeLocation } from '../../services/searchService';

interface FilterSidebarProps {
  filters: any;
  categories: any[];
  onFilterChange: (name: string, value: any) => void;
  onLocationUpdate: (lat: number, lng: number, radius: number) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  categories,
  onFilterChange,
  onLocationUpdate,
  onClear,
  isOpen,
  onClose,
}) => {
  const [locationInput, setLocationInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleLocationSearch = async () => {
    if (!locationInput.trim()) return;
    setIsGeocoding(true);
    try {
      let searchQuery = locationInput;
      if (!searchQuery.toLowerCase().includes('sri lanka')) {
        searchQuery = `${searchQuery}, Sri Lanka`;
      }
      const res = await geocodeLocation(searchQuery);

      if (res.data) {
        onLocationUpdate(res.data.lat, res.data.lng, filters.radius || 10);
        alert(`Location found! Showing results near ${locationInput}.`);
      } else {
        alert('Location not found in Sri Lanka. Please try a major city.');
      }
    } catch (error) {
      console.error(error);
      alert('Error finding location');
    } finally {
      setIsGeocoding(false);
    }
  };

  /* ─── shared micro-interaction classes ─── */
  const sectionDivider = 'border-t border-neutral/10';

  return (
    <>
      {/* ════════════════════════════════════════
          Mobile Backdrop — frosted glass overlay
          ════════════════════════════════════════ */}
      <div
        className={`
          fixed inset-0 z-30 transition-all duration-300 md:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(4,31,12,0.35)' }}
        onClick={onClose}
      />

      {/* ════════════════════════════════════════
          Sidebar Shell
          ════════════════════════════════════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-80 transition-transform duration-300 ease-out
          md:relative md:w-72 md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ─── Inner Card ─── */}
        <div
          className="
            h-full md:h-auto overflow-y-auto
            bg-bg-white md:rounded-4xl md:border md:border-neutral/12
            shadow-2xl md:shadow-lg
            font-sans
          "
          style={{
            /* Linen white with a very subtle warm noise feel via gradient */
            background: 'linear-gradient(175deg, #FAF9F6 0%, #F5F0EB 100%)',
          }}
        >
          {/* ──────────────────────────────────
              Glassmorphism top banner (mobile only)
              ────────────────────────────────── */}
          <div
            className="md:hidden px-5 pt-5 pb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(45,106,79,0.12) 0%, rgba(255,176,0,0.06) 100%)',
              borderBottom: '1px solid rgba(45,106,79,0.08)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-dark flex items-center gap-2">
                <Filter size={18} className="text-primary" />
                Filters
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-primary/8 text-neutral transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ──────────────────────────────────
              Desktop Header
              ────────────────────────────────── */}
          <div className="hidden md:flex items-center justify-between px-6 pt-7 pb-2">
            <h3 className="font-serif text-lg font-bold text-dark flex items-center gap-2">
              <Filter size={18} className="text-primary" />
              Filters
            </h3>
            <button
              onClick={() => {
                setLocationInput('');
                onClear();
              }}
              className="text-[11px] font-bold uppercase tracking-widest text-neutral/60 hover:text-primary transition-colors duration-200"
            >
              Reset
            </button>
          </div>

          {/* ══════════════════════════════════════
              Filter Sections
              ══════════════════════════════════════ */}
          <div className="px-5 md:px-6 pb-6 pt-4 md:pt-2 space-y-6">

            {/* ─────────────────────
                LOCATION
                ───────────────────── */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-neutral/55 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin size={12} className="text-primary/70" />
                Location
              </h4>

              {/* Search input row */}
              <div className="relative group">
                <input
                  placeholder="City (e.g. Ella)"
                  className="
                    w-full pl-4 pr-12 py-3 rounded-2xl text-sm font-sans font-medium text-dark
                    bg-white border border-neutral/15
                    placeholder-neutral/40
                    focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40
                    transition-all duration-200
                  "
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                />
                <button
                  onClick={handleLocationSearch}
                  disabled={isGeocoding}
                  className="
                    absolute right-1.5 top-1.5 w-9 h-9
                    flex items-center justify-center rounded-xl
                    bg-primary text-white border border-primary
                    hover:bg-dark hover:border-dark
                    disabled:opacity-60
                    shadow-sm transition-all duration-200 active:scale-95
                  "
                >
                  {isGeocoding ? (
                    <Loader2 className="animate-spin text-white" size={15} />
                  ) : (
                    <Navigation size={15} />
                  )}
                </button>
              </div>

              {/* Distance radius — appears when location is set */}
              {(filters.lat || locationInput) && (
                <div
                  className="rounded-2xl p-4 mt-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,106,79,0.06) 0%, rgba(116,198,157,0.04) 100%)',
                    border: '1px solid rgba(45,106,79,0.12)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold text-dark/60 uppercase tracking-wider">
                      Distance
                    </span>
                    <span
                      className="text-[11px] font-bold text-primary bg-white px-2.5 py-0.5 rounded-lg shadow-sm border border-primary/15"
                    >
                      {filters.radius || 10} km
                    </span>
                  </div>

                  {/* Custom-styled range slider */}
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={filters.radius || 10}
                    onChange={(e) => onFilterChange('radius', e.target.value)}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      accentColor: '#2D6A4F',
                      background: `linear-gradient(to right, #2D6A4F 0%, #2D6A4F ${((filters.radius || 10) - 5) / 95 * 100}%, #D1C5BE ${((filters.radius || 10) - 5) / 95 * 100}%, #D1C5BE 100%)`,
                    }}
                  />

                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] font-semibold text-neutral/40 uppercase tracking-wider">Walking</span>
                    <span className="text-[9px] font-semibold text-neutral/40 uppercase tracking-wider">Driving</span>
                  </div>
                </div>
              )}
            </div>

            {/* ─────────────────────
                PRICE RANGE
                ───────────────────── */}
            <div className={`${sectionDivider} pt-6 space-y-3`}>
              <h4 className="text-[10px] font-bold text-neutral/55 uppercase tracking-widest">
                Price <span className="font-normal normal-case text-neutral/35">(LKR)</span>
              </h4>

              <div className="flex items-center gap-2.5">
                {/* Min */}
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral/40 uppercase tracking-wider">
                    Min
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    className="
                      w-full pl-9 pr-2 py-2.5 rounded-2xl text-sm font-medium text-dark
                      bg-white border border-neutral/15 placeholder-neutral/30
                      focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40
                      transition-all duration-200
                    "
                    value={filters.priceMin || ''}
                    onChange={(e) => onFilterChange('priceMin', e.target.value)}
                  />
                </div>

                {/* Connector dash */}
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral/25" />
                  <div className="w-4 h-[1.5px] bg-neutral/25 rounded-full" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral/25" />
                </div>

                {/* Max */}
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral/40 uppercase tracking-wider">
                    Max
                  </span>
                  <input
                    type="number"
                    placeholder="∞"
                    className="
                      w-full pl-9 pr-2 py-2.5 rounded-2xl text-sm font-medium text-dark
                      bg-white border border-neutral/15 placeholder-neutral/30
                      focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40
                      transition-all duration-200
                    "
                    value={filters.priceMax || ''}
                    onChange={(e) => onFilterChange('priceMax', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ─────────────────────
                CATEGORY
                ───────────────────── */}
            <div className={`${sectionDivider} pt-6 space-y-3`}>
              <h4 className="text-[10px] font-bold text-neutral/55 uppercase tracking-widest">
                Category
              </h4>

              <div className="flex flex-col gap-1">
                {/* All Categories */}
                <button
                  onClick={() => onFilterChange('category', '')}
                  className={`
                    w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium
                    flex items-center justify-between
                    transition-all duration-200 active:scale-[0.97]
                    ${!filters.category
                      ? 'bg-primary text-white shadow-md'
                      : 'text-dark/60 hover:bg-primary/6 hover:text-primary'
                    }
                  `}
                  style={
                    !filters.category
                      ? { boxShadow: '0 4px 14px rgba(45,106,79,0.28)' }
                      : {}
                  }
                >
                  All Categories
                  {!filters.category && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}
                </button>

                {/* Dynamic categories */}
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => onFilterChange('category', cat._id)}
                    className={`
                      w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium
                      flex items-center justify-between
                      transition-all duration-200 active:scale-[0.97]
                      ${filters.category === cat._id
                        ? 'bg-primary text-white shadow-md'
                        : 'text-dark/60 hover:bg-primary/6 hover:text-primary'
                      }
                    `}
                    style={
                      filters.category === cat._id
                        ? { boxShadow: '0 4px 14px rgba(45,106,79,0.28)' }
                        : {}
                    }
                  >
                    {cat.categoryName}
                    {filters.category === cat._id && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ─────────────────────
                GUEST RATING
                ───────────────────── */}
            <div className={`${sectionDivider} pt-6 space-y-3`}>
              <h4 className="text-[10px] font-bold text-neutral/55 uppercase tracking-widest">
                Guest Rating
              </h4>

              <div className="space-y-1.5">
                {[4, 3, 2].map((rating) => {
                  const isActive = filters.rating === rating.toString();
                  return (
                    <label
                      key={rating}
                      className={`
                        flex items-center px-3 py-2.5 rounded-xl cursor-pointer
                        transition-all duration-200 active:scale-[0.97]
                        ${isActive
                          ? 'border border-primary/30'
                          : 'border border-transparent hover:bg-primary/5'
                        }
                      `}
                      style={
                        isActive
                          ? { background: 'linear-gradient(135deg, rgba(45,106,79,0.07) 0%, rgba(116,198,157,0.05) 100%)' }
                          : {}
                      }
                    >
                      {/* Hidden native radio */}
                      <input
                        type="radio"
                        name="rating"
                        className="sr-only"
                        checked={isActive}
                        onChange={() => onFilterChange('rating', rating.toString())}
                      />

                      {/* Custom radio circle */}
                      <div
                        className={`
                          w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0
                          transition-all duration-200
                          ${isActive
                            ? 'border-primary bg-primary'
                            : 'border-neutral/30 bg-white'
                          }
                        `}
                      >
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      {/* Label + stars */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-dark/70">{rating}+</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={
                                i < rating
                                  ? 'text-secondary'
                                  : 'text-neutral/25'
                              }
                              fill={i < rating ? '#FFB000' : 'none'}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-neutral/40 font-medium ml-0.5">& above</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ─────────────────────
                MOBILE RESET BUTTON
                ───────────────────── */}
            <div className="md:hidden pt-3">
              <button
                onClick={() => {
                  setLocationInput('');
                  onClear();
                }}
                className="
                  w-full py-3 rounded-2xl text-sm font-bold
                  text-neutral hover:text-white
                  border border-neutral/25 hover:border-neutral hover:bg-neutral
                  transition-all duration-200 active:scale-[0.97]
                "
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;