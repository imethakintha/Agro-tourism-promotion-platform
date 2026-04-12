import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, Sprout, Search, User as UserIcon, LogOut, Settings,
  Heart, Calendar, Map, Navigation, DollarSign, Camera, Sparkles
} from 'lucide-react';
import { useAuth } from '../src/context/AuthContext';
import CurrencySelector from '../src/components/common/CurrencySelector';

/* ─────────────────────────────────────────────
   DESKTOP NAV LINK
   ───────────────────────────────────────────── */
const NavLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="relative px-4 py-2 text-sm font-semibold text-slate-500
               hover:text-primary transition-colors duration-300 rounded-full
               hover:bg-primary/6"
  >
    {label}
  </Link>
);

/* ─────────────────────────────────────────────
   DESKTOP ICON BUTTON  (role toolbar)
   ───────────────────────────────────────────── */
const IconButton = ({
  to,
  icon,
  title
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
}) => (
  <Link
    to={to}
    title={title}
    className="relative p-2 text-slate-400 hover:text-primary
               hover:bg-white hover:shadow-sm rounded-full
               transition-all duration-300 group"
  >
    {icon}
    {/* tooltip */}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                     whitespace-nowrap bg-dark text-white text-xs font-semibold
                     px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100
                     pointer-events-none transition-opacity duration-200">
      {title}
    </span>
  </Link>
);

/* ─────────────────────────────────────────────
   MOBILE NAV LINK
   ───────────────────────────────────────────── */
