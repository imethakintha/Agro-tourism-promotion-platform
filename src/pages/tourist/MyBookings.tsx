import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import BookingStatusBadge from '../../components/common/BookingStatusBadge';
import { 
  Calendar, Clock, MapPin, User, Loader2, Map as MapIcon, 
  Bus, Star, Navigation, X, ExternalLink, ChevronRight, AlertCircle 
} from 'lucide-react';
import ReviewForm from '../../components/reviews/ReviewForm';
import SmartRouteMap from '../../components/common/SmartRouteMap';

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [viewingRoute, setViewingRoute] = useState<any>(null);

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/400x300';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await getMyBookings();
      // Sort by date descending
      const sorted = res.data.sort((a: any, b: any) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime());
      setBookings(sorted);
    } catch (error) {
      console.error('Failed to load bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = (farmLoc: any, farmName: string) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
        let farmCoords: [number, number] = [0, 0];
        
        if (farmLoc.coordinates) {
          if (Array.isArray(farmLoc.coordinates)) {
            farmCoords = [farmLoc.coordinates[0], farmLoc.coordinates[1]];
          } else {
            farmCoords = [farmLoc.coordinates.lng, farmLoc.coordinates.lat];
          }
        }

        setViewingRoute({
          origin: userCoords,
          destination: farmCoords,
          farmName: farmName,
          address: farmLoc.address
        });
      },
      (error) => {
        console.error(error);
        alert("Please enable location services to see directions.");
      }
    );
  };

  const openGoogleMaps = () => {
    if (!viewingRoute) return;
    const [lng, lat] = viewingRoute.destination;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel? This action cannot be undone.")) return;
    try {
      const res = await cancelBooking(bookingId, "User requested cancellation");
      alert(res.message);
      loadBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const openReview = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setShowReviewModal(true);
  };

  // Helper for service status (Refactored to be smaller/cleaner)
  const ServiceTag = ({ type, status }: any) => {
    if (status === 'NotRequested') return null;
    const isConfirmed = status === 'Confirmed';
    const isPending = status === 'Pending';
    
    return (
      <span className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border
        ${isConfirmed ? 'bg-blue-50 text-blue-700 border-blue-100' : 
          isPending ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-500 border-gray-200'}
      `}>
        {type === 'Guide' ? <MapIcon size={12} /> : <Bus size={12} />}
        {type} {isPending && '(Req)'}
      </span>
    );
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
        <p className="text-gray-500 font-medium">Loading your journey...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      
      <div className="mb-10">
         <h1 className="text-4xl font-serif font-bold text-gray-800">My Trips</h1>
         <p className="text-gray-500 mt-2">Manage your upcoming farm visits and past experiences.</p>
      </div>

      <div className="space-y-8">
        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
               <MapIcon size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-700">No trips booked yet</h3>
            <p className="text-gray-500 mt-2">Time to explore the beautiful farms of Sri Lanka!</p>
          </div>
        ) : (
          bookings.map(booking => {
            const isConfirmed = booking.status === 'Confirmed';
            const isCompleted = booking.status === 'Completed';
            
            // Cancellation Logic
            const activityDate = new Date(booking.activityDate);
            const now = new Date();
            const timeDiff = activityDate.getTime() - now.getTime();
            const hoursDiff = timeDiff / (1000 * 3600);
            const canCancel = hoursDiff > 24 && ['Pending', 'Confirmed'].includes(booking.status);

            return (
              <div 
                key={booking._id} 
                className="bg-white rounded-[32px] shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row transition-all duration-300 group"
              >
                {/* --- Left: Image Section --- */}
                <div className="w-full md:w-64 h-48 md:h-auto relative bg-gray-200 shrink-0">
                  <img
                    src={getImageUrl(booking.activityId?.images?.[0]?.url)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Activity"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x300')}
                  />
                  <div className="absolute top-4 left-4">
                     <BookingStatusBadge status={booking.status} />
                  </div>
                  {/* Date Overlay */}
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                     <p className="text-white font-bold flex items-center gap-2">
                        <Calendar size={16} className="text-secondary" />
                        {new Date(booking.activityDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     </p>
                  </div>
                </div>

                {/* --- Right: Content Section --- */}
                <div className="flex-1 p-6 md:p-8 flex flex-col">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-gray-800 leading-tight group-hover:text-primary transition-colors">
                          {booking.activityId?.customTitle}
                      </h3>
                      <div className="flex items-center text-sm font-medium text-gray-500 mt-1">
                        <MapPin size={14} className="mr-1.5 text-primary" /> 
                        {booking.farmId?.farmName}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Paid</p>
                        <p className="text-xl font-bold text-gray-900">LKR {booking.pricing.totalCost.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                     <div>
                        <span className="text-xs text-gray-400 uppercase font-bold">Time</span>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5 flex items-center gap-1">
                           <Clock size={14}/> {booking.activityTime.startTime}
                        </p>
                     </div>
                     <div>
                        <span className="text-xs text-gray-400 uppercase font-bold">Guests</span>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5 flex items-center gap-1">
                           <User size={14}/> {booking.numberOfParticipants}
                        </p>
                     </div>
                     <div className="col-span-2">
                        <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Extras</span>
                        <div className="flex gap-2">
                           {(booking.guideStatus === 'NotRequested' && booking.transportStatus === 'NotRequested') ? (
                               <span className="text-sm text-gray-400 italic">None selected</span>
                           ) : (
                               <>
                                 <ServiceTag type="Guide" status={booking.guideStatus} />
                                 <ServiceTag type="Transport" status={booking.transportStatus} />
                               </>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4">
                     
                     {/* Secondary Actions (Left) */}
                     <div className="flex gap-3">
                        {canCancel ? (
                           <button 
                             onClick={() => handleCancel(booking._id)}
                             className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                           >
                             Cancel Booking
                           </button>
                        ) : (
                           ['Pending', 'Confirmed'].includes(booking.status) && (
                              <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                                 <AlertCircle size={12} /> Non-cancellable {"< 24h"}
                              </span>
                           )
                        )}

                        {isCompleted && !booking.reviewSubmitted && (
                           <button 
                             onClick={() => openReview(booking._id)}
                             className="text-amber-600 text-sm font-bold hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-amber-100"
                           >
                             <Star size={16} /> Rate Experience
                           </button>
                        )}
                     </div>

                     {/* Primary Action (Right) */}
                     {isConfirmed && (
                        <button
                           onClick={() => handleGetDirections(booking.farmId?.location, booking.farmId?.farmName)}
                           className="bg-primary hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-900/20 flex items-center gap-2 transition-all transform active:scale-95"
                        >
                           <Navigation size={16} /> Get Directions
                        </button>
                     )}
                     
                     {isCompleted && (
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl">
                           Trip Completed <ChevronRight size={16} />
                        </div>
                     )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- Modals --- */}

      {showReviewModal && selectedBookingId && (
        <ReviewForm
          bookingId={selectedBookingId}
          onSuccess={() => {
            setShowReviewModal(false);
            loadBookings();
          }}
          onCancel={() => setShowReviewModal(false)}
        />
      )}

      {viewingRoute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <div>
                <h3 className="text-xl font-serif font-bold text-gray-800 flex items-center gap-2">
                  <Navigation className="text-secondary" size={24} /> Journey to Farm
                </h3>
                <p className="text-sm text-gray-500 mt-1">Navigate from your current location</p>
              </div>
              <button 
                onClick={() => setViewingRoute(null)} 
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              >
                  <X size={20} />
              </button>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative bg-gray-100">
              <SmartRouteMap
                origin={viewingRoute.origin}
                destination={viewingRoute.destination}
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900 block mb-1">Destination: {viewingRoute.farmName}</span>
                <span className="text-gray-400 flex items-center gap-1"><MapPin size={12}/> {viewingRoute.address}</span>
              </div>
              <button
                onClick={openGoogleMaps}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
              >
                Start Navigation <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;