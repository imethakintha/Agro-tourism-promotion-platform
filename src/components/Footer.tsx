import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold text-primary mb-4">AgroLK</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Connecting rural farmers in Sri Lanka with the world. Experience authentic agro-tourism, support local communities, and discover nature.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/activities" className="hover:text-primary transition-colors">Activities</Link></li>
              <li><Link to="/farm-assistant" className="hover:text-primary transition-colors">AI Farm Assistant</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Partners</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/register?role=farmer" className="hover:text-primary transition-colors">Become a Farmer Host</Link></li>
              <li><Link to="/register?role=guide" className="hover:text-primary transition-colors">Register as Guide</Link></li>
              <li><Link to="/register?role=transport" className="hover:text-primary transition-colors">Register Transport</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-primary" />
                <Link to="/contact" className="hover:text-primary">support@agrolk.com</Link>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-primary" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} className="text-primary" />
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
            
            {/* Social Icons */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AgroLK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;