const MobileNavLink = ({
  to,
  children,
  onClick
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-3 text-base font-semibold text-slate-600
               hover:text-primary hover:bg-primary/6 rounded-xl
               transition-colors duration-200"
  >
    {children}
  </Link>
);

/* ─────────────────────────────────────────────
   MOBILE ACTION BUTTON  (grid tile)
   ───────────────────────────────────────────── */
const MobileActionButton = ({
  to,
  icon,
  label
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center gap-1.5
               bg-white border border-slate-100 p-3 rounded-2xl
               text-slate-500 hover:border-primary/30 hover:bg-primary/5
               hover:text-primary shadow-sm hover:shadow-md
               transition-all duration-300"
  >
    {icon}
    <span className="text-xs font-bold">{label}</span>
  </Link>
);

/* ═════════════════════════════════════════════
   HEADER
   ═════════════════════════════════════════════ */
const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled]             = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const { user, logout, isAuthenticated }       = useAuth();
  const navigate                                = useNavigate();

  /* ── scroll listener (unchanged) ── */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── search handler (unchanged) ── */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/activities?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  /* ── render ── */
  return (
    <header
      className={`sticky top-0 z-50 w-full font-sans transition-all duration-500
                  ${isScrolled
                    ? 'bg-bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm py-2'
                    : 'bg-bg-white border-b border-transparent py-3'
                  }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">

          {/* ╔══ LOGO ══╗ */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            {/* icon mark */}
            <div className="w-10 h-10 bg-primary/8 border border-primary/15 rounded-xl
                            flex items-center justify-center
                            group-hover:bg-primary group-hover:border-primary
                            transition-all duration-300">
              <Sprout size={22} className="text-primary group-hover:text-white transition-colors duration-300" />
            </div>
            {/* wordmark */}
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-serif font-bold text-slate-800 tracking-[-0.02em]">
                Agro<span className="text-secondary">LK</span>
              </span>
              <span className="text-[9px] font-bold text-neutral/60 uppercase tracking-[0.22em] mt-0.5">
                Eco Tourism
              </span>
            </div>
          </Link>

          {/* ╔══ DESKTOP SEARCH ══╗ */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input
                type="text"
                placeholder="Search farms, activities, guides…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200
                           rounded-full text-sm font-medium text-slate-700
                           placeholder-slate-400
                           focus:outline-none focus:bg-white
                           focus:ring-2 focus:ring-primary/20 focus:border-primary
                           transition-all duration-300"
              />
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2
                           text-slate-400 group-focus-within:text-primary
                           transition-colors duration-300"
              />
            </form>
          </div>

          {/* ╔══ DESKTOP NAV ══╗ */}
          <nav className="hidden md:flex items-center gap-1">

            {/* currency selector */}
            <div className="mr-3">
              <CurrencySelector />
            </div>

            <NavLink to="/"          label="Home" />
            <NavLink to="/activities" label="Activities" />

            {/* ── authenticated ── */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-slate-200">

                {/* AI Lens pill */}
                <Link
                  to="/farm-assistant"
                  className="group flex items-center gap-1.5
                             bg-linear-to-r from-primary to-subtle-accent
                             text-black text-xs font-bold px-4 py-2 rounded-full
                             shadow-md shadow-primary/25
                             hover:shadow-lg hover:shadow-primary/35
                             hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Camera size={14} />
                  <span>AI Lens</span>
                </Link>

                {/* role icon toolbar */}
                <div className="flex items-center bg-slate-50 border border-slate-200
                                rounded-full px-2.5 py-1.5 gap-0.5 ml-1">

                  {user?.role === 'Tourist' && (
                    <>
                      <IconButton to="/favorites"   icon={<Heart size={17} />}    title="Favorites" />
                      <IconButton to="/my-bookings" icon={<Calendar size={17} />} title="My Bookings" />
                    </>
                  )}

                  {user?.role === 'Farmer' && (
                    <>
                      <IconButton to="/dashboard"          icon={<Sprout size={17} />}    title="My Farm" />
                      <IconButton to="/dashboard/bookings" icon={<Calendar size={17} />} title="Bookings" />
                      <IconButton to="/earnings"           icon={<DollarSign size={17} />} title="Earnings" />
                    </>
                  )}

                  {user?.role === 'TourGuide' && (
                    <>
                      <IconButton to="/dashboard/guide" icon={<Map size={17} />}        title="Guide Jobs" />
                      <IconButton to="/earnings"        icon={<DollarSign size={17} />} title="Earnings" />
                    </>
                  )}

                  {user?.role === 'TransportProvider' && (
                    <>
                      <IconButton to="/dashboard/transport" icon={<Navigation size={17} />} title="Trips" />
                      <IconButton to="/earnings"            icon={<DollarSign size={17} />} title="Earnings" />
                    </>
                  )}

                  {user?.role === 'Administrator' && (
                    <IconButton to="/admin" icon={<Settings size={17} />} title="Admin Panel" />
                  )}
                </div>

                {/* profile cluster */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 ml-1 p-1 pr-3 rounded-full
                             hover:bg-slate-50 transition-colors duration-200"
                >
                  {/* avatar */}
                  <div className="w-9 h-9 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 shrink-0">
                    {user?.profilePic ? (
                      <img
                        src={`http://localhost:5000${user.profilePic}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <UserIcon size={18} className="text-primary" />
                      </div>
                    )}
                  </div>

                  {/* name + role (desktop only) */}
                  <div className="hidden lg:flex flex-col leading-none">
                    <span className="text-xs font-bold text-slate-700">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-semibold text-neutral/55 uppercase tracking-[0.15em] mt-0.5">
                      {user?.role}
                    </span>
                  </div>
                </Link>

                {/* logout */}
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50
                             rounded-full transition-all duration-200"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              /* ── guest ── */
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-500 hover:text-primary
                             transition-colors duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white text-sm font-bold
                             px-5 py-2 rounded-full
                             shadow-md shadow-primary/30
                             hover:shadow-lg hover:shadow-primary/40
                             hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* ╔══ MOBILE HAMBURGER ══╗ */}
          <button
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100
                       rounded-xl transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════
          ║  MOBILE DRAWER
          ╚══════════════════════════════════════════ */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full
                        bg-white/95 backdrop-blur-xl border-t border-slate-100
                        shadow-2xl shadow-black/8 rounded-b-3xl overflow-hidden
                        animate-fade-in z-50">
          <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">

            {/* mobile search */}
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200
                           rounded-xl text-sm font-medium text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-primary/20
                           focus:border-primary transition-all duration-200"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </form>

            {/* nav links */}
            <div className="flex flex-col gap-0.5">
              <MobileNavLink to="/"            onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/activities"  onClick={() => setIsMobileMenuOpen(false)}>Activities</MobileNavLink>
              <MobileNavLink to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)}>How It Works</MobileNavLink>
            </div>

            {/* ── authenticated mobile ── */}
            {isAuthenticated && user ? (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-4">

                {/* user card */}
                <div className="flex items-center gap-3 bg-primary/6 border border-primary/12
                                p-3 rounded-2xl">
                  <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/20
                                  flex items-center justify-center overflow-hidden shrink-0">
                    {user.profilePic ? (
                      <img
                        src={`http://localhost:5000${user.profilePic}`}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={20} className="text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                    <p className="text-xs font-semibold text-primary/70 uppercase tracking-[0.12em]">{user.role}</p>
                  </div>
                </div>

                {/* action grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  <MobileActionButton to="/farm-assistant" icon={<Camera size={18} />} label="AI Lens" />

                  {user.role === 'Tourist' && (
                    <>
                      <MobileActionButton to="/favorites"   icon={<Heart size={18} />}    label="Favorites" />
                      <MobileActionButton to="/my-bookings" icon={<Calendar size={18} />} label="Bookings" />
                    </>
                  )}

                  {user.role === 'Farmer' && (
                    <>
                      <MobileActionButton to="/dashboard"          icon={<Sprout size={18} />}    label="My Farm" />
                      <MobileActionButton to="/dashboard/bookings" icon={<Calendar size={18} />} label="Bookings" />
                      <MobileActionButton to="/earnings"           icon={<DollarSign size={18} />} label="Earnings" />
                    </>
                  )}

                  {user.role === 'TourGuide' && (
                    <>
                      <MobileActionButton to="/dashboard/guide" icon={<Map size={18} />}        label="Guide Jobs" />
                      <MobileActionButton to="/earnings"        icon={<DollarSign size={18} />} label="Earnings" />
                    </>
                  )}

                  {user.role === 'TransportProvider' && (
                    <>
                      <MobileActionButton to="/dashboard/transport" icon={<Navigation size={18} />} label="Trips" />
                      <MobileActionButton to="/earnings"            icon={<DollarSign size={18} />} label="Earnings" />
                    </>
                  )}

                  {user.role === 'Administrator' && (
                    <MobileActionButton to="/admin" icon={<Settings size={18} />} label="Admin" />
                  )}

                  <MobileActionButton to="/profile" icon={<Settings size={18} />} label="Profile" />
                </div>

                {/* logout */}
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2
                             text-red-500 font-bold text-sm
                             bg-red-50 border border-red-100
                             py-3 rounded-xl
                             hover:bg-red-100 hover:border-red-200
                             transition-all duration-200"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            ) : (
              /* ── guest mobile ── */
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-primary
                             border border-primary/25 rounded-xl
                             hover:bg-primary/6 transition-colors duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-white
                             bg-primary rounded-xl
                             shadow-md shadow-primary/30
                             hover:shadow-lg hover:shadow-primary/40
                             transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;