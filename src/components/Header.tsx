import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sprout, Search, User as UserIcon, LogOut, Settings, Heart, Calendar, Map, Navigation, DollarSign, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CurrencySelector from './common/CurrencySelector';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/activities?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary hover:text-green-700 transition-colors">
            <Sprout size={32} />
            <span className="text-2xl font-bold text-gray-800">AgroLK</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search farms, activities, or guides..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <CurrencySelector />
            <Link to="/" className="text-gray-600 hover:text-primary font-medium">Home</Link>
            <Link to="/activities" className="text-gray-600 hover:text-primary font-medium">Activities</Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-primary font-medium">How It Works</Link>
            
            {isAuthenticated && (
              <Link to="/farm-assistant" className="text-gray-600 hover:text-primary font-medium flex items-center" title="AI Farm Assistant">
                 <Camera size={20} className="mr-1"/>
                 <span className="hidden lg:inline">Farm AI</span>
              </Link>
            )}

            {isAuthenticated && user?.role === 'Tourist' && (
               <>
                 <Link to="/favorites" className="text-gray-600 hover:text-primary font-medium flex items-center" title="Favorites">
                    <Heart size={20} />
                 </Link>
                 <Link to="/my-bookings" className="text-gray-600 hover:text-primary font-medium flex items-center" title="My Bookings">
                    <Calendar size={20} />
                 </Link>
               </>
            )}

            {isAuthenticated && user?.role === 'Farmer' && ( 
               <>
                 <Link to="/dashboard" className="text-gray-600 hover:text-primary font-medium">My Activities</Link>
                 <Link to="/dashboard/bookings" className="text-gray-600 hover:text-primary font-medium">Bookings</Link>
                 <Link to="/earnings" className="text-gray-600 hover:text-primary font-medium flex items-center" title="Earnings"><DollarSign size={18}/></Link>
               </>
            )}

            {isAuthenticated && user?.role === 'TourGuide' && (
               <>
                 <Link to="/dashboard/guide" className="text-gray-600 hover:text-primary font-medium flex items-center"><Map size={16} className="mr-1"/> Jobs</Link>
                 <Link to="/earnings" className="text-gray-600 hover:text-primary font-medium flex items-center" title="Earnings"><DollarSign size={18}/></Link>
               </>
            )}

            {isAuthenticated && user?.role === 'TransportProvider' && (
               <>
                 <Link to="/dashboard/transport" className="text-gray-600 hover:text-primary font-medium flex items-center"><Navigation size={16} className="mr-1"/> Trips</Link>
                 <Link to="/earnings" className="text-gray-600 hover:text-primary font-medium flex items-center" title="Earnings"><DollarSign size={18}/></Link>
               </>
            )}

            {isAuthenticated && user?.role === 'Administrator' && (
               <Link to="/admin" className="text-gray-600 hover:text-primary font-medium flex items-center"><Settings size={16} className="mr-1"/> Admin</Link>
            )}
            
            {isAuthenticated && user ? (
               <div className="flex items-center space-x-4 ml-4">
                 <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                         {user.profilePic ? (
                             <img src={`http://localhost:5000${user.profilePic}`} alt={user.fullName} className="w-full h-full object-cover" />
                         ) : (
                             <UserIcon size={18} className="text-primary" />
                         )}
                    </div>
                    <span className="font-medium text-sm">{user.fullName}</span>
                 </Link>
                 <button 
                    onClick={logout}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Logout"
                 >
                    <LogOut size={20} />
                 </button>
               </div>
            ) : (
                <div className="flex items-center space-x-2 ml-4">
                <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
                <Link 
                    to="/register" 
                    className="bg-primary text-white px-4 py-2 rounded-full font-medium hover:bg-green-700 transition-colors shadow-sm"
                >
                    Sign Up
                </Link>
                </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col space-y-4">
               <form onSubmit={handleSearch} className="relative w-full mb-4">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </form>
              <Link to="/" className="text-gray-600 hover:text-primary font-medium px-2">Home</Link>
              <Link to="/activities" className="text-gray-600 hover:text-primary font-medium px-2">Activities</Link>
              <Link to="/how-it-works" className="text-gray-600 hover:text-primary font-medium px-2">How It Works</Link>
              
              {isAuthenticated && user ? (
                  <>
                    <Link to="/farm-assistant" className="text-gray-600 hover:text-primary font-medium px-2 flex items-center"><Camera size={16} className="mr-2"/> AI Farm Assistant</Link>
                    
                    {user.role === 'Tourist' && (
                       <>
                         <Link to="/favorites" className="text-gray-600 hover:text-primary font-medium px-2">Saved Activities</Link>
                         <Link to="/my-bookings" className="text-gray-600 hover:text-primary font-medium px-2">My Bookings</Link>
                         <Link to="/support/tickets" className="text-gray-600 hover:text-primary font-medium px-2">My Support Tickets</Link>
                       </>
                    )}
                    <Link to="/profile" className="text-gray-600 hover:text-primary font-medium px-2">My Profile</Link>
                    {user.role === 'Farmer' && (
                       <>
                         <Link to="/dashboard" className="text-gray-600 hover:text-primary font-medium px-2">My Activities</Link>
                         <Link to="/dashboard/bookings" className="text-gray-600 hover:text-primary font-medium px-2">Bookings</Link>
                         <Link to="/earnings" className="text-gray-600 hover:text-primary font-medium px-2">Earnings</Link>
                       </>
                    )}
                    <button onClick={logout} className="text-left text-red-500 font-medium px-2">Logout</button>
                  </>
              ) : (
                <div className="border-t border-gray-100 pt-4 flex flex-col space-y-2">
                    <Link to="/login" className="text-center text-primary font-medium py-2 border border-primary rounded-lg">Login</Link>
                    <Link to="/register" className="text-center bg-primary text-white font-medium py-2 rounded-lg">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;