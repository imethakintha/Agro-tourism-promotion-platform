import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyActivities } from '../../services/activityService';
import {
   Plus, Calendar, Star, Settings, MapPin, MessageSquare,
   X, Edit3, ChevronDown, ChevronUp, AlertCircle, Sparkles
} from 'lucide-react';
import AvailabilityCalendar from '../../components/farmer/AvailabilityCalendar';
import { getMyFarm } from '../../services/providerService';
import EditFarmModal from '../../components/farmer/EditFarmModal';
import ReviewList from '../../components/reviews/ReviewList';
import { getSmartPricePrediction } from '../../services/aiService';

const ActivityList: React.FC = () => {
   const navigate = useNavigate();
   const [activities, setActivities] = useState<any[]>([]);
   const [farm, setFarm] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   // UI State
   const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
   const [showEditModal, setShowEditModal] = useState(false);
   const [showReviewsId, setShowReviewsId] = useState<string | null>(null);

   const [smartPriceModal, setSmartPriceModal] = useState<{ show: boolean, data: any, activityId: string } | null>(null);
   const [loadingPrice, setLoadingPrice] = useState<string | null>(null);

   const checkPriceForActivity = async (activity: any) => {
      setLoadingPrice(activity._id);
      try {
         const res = await getSmartPricePrediction({
            categoryId: activity.categoryId._id,
            tagIds: activity.tagIds,
            currentPrice: activity.pricePerPerson
         });
         if (res.data.success) {
            setSmartPriceModal({
               show: true,
               data: res.data,
               activityId: activity._id
            });
         }
      } catch (e) {
         console.error(e);
      } finally {
         setLoadingPrice(null);
      }
   };

   const loadData = async () => {
      setLoading(true);
      try {
         const farmRes = await getMyFarm();
         setFarm(farmRes.data);

         const res = await getMyActivities();
         setActivities(res.data);

      } catch (error: any) {
         if (error.response && error.response.status === 404) {
            alert("Please register your farm first!");
            navigate('/register/farm');
            return;
         }
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadData();
   }, [navigate]);

   return (
      <div className="max-w-6xl mx-auto px-4 py-8 font-sans">

         {/* --- 1. Farm Header Card --- */}
         <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 mb-10 relative overflow-hidden group">
            {/* Decorative Background Blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <h1 className="text-3xl font-serif font-bold text-gray-800">
                        {farm?.farmName || 'My Farm Dashboard'}
                     </h1>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${farm?.verificationStatus === 'Approved'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {farm?.verificationStatus || 'Loading...'}
                     </span>
                  </div>

                  {farm && (
                     <div className="flex items-center text-gray-500 font-medium">
                        <MapPin size={16} className="mr-1.5 text-primary" />
                        {farm.location.city}, {farm.location.district}
                     </div>
                  )}
               </div>

               <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                     onClick={() => setShowEditModal(true)}
                     className="flex-1 md:flex-none justify-center px-5 py-3 rounded-xl border-2 border-gray-100 text-gray-600 font-bold hover:border-primary/30 hover:text-primary transition-all flex items-center gap-2 bg-white"
                  >
                     <Settings size={18} /> Edit Profile
                  </button>

                  {farm?.verificationStatus === 'Approved' ? (
                     <Link
                        to="/farmer/activities/create"
                        className="flex-1 md:flex-none justify-center px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-900/20 flex items-center gap-2 transform active:scale-95"
                     >
                        <Plus size={20} /> New Activity
                     </Link>
                  ) : (
                     <button
                        disabled
                        className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed flex items-center gap-2"
                        title="Waiting for farm verification"
                     >
                        <Plus size={20} /> New Activity
                     </button>
                  )}
               </div>
            </div>
         </div>

         {/* --- 2. Activity List --- */}
         {loading ? (
            <div className="space-y-4">
               {[1, 2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse"></div>)}
            </div>
         ) : (
            <div className="space-y-8">
               <h2 className="text-xl font-bold text-gray-700 pl-2">Your Listings ({activities.length})</h2>

               {activities.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-[32px] border border-dashed border-gray-300">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="text-gray-400" />
                     </div>
                     <p className="text-gray-500 font-medium">You haven't posted any activities yet.</p>
                     <p className="text-sm text-gray-400 mt-1">Create your first experience to start hosting tourists.</p>
                  </div>
               )}

               {activities.map(activity => {
                  const isExpanded = selectedActivityId === activity._id;

                  return (
                     <div
                        key={activity._id}
                        className={`bg-white rounded-[32px] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-primary/10' : ''}`}
                     >
                        <div className="flex flex-col lg:flex-row">
                           {/* Image Section */}
                           <div className="lg:w-72 h-56 lg:h-auto relative bg-gray-200">
                              {activity.images[0] && (
                                 <img
                                    src={`http://localhost:5000${activity.images[0].url}`}
                                    className="w-full h-full object-cover"
                                    alt={activity.customTitle}
                                 />
                              )}
                              <div className="absolute top-4 left-4">
                                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md ${activity.status === 'Active'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-gray-500/90 text-white'
                                    }`}>
                                    {activity.status}
                                 </span>
                              </div>
                           </div>

                           {/* Content Section */}
                           <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                              <div>
                                 <div className="flex justify-between items-start mb-2">
                                    <div>
                                       <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">
                                          {activity.categoryId?.categoryName}
                                       </span>
                                       <h3 className="text-2xl font-serif font-bold text-gray-800 leading-tight">
                                          {activity.customTitle}
                                       </h3>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-xl font-bold text-secondary">
                                          <span className="text-xs text-gray-400 font-medium mr-1">LKR</span>
                                          {activity.pricePerPerson}
                                       </p>
                                       <p className="text-xs text-gray-400">per person</p>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-6 mt-4 pb-6 border-b border-gray-100">
                                    <div className="flex items-center text-sm font-medium text-gray-600">
                                       <Star size={16} className="text-secondary fill-secondary mr-1.5" />
                                       {activity.averageRating || 'New'}
                                       <span className="text-gray-400 ml-1">({activity.totalReviews} reviews)</span>
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-gray-600">
                                       <Calendar size={16} className="text-gray-400 mr-1.5" />
                                       {activity.durationHours} Hours
                                    </div>
                                 </div>
                              </div>

                              {/* Action Toolbar */}
                              <div className="flex flex-wrap items-center gap-3 mt-6">
                                 <Link
                                    to={`/activities/edit/${activity._id}`}
                                    className="px-4 py-2 rounded-xl bg-gray-50 text-gray-700 text-sm font-bold hover:bg-gray-100 hover:text-gray-900 flex items-center transition-colors"
                                 >
                                    <Edit3 size={16} className="mr-2" /> Edit Details
                                 </Link>

                                 <button
                                    onClick={() => checkPriceForActivity(activity)}
                                    disabled={loadingPrice === activity._id}
                                    className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-bold hover:bg-indigo-100 flex items-center transition-colors border border-indigo-100"
                                 >
                                    {loadingPrice === activity._id ? (
                                       <Sparkles size={16} className="animate-spin mr-2" />
                                    ) : (
                                       <Sparkles size={16} className="mr-2" />
                                    )}
                                    Smart Price
                                 </button>

                                 <button
                                    onClick={() => setShowReviewsId(activity._id)}
                                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 flex items-center transition-colors"
                                 >
                                    <MessageSquare size={16} className="mr-2" /> Reviews
                                 </button>

                                 <div className="flex-1"></div>

                                 <button
                                    onClick={() => setSelectedActivityId(isExpanded ? null : activity._id)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all ${isExpanded
                                       ? 'bg-gray-800 text-white shadow-lg'
                                       : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                       }`}
                                 >
                                    <Calendar size={16} className="mr-2" />
                                    {isExpanded ? 'Close Schedule' : 'Manage Availability'}
                                    {isExpanded ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
                                 </button>
                              </div>
                           </div>
                        </div>

                        {/* Expanded Availability Calendar */}
                        {isExpanded && (
                           <div className="border-t border-gray-100 bg-gray-50/50 p-6 lg:p-8 animate-slide-down">
                              <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                                 <AvailabilityCalendar activityId={activity._id} />
                              </div>
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         )}

         {/* --- Modals --- */}

         {/* Smart Price Result Modal */}
         {smartPriceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSmartPriceModal(null)}></div>
               <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-scale-up">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles className="text-indigo-500" /> Smart Pricing Analysis
                     </h3>
                     <button onClick={() => setSmartPriceModal(null)}><X size={20} className="text-gray-400" /></button>
                  </div>

                  <div className="bg-indigo-50 rounded-xl p-5 mb-4 text-center">
                     <p className="text-sm text-indigo-600 font-bold uppercase tracking-wide mb-1">Recommended Price</p>
                     <p className="text-4xl font-extrabold text-indigo-900">LKR {smartPriceModal.data.suggestedPrice}</p>
                     <p className="text-xs text-indigo-500 mt-2 font-medium">{smartPriceModal.data.reasoning}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-gray-50 p-3 rounded-xl text-center">
                        <p className="text-xs text-gray-500">Market Average</p>
                        <p className="font-bold text-gray-700">LKR {smartPriceModal.data.marketAvg}</p>
                     </div>
                     <div className="bg-gray-50 p-3 rounded-xl text-center">
                        <p className="text-xs text-gray-500">Price Range</p>
                        <p className="font-bold text-gray-700">{smartPriceModal.data.minPrice} - {smartPriceModal.data.maxPrice}</p>
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={() => {
                           // මෙතනදී කෙලින්ම update API call එකක් ගහන්න පුළුවන් අවශ්‍ය නම්
                           // හෝ Edit page එකට යවන්න පුළුවන්
                           navigate(`/activities/edit/${smartPriceModal.activityId}`, {
                                state: { 
                                    jumpToStep: 3, // කෙලින්ම Step 3 (Logistics) එකට යන්න කියනවා
                                    suggestedPrice: smartPriceModal.data.suggestedPrice // AI දුන්න Price එක යවනවා
                                }
                            });
                        }}
                        className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700"
                     >
                        Update Price {smartPriceModal.data.suggestedPrice}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Edit Farm Modal */}
         {showEditModal && farm && (
            <EditFarmModal
               farm={farm}
               onClose={() => setShowEditModal(false)}
               onUpdate={loadData}
            />
         )}

         {/* Reviews Modal */}
         {showReviewsId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowReviewsId(null)}></div>
               <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-scale-up">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Star className="text-secondary fill-secondary" size={24} /> Guest Reviews
                     </h3>
                     <button onClick={() => setShowReviewsId(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-white">
                     <ReviewList targetId={showReviewsId} />
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default ActivityList;