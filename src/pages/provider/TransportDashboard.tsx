import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransportRequests, respondTransportRequest, getTransportProfile, getTransportJobs } from '../../services/providerService';
import { 
  MapPin, Calendar, Navigation, CheckCircle, XCircle, Map as MapIcon, X, 
  Loader2, Phone, User, Clock, ArrowRight, Car, AlertTriangle 
} from 'lucide-react';
import SmartRouteMap from '../../components/common/SmartRouteMap';

const TransportDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [myTrips, setMyTrips] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const profileData = await getTransportProfile();
            setProfile(profileData.data);

            if (profileData.data.verificationStatus === 'Approved') {
                const reqData = await getTransportRequests();
                setRequests(reqData.data);

                const jobsData = await getTransportJobs();
                // Sort trips by date/time
                const sortedTrips = jobsData.data.sort((a: any, b: any) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime());
                setMyTrips(sortedTrips);
            }
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 404) {
                navigate('/register/transport');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleRespond = async (bookingId: string, action: 'Accept' | 'Decline') => {
        try {
            await respondTransportRequest(bookingId, action);
            if (action === 'Accept') alert('Trip Accepted! View details in Upcoming Trips.');
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to respond');
            loadData();
        }
    };

    const openMap = (booking: any) => {
        const farmLoc = booking.farmId?.location?.coordinates;
        const farmCoords = Array.isArray(farmLoc) ? farmLoc : [farmLoc.lng, farmLoc.lat];

        const pickLoc = booking.pickupLocation?.coordinates;
        const pickCoords = Array.isArray(pickLoc) ? pickLoc : [pickLoc.lng, pickLoc.lat];

        setSelectedRoute({
            origin: pickCoords,
            destination: farmCoords
        });
    };

    const startNavigation = (lat: number, lng: number) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(url, '_blank');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your trips...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Transport Dashboard</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        Welcome back! 
                        {profile?.verificationStatus === 'Approved' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                <CheckCircle size={12} className="mr-1" /> Verified Provider
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                <Clock size={12} className="mr-1" /> Verification Pending
                            </span>
                        )}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Today's Earnings</p>
                    <p className="text-4xl font-bold text-secondary">LKR 0</p> 
                    {/* Could calculate dynamically */}
                </div>
            </div>

            {profile?.verificationStatus !== 'Approved' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start max-w-2xl mx-auto">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-amber-900">Account Under Review</h3>
                        <p className="text-amber-700 mt-1">
                            Your transport profile is currently being verified. You will start receiving trip requests once approved.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- LEFT COLUMN: NEW REQUESTS --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-700"><Car size={20}/></div>
                            <h2 className="text-xl font-bold text-gray-800">Trip Requests</h2>
                        </div>

                        {requests.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Navigation size={24} />
                                </div>
                                <p className="text-gray-500 font-medium">No trip requests nearby.</p>
                                <p className="text-sm text-gray-400 mt-1">Check back soon for new passengers.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {requests.map(req => (
                                    <div key={req._id} className="bg-white rounded-3xl shadow-lg shadow-amber-900/5 border border-amber-100 overflow-hidden relative group hover:border-amber-300 transition-all">
                                        <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                            New Trip
                                        </div>
                                        
                                        <div className="p-6 md:p-8">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">Round Trip Request</h3>
                                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                                        <User size={14} className="mr-1"/> {req.numberOfParticipants} Passengers
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 uppercase font-bold">Fare</p>
                                                    <p className="text-2xl font-bold text-secondary">LKR {req.pricing?.transportCost?.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            {/* Route Visualization */}
                                            <div className="relative pl-4 border-l-2 border-gray-100 mb-6 space-y-6">
                                                {/* Pickup */}
                                                <div className="relative">
                                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white shadow-sm"></div>
                                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Pickup</p>
                                                    <p className="text-sm font-medium text-gray-800">{req.pickupLocation?.address || 'Customer Location'}</p>
                                                </div>
                                                
                                                {/* Destination */}
                                                <div className="relative">
                                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-red-500 ring-4 ring-white shadow-sm"></div>
                                                    <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Drop-off</p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {req.dropoffLocation?.address && req.dropoffLocation.address.startsWith('Route:')
                                                            ? req.dropoffLocation.address
                                                            : `${req.farmId?.farmName}, ${req.farmId?.location?.city}`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Date/Time Bar */}
                                            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl mb-6 text-sm text-gray-600 border border-gray-100">
                                                <span className="flex items-center"><Calendar size={16} className="mr-2 text-primary" /> {new Date(req.activityDate).toLocaleDateString()}</span>
                                                <div className="w-[1px] h-4 bg-gray-300"></div>
                                                <span className="flex items-center"><Clock size={16} className="mr-2 text-primary" /> {req.activityTime?.startTime}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button 
                                                    onClick={() => openMap(req)} 
                                                    className="w-full sm:w-auto bg-blue-50 text-blue-600 px-4 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <MapIcon size={18} /> View Route
                                                </button>
                                                <div className="flex-1 flex gap-3">
                                                    <button 
                                                        onClick={() => handleRespond(req._id, 'Accept')} 
                                                        className="flex-1 bg-secondary text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-md shadow-amber-900/10 flex justify-center items-center gap-2 transform active:scale-95"
                                                    >
                                                        <CheckCircle size={18} /> Accept
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRespond(req._id, 'Decline')} 
                                                        className="flex-1 bg-white border-2 border-gray-100 text-gray-500 py-3 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex justify-center items-center gap-2"
                                                    >
                                                        <XCircle size={18} /> Decline
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: UPCOMING TRIPS --- */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><Navigation size={20}/></div>
                            <h2 className="text-xl font-bold text-gray-800">My Schedule</h2>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                            {myTrips.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
                                        <Calendar size={20} />
                                    </div>
                                    <p className="text-gray-400 text-sm">Your schedule is empty.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {myTrips.map(trip => {
                                        // Coordinates extraction
                                        const pickCoords = trip.pickupLocation?.coordinates;
                                        const farmCoords = trip.farmId?.location?.coordinates;
                                        const pickLat = pickCoords.lat || pickCoords[1];
                                        const pickLng = pickCoords.lng || pickCoords[0];
                                        const farmLat = Array.isArray(farmCoords) ? farmCoords[1] : farmCoords.lat;
                                        const farmLng = Array.isArray(farmCoords) ? farmCoords[0] : farmCoords.lng;

                                        return (
                                            <div key={trip._id} className="p-5 hover:bg-gray-50 transition-colors group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                                                        trip.transportStatus === 'Completed' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                        {trip.transportStatus}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-400">
                                                        {new Date(trip.activityDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-gray-800 text-sm">{trip.touristId?.fullName}</h4>
                                                    <a href={`tel:${trip.contactPhone}`} className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
                                                        <Phone size={14} />
                                                    </a>
                                                </div>

                                                <div className="space-y-2 text-xs text-gray-500 border-l-2 border-gray-200 pl-3 ml-1 mb-4">
                                                    <p><span className="font-bold text-gray-400">PICK:</span> {trip.pickupLocation?.address}</p>
                                                    <p><span className="font-bold text-gray-400">DROP:</span> {trip.farmId?.farmName}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mt-3">
                                                    <button 
                                                        onClick={() => startNavigation(pickLat, pickLng)}
                                                        className="py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1 hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Navigation size={12} /> Pickup Nav
                                                    </button>
                                                    <button 
                                                        onClick={() => startNavigation(farmLat, farmLng)}
                                                        className="py-2 bg-white border border-green-600 text-green-600 rounded-lg text-xs font-bold flex justify-center items-center gap-1 hover:bg-green-50 transition-colors"
                                                    >
                                                        <ArrowRight size={12} /> Drop Nav
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}

            {/* Route Map Modal */}
            {selectedRoute && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl relative">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <MapIcon className="text-secondary" size={20} /> Trip Route Preview
                            </h3>
                            <button onClick={() => setSelectedRoute(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="h-[400px]">
                            <SmartRouteMap
                                origin={selectedRoute.origin}
                                destination={selectedRoute.destination}
                            />
                        </div>
                        <div className="p-3 bg-yellow-50 text-xs text-yellow-800 text-center font-medium">
                            <AlertTriangle size={12} className="inline mr-1 mb-0.5" /> Traffic data is estimated.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportDashboard;