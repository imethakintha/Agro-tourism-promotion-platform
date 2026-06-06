import React, { useEffect, useState } from 'react';
import { getReviewsByTarget } from '../../services/reviewService';
import StarRating from '../common/StarRating';
import { User } from 'lucide-react';

interface ReviewListProps {
  targetId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ targetId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReviewsByTarget(targetId).then(res => {
        setReviews(res.data);
        setLoading(false);
    }).catch(console.error);
  }, [targetId]);

  if (loading) return <div className="py-4">Loading reviews...</div>;
  if (reviews.length === 0) return <div className="py-8 text-center text-gray-500">No reviews yet.</div>;

  return (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800">Guest Reviews ({reviews.length})</h3>
        
        <div className="space-y-6">
            {reviews.map(review => (
                <div key={review._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3">
                                {review.reviewerId?.profilePic ? (
                                    <img src={`http://localhost:5000${review.reviewerId.profilePic}`} className="w-full h-full object-cover" alt="User" />
                                ) : <User className="text-gray-400" size={20}/>}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{review.reviewerId?.fullName || 'AgroLK User'}</p>
                                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="bg-green-50 px-2 py-1 rounded-lg">
                            <StarRating rating={review.ratings.overall} readOnly size={16} />
                        </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    
                    {review.response && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
                            <p className="text-xs font-bold text-gray-500 mb-1">Response from Host</p>
                            <p className="text-sm text-gray-700 italic">"{review.response.text}"</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default ReviewList;