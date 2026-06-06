import React, { useEffect, useState } from 'react';
import { getFavorites } from '../../services/userService';
import ActivityCard from '../../components/common/ActivityCard';
import { Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites().then(res => {
      setFavorites(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
         <Heart className="text-red-500 fill-red-500 mr-3" size={32} />
         <h1 className="text-3xl font-bold text-gray-800">My Saved Activities</h1>
      </div>

      {loading ? (
         <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
         </div>
      ) : (
         <>
            {favorites.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {favorites.map(activity => (
                     <ActivityCard key={activity._id} activity={activity} isFavorite={true} />
                  ))}
               </div>
            ) : (
               <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                  <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800">No favorites yet</h3>
                  <p className="text-gray-500 mb-6">Save activities you like to view them later.</p>
                  <Link to="/activities" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
                     Explore Activities
                  </Link>
               </div>
            )}
         </>
      )}
    </div>
  );
};

export default FavoritesPage;