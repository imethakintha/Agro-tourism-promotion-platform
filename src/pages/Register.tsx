import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import {
  User, Tractor, Map, Bus, Loader2, AlertCircle,
  ArrowRight, CheckCircle2, Sprout, Wand2, Leaf, ChevronDown
} from 'lucide-react';

/* ═════════════════════════════════════════════
   REGISTER PAGE
   ═════════════════════════════════════════════ */
const Register: React.FC = () => {
  const [step, setStep]       = useState(1);
  const [role, setRole]       = useState('Tourist');
  const [error, setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate              = useNavigate();
  const currentYear           = new Date().getFullYear();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    countryOfResidence: 'Sri Lanka'
  });

  /* ── role definitions ── */
  const roles = [
    { id: 'Tourist',           label: 'Tourist',         icon: User,    desc: 'Book experiences & explore rural life.' },
    { id: 'Farmer',            label: 'Farmer Host',     icon: Tractor, desc: 'List your farm & host guests.' },
    { id: 'TourGuide',         label: 'Tour Guide',      icon: Map,     desc: 'Offer local guidance & tours.' },
    { id: 'TransportProvider', label: 'Transport',       icon: Bus,     desc: 'Provide travel logistics.' },
  ];

  const countries = [
    'France','Germany','China','Japan','India','Australia','USA','UK',
    'Korea','Russia','Netherlands','Canada','Italy','Poland',
    'Sri Lanka','Maldives','Other'
  ];

  /* ── handlers (all logic unchanged) ── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    if (selectedRole === 'Farmer') {
      setFormData(prev => ({ ...prev, countryOfResidence: 'Sri Lanka' }));
    }
    setStep(2);
  };

  const magicFill = () => {
    const timeStamp   = new Date().getTime().toString().slice(-4);
    const isTourist   = role === 'Tourist';
    setFormData({
      fullName:            isTourist ? 'Test Tourist 16'        : `TestUser${timeStamp}`,
      email:               `${role.toLowerCase()}test${timeStamp}@yopmail.com`,
      password:            'password123',
      confirmPassword:     'password123',
      phoneNumber:         isTourist ? '+33612345678'           : '+94771234567',
      countryOfResidence:  isTourist ? 'Germany'                : 'Sri Lanka'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        countryOfResidence: formData.countryOfResidence,
        role
      });
      if (response.success) {
        alert('Registration successful! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── shared input class ── */
  const inputCls = `w-full px-4 py-3 bg-slate-50 border border-slate-200
                    rounded-xl text-sm font-medium text-slate-700
                    placeholder-slate-300
                    focus:outline-none focus:bg-white
                    focus:ring-2 focus:ring-primary/20 focus:border-primary
                    transition-all duration-300`;

  /* ── render ── */
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans overflow-hidden">

      {/* ╔══════════════════════════════════════════
          ║  LEFT PANEL  — form (takes more width
          ║  here because step 2 has many fields)
          ╚══════════════════════════════════════════ */}
      <main className="relative md:w-7/12 flex-1 bg-bg-white
                       flex flex-col items-center justify-center
                       px-4 py-10 sm:px-6 md:px-8 lg:px-12">

        {/* faint ambient orb */}
        <div className="absolute bottom-[-18%] left-[-12%] w-105 h-105
                        bg-primary rounded-full blur-[140px] opacity-[0.04]
                        pointer-events-none" />

        {/* card */}
        <div className="relative z-10 w-full max-w-170 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100
                          shadow-xl shadow-black/6 px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">

            {/* card header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center
                              w-11 h-11 rounded-2xl bg-primary/8 border border-primary/15 mb-4">
                <Sprout size={22} className="text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-[-0.01em]">
                Join the Community
              </h2>
              <p className="text-slate-400 text-sm mt-1.5">
                Start your sustainable journey with AgroLK
              </p>
            </div>

            {/* ── stepper ── */}
            <div className="flex items-center justify-center mb-8">
              {/* step 1 node */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2
                              transition-all duration-300 shrink-0
                              ${step >= 1
                                ? 'border-primary bg-primary text-white shadow-md shadow-primary/30'
                                : 'border-slate-200 text-slate-400 bg-white'}`}>
                {step > 1
                  ? <CheckCircle2 size={17} />
                  : <span className="text-xs font-bold">1</span>
                }
              </div>
              <span className={`ml-2 text-xs font-bold uppercase tracking-wider
                                ${step >= 1 ? 'text-primary' : 'text-slate-300'}`}>
                Role
              </span>

              {/* connecting line */}
              <div className="relative mx-4 h-0.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                <div className={`absolute inset-y-0 left-0 h-full bg-primary rounded-full
                                 transition-all duration-500 ease-out
                                 ${step >= 2 ? 'w-full' : 'w-0'}`} />
              </div>

              {/* step 2 node */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2
                              transition-all duration-300 shrink-0
                              ${step >= 2
                                ? 'border-primary bg-primary text-white shadow-md shadow-primary/30'
                                : 'border-slate-200 text-slate-400 bg-white'}`}>
                <span className="text-xs font-bold">2</span>
              </div>
              <span className={`ml-2 text-xs font-bold uppercase tracking-wider
                                ${step >= 2 ? 'text-primary' : 'text-slate-300'}`}>
                Details
              </span>
            </div>

            {/* error banner */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl
                              px-4 py-3 mb-6 flex items-start gap-3">
                <AlertCircle size={17} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* ════════════════════════════════════
                STEP 1 — role picker
                ════════════════════════════════════ */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                {roles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className="group relative cursor-pointer bg-white rounded-3xl border border-slate-100
                                 shadow-sm hover:shadow-lg hover:shadow-primary/8
                                 hover:-translate-y-1 hover:border-primary/30
                                 transition-all duration-400 overflow-hidden"
                    >
                      {/* decorative accent blob — same pattern as Home rec cards */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/4 rounded-bl-full
                                      -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-500" />

                      <div className="relative z-10 p-5">
                        {/* icon circle */}
                        <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/12
                                        flex items-center justify-center mb-4
                                        group-hover:bg-primary group-hover:border-primary
                                        transition-all duration-300">
                          <Icon size={22} className="text-primary group-hover:text-white transition-colors duration-300" />
                        </div>

                        <h3 className="font-serif font-bold text-base text-slate-800 mb-1
                                       group-hover:text-primary transition-colors duration-300">
                          {r.label}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {r.desc}
                        </p>

                        {/* arrow hint */}
                        <div className="mt-4 flex items-center gap-1 text-primary/40
                                        group-hover:text-primary group-hover:gap-2
                                        transition-all duration-300">
                          <span className="text-xs font-bold">Select</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ════════════════════════════════════
                STEP 2 — details form
                ════════════════════════════════════ */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-fade-in">

                {/* magic fill + role confirmation row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center
                                justify-between gap-3">

                  {/* role confirmation pill */}
                  <div className="flex items-center gap-3 bg-primary/6 border border-primary/12
                                  rounded-xl px-4 py-2.5">
                    {(() => { const Icon = roles.find(r => r.id === role)?.icon || Sprout; return (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15
                                      flex items-center justify-center">
                        <Icon size={16} className="text-primary" />
                      </div>
                    ); })()}
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Registering as
                      </span>
                      <span className="text-sm font-bold text-primary mt-0.5">
                        {roles.find(r => r.id === role)?.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="ml-3 text-xs font-semibold text-slate-400
                                 hover:text-secondary transition-colors duration-200"
                    >
                      Change
                    </button>
                  </div>

                  {/* magic fill */}
                  <button
                    type="button"
                    onClick={magicFill}
                    className="flex items-center gap-1.5 px-3 py-1.5
                               bg-slate-50 border border-slate-200 rounded-lg
                               text-xs font-bold text-slate-400
                               hover:bg-slate-100 hover:text-slate-600
                               transition-all duration-200"
                  >
                    <Wand2 size={12} /> Fill Data
                  </button>
                </div>

                {/* form grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* full name — spans both cols */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>

                  {/* email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>

                  {/* phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      placeholder="+94 77 123 4567"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>

                  {/* country — only for non-Farmers, spans both */}
                  {role !== 'Farmer' && (
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                        Country of Residence
                      </label>
                      <div className="relative">
                        <select
                          name="countryOfResidence"
                          value={formData.countryOfResidence}
                          onChange={handleChange}
                          className={`${inputCls} appearance-none cursor-pointer pr-10`}
                        >
                          {countries.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-4 top-1/2 -translate-y-1/2
                                     text-slate-400 pointer-events-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>

                  {/* confirm password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* terms checkbox */}
                <label className="flex items-start gap-3 p-3 rounded-xl
                                  hover:bg-slate-50 cursor-pointer transition-colors duration-200">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary
                               focus:ring-primary/20 cursor-pointer accent-primary"
                  />
                  <span className="text-sm text-slate-500 leading-relaxed">
                    I agree to the{' '}
                    <span className="font-bold text-primary hover:text-secondary transition-colors">
                      Terms of Service
                    </span>
                    {' '}and{' '}
                    <span className="font-bold text-primary hover:text-secondary transition-colors">
                      Privacy Policy
                    </span>.
                  </span>
                </label>

                {/* submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex items-center justify-center gap-2
                             bg-primary text-white text-sm font-bold
                             px-6 py-3.5 rounded-xl
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
                      Creating Account…
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* card footer */}
            <div className="mt-7 pt-5 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-primary hover:text-secondary transition-colors duration-200"
                >
                  Log In
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

      {/* ╔══════════════════════════════════════════
          ║  RIGHT PANEL  — atmosphere
          ║  Flipped vs Login so the two auth pages
          ║  feel like mirror bookends.
          ║  Collapses to a slim bottom strip on mobile.
          ╚══════════════════════════════════════════ */}
      <aside className="relative md:w-5/12 md:min-h-screen
                        h-44 sm:h-52 md:h-auto
                        shrink-0 overflow-hidden
                        order-first md:order-last">

        {/* background image */}
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070&auto=format&fit=crop"
          alt="Green Fields"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* multi-layer overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/25 via-transparent to-black/55" />
        <div className="absolute inset-0 bg-linear-to-bl from-primary/75 via-primary/45 to-primary/25" />
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

          {/* mid — brand story (hidden on mobile strip) */}
          <div className="hidden md:block">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm
                             border border-white/20 text-white text-xs font-semibold
                             uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <Leaf size={12} className="text-secondary" />
              Join Us
            </span>

            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white
                           leading-[1.1] tracking-[-0.02em] mb-4">
              Be part of<br />
              something <span className="text-secondary">real</span>
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Whether you're a traveller seeking authentic experiences or a
              local ready to share your world — there's a place for you here.
            </p>
          </div>

          {/* bottom — why join pills (hidden on mobile strip) */}
          <div className="hidden md:flex flex-col gap-3">
            {[
              { icon: Sprout, text: 'Support 110+ local farms directly' },
              { icon: Leaf,   text: 'Sustainable & eco-friendly tourism' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 bg-white/8 backdrop-blur-sm
                                        border border-white/12 rounded-xl px-4 py-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon size={14} className="text-subtle-accent" />
                  </div>
                  <span className="text-white text-xs font-semibold leading-snug">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Register;