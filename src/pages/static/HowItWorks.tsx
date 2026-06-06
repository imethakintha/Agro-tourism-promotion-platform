import React, { useState } from 'react';
import { User, Tractor, Map, Search, Calendar, Smile, CheckCircle, DollarSign } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tourist');

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
         <h1 className="text-4xl font-bold text-gray-800 mb-4">How AgroLK Works</h1>
         <p className="text-lg text-gray-600">Connecting tourists with authentic Sri Lankan farm experiences.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-12">
         <div className="bg-white p-1 rounded-xl shadow-sm border inline-flex">
            <button 
              onClick={() => setActiveTab('tourist')}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center ${activeTab === 'tourist' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <User size={18} className="mr-2"/> For Tourists
            </button>
            <button 
              onClick={() => setActiveTab('farmer')}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center ${activeTab === 'farmer' ? 'bg-secondary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Tractor size={18} className="mr-2"/> For Farmers
            </button>
            <button 
              onClick={() => setActiveTab('provider')}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center ${activeTab === 'provider' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Map size={18} className="mr-2"/> For Guides/Drivers
            </button>
         </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {activeTab === 'tourist' && (
            <>
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 text-2xl font-bold">1</div>
                 <h3 className="text-xl font-bold mb-3">Search & Discover</h3>
                 <p className="text-gray-600">Browse authentic farm experiences, filter by location or activity type, and read reviews from other travelers.</p>
                 <Search className="mx-auto mt-6 text-gray-300" size={48}/>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 text-2xl font-bold">2</div>
                 <h3 className="text-xl font-bold mb-3">Book Your Experience</h3>
                 <p className="text-gray-600">Select your date, add optional services like a Guide or Transport, and pay securely online.</p>
                 <Calendar className="mx-auto mt-6 text-gray-300" size={48}/>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 text-2xl font-bold">3</div>
                 <h3 className="text-xl font-bold mb-3">Enjoy & Share</h3>
                 <p className="text-gray-600">Visit the farm, enjoy the local culture, identify plants with our AI tool, and leave a review.</p>
                 <Smile className="mx-auto mt-6 text-gray-300" size={48}/>
              </div>
            </>
         )}

         {activeTab === 'farmer' && (
            <>
              <div className="bg-white p-8 rounded-xl shadow-md border border-amber-100 text-center">
                 <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 text-2xl font-bold">1</div>
                 <h3 className="text-xl font-bold mb-3">Register Farm</h3>
                 <p className="text-gray-600">Create your account, verify your identity, and list your farm details with photos.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md border border-amber-100 text-center">
                 <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 text-2xl font-bold">2</div>
                 <h3 className="text-xl font-bold mb-3">List Activities</h3>
                 <p className="text-gray-600">Create unique experiences (e.g. Tea Plucking), set your prices, and manage your availability calendar.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md border border-amber-100 text-center">
                 <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 text-2xl font-bold">3</div>
                 <h3 className="text-xl font-bold mb-3">Host & Earn</h3>
                 <p className="text-gray-600">Receive bookings, host visitors, and get paid weekly directly to your bank account.</p>
              </div>
            </>
         )}

         {activeTab === 'provider' && (
            <>
              <div className="bg-white p-8 rounded-xl shadow-md border border-blue-100 text-center">
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-2xl font-bold">1</div>
                 <h3 className="text-xl font-bold mb-3">Get Verified</h3>
                 <p className="text-gray-600">Register as a Guide or Transport Provider and upload your license/documents for verification.</p>
                 <CheckCircle className="mx-auto mt-6 text-gray-300" size={48}/>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md border border-blue-100 text-center">
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-2xl font-bold">2</div>
                 <h3 className="text-xl font-bold mb-3">Receive Requests</h3>
                 <p className="text-gray-600">Get real-time job alerts when tourists near you book a farm visit. Accept jobs instantly.</p>
                 <Map className="mx-auto mt-6 text-gray-300" size={48}/>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md border border-blue-100 text-center">
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-2xl font-bold">3</div>
                 <h3 className="text-xl font-bold mb-3">Earn Income</h3>
                 <p className="text-gray-600">Complete the job and receive secure payments with transparent commission rates.</p>
                 <DollarSign className="mx-auto mt-6 text-gray-300" size={48}/>
              </div>
            </>
         )}
      </div>
    </div>
  );
};

export default HowItWorks;