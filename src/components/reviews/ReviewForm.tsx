import React, { useState } from 'react';
import StarRating from '../common/StarRating';
import { createReview } from '../../services/reviewService';
import { Loader2, X, MessageSquare, Star, Send } from 'lucide-react';

interface ReviewFormProps {
  bookingId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ bookingId, onSuccess, onCancel }) => {
  const [ratings, setRatings] = useState({
      overall: 0,
      authenticity: 0,
      value: 0,
      service: 0
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (ratings.overall === 0) return alert('Please provide an overall rating');
      
      setLoading(true);
      try {
          await createReview({
              bookingId,
              ratings,
              comment,
              images: [] 
          });
          onSuccess(); // Parent should handle success alert/toast
      } catch (error) {
          console.error(error);
          alert('Failed to submit review');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       {/* Blurred Backdrop */}
       <div 
         className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
         onClick={onCancel}
       ></div>

       {/* Modal Content */}
       <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col font-sans animate-scale-up overflow-hidden">
           
           {/* Header */}
           <div className="bg-primary/5 p-6 border-b border-primary/10 flex justify-between items-center">
              <div>
                  <h2 className="text-xl font-serif font-bold text-gray-800">How was your experience?</h2>
                  <p className="text-sm text-gray-500 mt-1">Your feedback helps others discover Sri Lanka.</p>
              </div>
              <button 
                onClick={onCancel} 
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
              >
                  <X size={18}/>
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="p-8 space-y-8">
               
               {/* Main Rating */}
               <div className="text-center space-y-3">
                   <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Overall Rating</label>
                   <div className="flex justify-center scale-110">
                       <StarRating 
                          rating={ratings.overall} 
                          setRating={(r) => setRatings({...ratings, overall: r})} 
                          size={40} 
                       />
                   </div>
                   <p className="text-sm font-medium text-primary h-5">
                       {ratings.overall > 0 ? (
                           ratings.overall === 5 ? "Absolutely Amazing! 🤩" :
                           ratings.overall === 4 ? "Very Good! 😊" :
                           ratings.overall === 3 ? "It was Okay 🙂" :
                           ratings.overall === 2 ? "Could be better 😕" : "Not good 😞"
                       ) : ""}
                   </p>
               </div>

               {/* Detailed Ratings (Grid) */}
               <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                   <div className="grid grid-cols-3 gap-4 divide-x divide-gray-200">
                       <div className="flex flex-col items-center gap-2 px-2">
                           <span className="text-xs font-bold text-gray-500">Authenticity</span>
                           <StarRating rating={ratings.authenticity} setRating={(r) => setRatings({...ratings, authenticity: r})} size={16} />
                       </div>
                       <div className="flex flex-col items-center gap-2 px-2">
                           <span className="text-xs font-bold text-gray-500">Value</span>
                           <StarRating rating={ratings.value} setRating={(r) => setRatings({...ratings, value: r})} size={16} />
                       </div>
                       <div className="flex flex-col items-center gap-2 px-2">
                           <span className="text-xs font-bold text-gray-500">Service</span>
                           <StarRating rating={ratings.service} setRating={(r) => setRatings({...ratings, service: r})} size={16} />
                       </div>
                   </div>
               </div>

               {/* Comment Section */}
               <div className="space-y-3">
                   <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                       <MessageSquare size={16} className="text-secondary"/> Share your thoughts
                   </label>
                   <textarea 
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm leading-relaxed"
                       rows={4}
                       placeholder="What did you love? What could be improved?"
                       value={comment}
                       onChange={e => setComment(e.target.value)}
                   ></textarea>
               </div>

               {/* Footer Actions */}
               <div className="flex justify-end pt-2">
                   <button 
                       type="submit" 
                       disabled={loading || ratings.overall === 0}
                       className="w-full bg-secondary hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-amber-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center disabled:opacity-70 disabled:shadow-none"
                   >
                       {loading ? <Loader2 className="animate-spin mr-2"/> : <Send size={18} className="mr-2"/>}
                       Submit Review
                   </button>
               </div>
           </form>
       </div>
    </div>
  );
};

export default ReviewForm;