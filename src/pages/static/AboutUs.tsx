import React from 'react';
import { Users, Sprout, Heart, Globe } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">About AgroLK</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We are Sri Lanka's premier platform dedicated to bridging the gap between rural farmers and global travelers, fostering sustainable agro-tourism experiences.
        </p>
      </div>

      {/* Our Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div>
           <img 
             src="https://images.unsplash.com/photo-1595248866837-7e61884762c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
             alt="Sri Lankan Farmer" 
             className="rounded-2xl shadow-lg w-full h-80 object-cover"
           />
        </div>
        <div>
           <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
           <p className="text-gray-600 leading-relaxed mb-6">
             Our mission is to empower local farming communities by opening their doors to the world. We believe that tourism can be a force for good, providing farmers with a supplementary income while preserving traditional agricultural practices.
           </p>
           <p className="text-gray-600 leading-relaxed">
             For tourists, AgroLK offers an escape from the ordinary—a chance to get your hands dirty, taste the freshest produce, and connect with the land and its people.
           </p>
        </div>
      </div>

      {/* Values Grid */}
      <div className="bg-green-50 rounded-3xl p-10 mb-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Why We Do It</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                 <Users size={28}/>
              </div>
              <h3 className="font-bold text-lg mb-2">Community First</h3>
              <p className="text-gray-500 text-sm">Uplifting rural economies directly through tourism revenue.</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                 <Sprout size={28}/>
              </div>
              <h3 className="font-bold text-lg mb-2">Sustainability</h3>
              <p className="text-gray-500 text-sm">Promoting eco-friendly farming and responsible travel.</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                 <Globe size={28}/>
              </div>
              <h3 className="font-bold text-lg mb-2">Cultural Exchange</h3>
              <p className="text-gray-500 text-sm">Sharing the rich heritage of Sri Lankan agriculture with the world.</p>
           </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-gray-200 pt-12">
         <div>
            <span className="block text-4xl font-bold text-primary mb-1">500+</span>
            <span className="text-gray-500 text-sm uppercase tracking-wider">Farmers</span>
         </div>
         <div>
            <span className="block text-4xl font-bold text-primary mb-1">10k+</span>
            <span className="text-gray-500 text-sm uppercase tracking-wider">Bookings</span>
         </div>
         <div>
            <span className="block text-4xl font-bold text-primary mb-1">50+</span>
            <span className="text-gray-500 text-sm uppercase tracking-wider">Locations</span>
         </div>
         <div>
            <span className="block text-4xl font-bold text-primary mb-1">4.8</span>
            <span className="text-gray-500 text-sm uppercase tracking-wider">Rating</span>
         </div>
      </div>
    </div>
  );
};

export default AboutUs;