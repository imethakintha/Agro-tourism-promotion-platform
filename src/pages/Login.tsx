import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import {
  Mail, Lock, Loader2, AlertCircle, Sprout, ArrowRight, Leaf, Star
} from 'lucide-react';

/* ═════════════════════════════════════════════
   LOGIN PAGE
   ═════════════════════════════════════════════ */
const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login }   = useContext(AuthContext);
  const navigate    = useNavigate();
  const currentYear = new Date().getFullYear();

  /* ── handlers (unchanged logic) ── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await authService.login(formData);
      if (response.success) {
        const user = response.data.user;
        login(response.data.token, user);
        switch (user.role) {
          case 'Tourist':           navigate('/'); break;
          case 'Farmer':            navigate('/dashboard'); break;
          case 'TourGuide':         navigate('/dashboard/guide'); break;
          case 'TransportProvider': navigate('/dashboard/transport'); break;
          case 'Administrator':     navigate('/admin'); break;
          default:                  navigate('/'); break;
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── render ── */
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans overflow-hidden">

      {/* ╔══════════════════════════════════════════
          ║  LEFT PANEL  — brand / atmosphere
          ║  On mobile this becomes a slim top strip.
          ╚══════════════════════════════════════════ */}
      <aside className="relative md:w-5/12 md:min-h-screen
                        h-48 sm:h-56 md:h-auto
                        shrink-0 overflow-hidden">

        {/* background image */}
        <img
          src="https://media.licdn.com/dms/image/v2/D5612AQFoYt7CgaZmww/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1705234174035?e=2147483647&v=beta&t=qdjd-HxE3rt2zxcQsYr-1XHiFzizgPN3HkVRLyQG12A"
          alt="Sri Lankan Tea Plantation"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* multi-layer overlay — mirrors the Home hero treatment */}
        <div className="absolute inset-0 bg-linear-to-b from-black/25 via-transparent to-black/55" />
        <div className="absolute inset-0 bg-linear-to-br from-primary/80 via-primary/50 to-primary/30" />
        <div className="absolute top-0 left-0 right-0 h-28 bg-linear-to-b from-black/35 to-transparent" />

        {/* content */}
        <div className="relative z-10 h-full flex flex-col justify-between
                        px-6 py-5 md:px-10 md:py-10 lg:px-14 lg:py-14">

          {/* logo */}
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/12 border border-white/20 rounded-xl
                            flex items-center justify-center">
              <Sprout size={20} className="text-white" />
            </div>
            <span className="text-xl font-serif font-bold text-white tracking-[-0.02em]">
              Agro<span className="text-secondary">LK</span>
            </span>
          </Link>

          {/* mid — headline (hidden on mobile strip) */}
          <div className="hidden md:block">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm
                             border border-white/20 text-white text-xs font-semibold
                             uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <Leaf size={12} className="text-secondary" />
              Welcome Back
            </span>

            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white
                           leading-[1.1] tracking-[-0.02em] mb-4">
              Your journey<br />
              <span className="text-secondary">awaits</span>
            </h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Sign in to access your personalised agro-tourism experiences,
              saved favourites, and upcoming farm stays.
            </p>
          </div>

          {/* bottom — trust proof (hidden on mobile strip) */}
          <div className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-1.5 bg-white/8 backdrop-blur-sm
                            border border-white/15 rounded-xl px-3.5 py-2">
              <Star size={13} className="fill-secondary text-secondary" />
              <span className="text-white text-xs font-semibold">4.8 Rating</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/8 backdrop-blur-sm
                            border border-white/15 rounded-xl px-3.5 py-2">
              <Sprout size={13} className="text-subtle-accent" />
              <span className="text-white text-xs font-semibold">110+ Farms</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ╔══════════════════════════════════════════
          ║  RIGHT PANEL  — form card
          ╚══════════════════════════════════════════ */}
      <main className="relative md:w-7/12 flex-1 bg-bg-white
                       flex flex-col items-center justify-center
                       px-4 py-10 sm:px-6 md:px-10 lg:px-16">

        {/* very faint ambient orb so the white panel isn't flat */}
        <div className="absolute top-[-20%] right-[-15%] w-100 h-100
                        bg-primary rounded-full blur-[140px] opacity-[0.04]
                        pointer-events-none" />

        {/* card */}
        <div className="relative z-10 w-full max-w-105 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100
                          shadow-xl shadow-black/6 px-7 py-8 sm:px-8 sm:py-10">

            {/* card header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center
                              w-11 h-11 rounded-2xl bg-primary/8 border border-primary/15
                              mb-4">
                <Sprout size={22} className="text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-[-0.01em]">
                Welcome Back
              </h2>
              <p className="text-slate-400 text-sm mt-1.5">
                Access your personalised agro-tourism journey
              </p>
            </div>

            {/* error banner */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl
                              px-4 py-3 mb-5 flex items-start gap-3">
                <AlertCircle size={17} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2
                               text-slate-300 group-focus-within:text-primary
                               transition-colors duration-300 pointer-events-none"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200
                               rounded-xl text-sm font-medium text-slate-700
                               placeholder-slate-300
                               focus:outline-none focus:bg-white
                               focus:ring-2 focus:ring-primary/20 focus:border-primary
                               transition-all duration-300"
                  />
                </div>
              </div>

              {/* password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-primary/70 hover:text-secondary
                               transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2
                               text-slate-300 group-focus-within:text-primary
                               transition-colors duration-300 pointer-events-none"
                  />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200
                               rounded-xl text-sm font-medium text-slate-700
                               placeholder-slate-300
                               focus:outline-none focus:bg-white
                               focus:ring-2 focus:ring-primary/20 focus:border-primary
                               transition-all duration-300"
                  />
                </div>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex items-center justify-center gap-2
                           bg-primary text-white text-sm font-bold
                           px-6 py-3 rounded-xl mt-1
                           shadow-md shadow-primary/30
                           hover:shadow-lg hover:shadow-primary/40
                           hover:-translate-y-0.5
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
                           disabled:opacity-60 disabled:cursor-not-allowed
                           disabled:hover:translate-y-0 disabled:hover:shadow-md
                           transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Log In
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </>
                )}
              </button>
            </form>

            {/* card footer */}
            <div className="mt-7 pt-5 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-primary hover:text-secondary transition-colors duration-200"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          {/* below-card copyright */}
          <p className="text-center text-slate-300 text-xs mt-5">
            © {currentYear} AgroLK · Authentic Rural Experiences
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;