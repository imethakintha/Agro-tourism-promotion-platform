import React, { useEffect, useState } from 'react';
import { getPendingReviews, moderateReview } from '../../services/reviewService';
import StarRating from '../../components/common/StarRating';
import { Check, X, Loader2 } from 'lucide-react';

const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
      setLoading(true);
      try {
          const res = await getPendingReviews();
          setReviews(res.data);
      } catch(err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      loadReviews();
  }, []);

  const handleModerate = async (id: string, status: 'Approved' | 'Rejected') => {
      if(!window.confirm(`Are you sure you want to ${status} this review?`)) return;
      try {
          await moderateReview(id, status);
          loadReviews();
      } catch(err) {
          alert('Action failed');
      }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary"/></div>;

  return (
    <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Review Moderation</h1>
        
        <div className="space-y-4">
            {reviews.map(review => (
                <div key={review._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{review.reviewerId?.fullName}</h3>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                                Target: {review.targetId?.customTitle || review.targetId?.farmName || 'Service Provider'}
                            </span>
                        </div>
                        <StarRating rating={review.ratings.overall} readOnly size={16} />
                        <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {review.comment}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Submitted on: {new Date(review.createdAt).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex flex-col justify-center space-y-2 md:w-40">
                        <button 
                            onClick={() => handleModerate(review._id, 'Approved')}
                            className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                        >
                            <Check size={16} className="mr-2"/> Approve
                        </button>
                        <button 
                            onClick={() => handleModerate(review._id, 'Rejected')}
                            className="bg-white border border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-50 flex items-center justify-center"
                        >
                            <X size={16} className="mr-2"/> Reject
                        </button>
                    </div>
                </div>
            ))}
            
            {reviews.length === 0 && <p className="text-center text-gray-500 py-10">No pending reviews.</p>}
        </div>
    </div>
  );
};

export default ReviewModeration;