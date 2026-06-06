import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGuideRequests, respondGuideRequest, getGuideProfile, getGuideJobs } from '../../services/providerService';
import {
    MapPin, Calendar, Clock, DollarSign, CheckCircle, XCircle,
    Briefcase, User, Phone, Sparkles, AlertCircle, Check, Route 
} from 'lucide-react';

const GuideDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [myJobs, setMyJobs] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const profileData = await getGuideProfile();
            setProfile(profileData.data);

            if (profileData.data.verificationStatus === 'Approved') {
                const reqData = await getGuideRequests();
                setRequests(reqData.data);
                try {
                    const jobsData = await getGuideJobs();
                    // Sort jobs by date (nearest first)
                    const sortedJobs = jobsData.data.sort((a: any, b: any) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime());
                    setMyJobs(sortedJobs);
                } catch (err) {
                    console.error("Error loading jobs", err);
                }
            }
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 404) {
                navigate('/register/guide');
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
            await respondGuideRequest(bookingId, action);
            if (action === 'Accept') alert('Job Accepted! Added to your schedule.');
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to respond');
            loadData();
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Guide Dashboard</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        Welcome back!
                        {profile?.verificationStatus === 'Approved' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                <CheckCircle size={12} className="mr-1" /> Verified Guide
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                <Clock size={12} className="mr-1" /> Verification Pending
                            </span>
                        )}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Upcoming Jobs</p>
                    <p className="text-4xl font-bold text-primary">{myJobs.filter(j => j.status === 'Confirmed' || j.status === 'Assigned').length}</p>
                </div>
            </div>

            {profile?.verificationStatus !== 'Approved' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start max-w-2xl mx-auto">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-amber-900">Profile Under Review</h3>
                        <p className="text-amber-700 mt-1">
                            Your guide profile is currently being verified by our team.
                            You will start receiving job requests once your documents are approved.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- LEFT COLUMN: JOB OPPORTUNITIES (NEW REQUESTS) --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg text-green-700"><Sparkles size={20} /></div>
                            <h2 className="text-xl font-bold text-gray-800">New Opportunities</h2>
                        </div>

                        {requests.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Briefcase size={24} />
                                </div>
                                <p className="text-gray-500 font-medium">No new requests right now.</p>
                                <p className="text-sm text-gray-400 mt-1">We'll notify you when a tourist needs a guide nearby.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {requests.map(req => {
                                    // Check if it's an Expedition (Multi-Day Trip)
                                    const isExpedition = req.bookingType === 'Expedition' || (req.itinerary && req.itinerary.length > 0);

                                    return (
                                        <div key={req._id} className="bg-white rounded-3xl shadow-lg shadow-green-900/5 border border-green-100 overflow-hidden relative group hover:border-green-300 transition-all">
                                            <div className={`absolute top-0 right-0 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider ${isExpedition ? 'bg-purple-600' : 'bg-green-500'}`}>
                                                {isExpedition ? 'Multi-Day Expedition' : 'New Request'}
                                            </div>

                                            <div className="p-6 md:p-8">
                                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                                                    <div className="flex-1">
                                                        {isExpedition ? (
                                                            // --- EXPEDITION VIEW ---
                                                            <>
                                                                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                                    <Route className="text-purple-500" size={24} />
                                                                    {req.itinerary ? `${req.itinerary.length} Days Farm Tour` : 'Multi-Day Journey'}
                                                                </h3>
                                                                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                                                                    <span className="flex items-center bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-100 font-medium">
                                                                        <Calendar size={14} className="mr-2" />
                                                                        {new Date(req.startDate || req.activityDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                                                    </span>
                                                                    <span className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                                                                        <User size={14} className="mr-2 text-gray-500" /> {req.participantCount} Travelers
                                                                    </span>
                                                                </div>

                                                                {/* Itinerary Summary */}
                                                                <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Trip Highlights</p>
                                                                    <ul className="space-y-2">
                                                                        {req.itinerary?.slice(0, 3).map((day: any, idx: number) => (
                                                                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                                                                                <span>
                                                                                    <span className="font-bold">Day {idx + 1}:</span> {day.activities?.length} Activities
                                                                                    <span className="text-gray-400 text-xs ml-1">({day.activities?.[0]?.location})</span>
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                        {req.itinerary?.length > 3 && (
                                                                            <li className="text-xs text-purple-600 font-bold pl-3">+{req.itinerary.length - 3} more days...</li>
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            // --- SINGLE ACTIVITY VIEW ---
                                                            <>
                                                                <h3 className="text-xl font-bold text-gray-900 mb-2">{req.activityId?.customTitle || 'Farm Activity'}</h3>
                                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                                    <span className="flex items-center bg-gray-50 px-3 py-1 rounded-lg"><Calendar size={14} className="mr-2 text-primary" /> {new Date(req.activityDate).toLocaleDateString()}</span>
                                                                    <span className="flex items-center bg-gray-50 px-3 py-1 rounded-lg"><Clock size={14} className="mr-2 text-primary" /> {req.activityTime?.startTime}</span>
                                                                </div>
                                                                <div className="flex items-center text-sm text-gray-500 mt-3">
                                                                    <MapPin size={14} className="mr-1 text-gray-400" /> {req.farmId?.farmName}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="text-left md:text-right bg-green-50 p-4 rounded-xl border border-green-100 min-w-[140px]">
                                                        <p className="text-xs text-green-700 font-bold uppercase tracking-wide mb-1">Your Earnings</p>
                                                        <p className="text-2xl font-bold text-green-800">LKR {req.pricing?.guideCost?.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleRespond(req._id, 'Accept')}
                                                        className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-800 transition-all shadow-md shadow-green-900/10 flex justify-center items-center gap-2 transform active:scale-95"
                                                    >
                                                        <CheckCircle size={18} /> Accept Job
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
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: MY SCHEDULE --- */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><Calendar size={20} /></div>
                            <h2 className="text-xl font-bold text-gray-800">My Schedule</h2>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                            {myJobs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
                                        <Calendar size={20} />
                                    </div>
                                    <p className="text-gray-400 text-sm">Your schedule is empty.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {myJobs.map(job => (
                                        <div key={job._id} className="p-5 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${job.status === 'Completed' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {job.status}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400">
                                                    {new Date(job.activityDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{job.activityId?.customTitle}</h4>

                                            <div className="flex items-center text-xs text-gray-500 mb-3">
                                                <Clock size={12} className="mr-1" /> {job.activityTime?.startTime}
                                                <span className="mx-2">•</span>
                                                <MapPin size={12} className="mr-1" /> {job.farmId?.farmName}
                                            </div>

                                            {/* Contact Card */}
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {job.touristId?.fullName?.charAt(0) || 'G'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-700 truncate">{job.touristId?.fullName}</p>
                                                    <a href={`tel:${job.contactPhone}`} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                        <Phone size={10} /> {job.contactPhone}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default GuideDashboard;