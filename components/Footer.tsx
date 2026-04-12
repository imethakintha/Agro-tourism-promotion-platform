import React from 'react';
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────
   SOCIAL ICON
   ───────────────────────────────────────────── */
const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a
    href={href}
    aria-label="Social link"
    className="group w-10 h-10 rounded-full
               bg-white/8 border border-white/12
               flex items-center justify-center text-white/60
               hover:bg-secondary hover:border-secondary hover:text-dark
               hover:-translate-y-0.5
               transition-all duration-300"
  >
    {icon}
  </a>
);

/* ─────────────────────────────────────────────
   FOOTER LINK
   The sliding arrow uses a width transition — same
   mechanic as the original, tightened up visually.
   ───────────────────────────────────────────── */
const FooterLink = ({
  to,
  label,
  highlight = false
}: {
  to: string;
  label: string;
  highlight?: boolean;
}) => (
  <li>
    <Link
      to={to}
      className={`group flex items-center gap-0 text-sm transition-colors duration-300
                  ${highlight
                    ? 'text-secondary font-semibold hover:text-white'
                    : 'text-white/55 hover:text-white'
                  }`}
    >
      {/* arrow slides in on hover */}
      <span className="overflow-hidden w-0 group-hover:w-4 transition-[width] duration-300 flex items-center">
        <ArrowRight size={13} className="text-secondary shrink-0" />
      </span>
      {/* small left-margin appears alongside the arrow */}
      <span className="group-hover:ml-1.5 transition-[margin] duration-300">
        {label}
      </span>
    </Link>
  </li>
);

/* ─────────────────────────────────────────────
   CONTACT ITEM
   ───────────────────────────────────────────── */
const ContactItem = ({
  icon,
  text,
  href
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
}) => {
  const inner = (
    <div className="group flex items-start gap-3 text-white/50 hover:text-white/90 transition-colors duration-300 cursor-pointer">
      <span className="mt-0.5 text-secondary/70 group-hover:text-secondary transition-colors duration-300 shrink-0">
        {icon}
      </span>
      <span className="text-sm leading-relaxed">{text}</span>
    </div>
  );

  return href ? <a href={href}>{inner}</a> : <div>{inner}</div>;
};

/* ═════════════════════════════════════════════
   FOOTER
   ═════════════════════════════════════════════ */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 bg-dark text-white overflow-hidden font-sans">

      {/* ── atmospheric background glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* top-right warm glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-8" />
        {/* mid-left cool glow */}
        <div className="absolute top-1/2 -left-28 w-80 h-80 bg-subtle-accent rounded-full blur-3xl opacity-6" />
        {/* bottom centre, very subtle primary */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-125 h-64 bg-primary rounded-full blur-3xl opacity-5" />
      </div>

      {/* ── glassmorphism top edge strip ── */}
      <div className="relative z-10 h-px bg-linear-to-r from-transparent via-white/12 to-transparent" />
      <div className="relative z-10 h-16 bg-linear-to-b from-white/4 to-transparent pointer-events-none" />

      {/* ── main content ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pb-10 pt-6">

        {/* top 4-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* col 1 — brand */}
          <div className="space-y-5">
            <Link to="/" className="inline-block">
              <h3 className="text-4xl font-serif font-bold tracking-[-0.02em]">
                Agro<span className="text-secondary">LK</span>
              </h3>
            </Link>

            <p className="text-white/45 text-sm leading-relaxed max-w-xs">
              Connecting the world to the heart of Sri Lanka. Experience authentic
              farm stays, support rural communities, and rediscover nature in its
              purest form.
            </p>

            {/* social row */}
            <div className="flex gap-3 pt-1">
              <SocialIcon icon={<Facebook size={17} />} href="#" />
              <SocialIcon icon={<Instagram size={17} />} href="#" />
              <SocialIcon icon={<Twitter size={17} />} href="#" />
            </div>
          </div>

          {/* col 2 — explore */}
          <div>
            <h4 className="text-base font-serif font-semibold text-white/90 mb-5 flex items-center gap-2">
              Explore
              <span className="flex-1 h-px bg-white/10" />
            </h4>
            <ul className="space-y-3.5">
              <FooterLink to="/"          label="Home" />
              <FooterLink to="/activities" label="Farm Activities" />
              <FooterLink to="/about"      label="Our Story" />
              <FooterLink to="/contact"    label="Contact Support" />
            </ul>
          </div>

          {/* col 3 — partners */}
          <div>
            <h4 className="text-base font-serif font-semibold text-white/90 mb-5 flex items-center gap-2">
              Join the Network
              <span className="flex-1 h-px bg-white/10" />
            </h4>
            <ul className="space-y-3.5">
              <FooterLink to="/register?role=farmer"    label="Become a Farmer Host"  highlight />
              <FooterLink to="/register?role=guide"     label="Register as a Guide" />
              <FooterLink to="/register?role=transport" label="List Your Vehicle" />
              <FooterLink to="/terms"                   label="Terms & Conditions" />
            </ul>
          </div>

          {/* col 4 — contact */}
          <div>
            <h4 className="text-base font-serif font-semibold text-white/90 mb-5 flex items-center gap-2">
              Get in Touch
              <span className="flex-1 h-px bg-white/10" />
            </h4>
            <ul className="space-y-4">
              <ContactItem
                icon={<Mail size={16} />}
                text="support@agrolk.com"
                href="mailto:support@agrolk.com"
              />
              <ContactItem
                icon={<Phone size={16} />}
                text="+94 11 234 5678"
                href="tel:+94112345678"
              />
              <ContactItem
                icon={<MapPin size={16} />}
                text="Colombo, Sri Lanka"
              />
            </ul>
          </div>
        </div>

        {/* ── bottom bar ── */}
        <div className="border-t border-white/8 pt-7 flex flex-col sm:flex-row justify-between items-center gap-4">

          {/* copyright */}
          <p className="text-white/35 text-xs flex items-center gap-1.5">
            <Leaf size={12} className="text-subtle-accent/60" />
            &copy; {currentYear} AgroLK. Crafted with care for Sri Lankan Tourism.
          </p>

          {/* policy links */}
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-white/35 text-xs hover:text-secondary transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/cookies"
              className="text-white/35 text-xs hover:text-secondary transition-colors duration-300"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;