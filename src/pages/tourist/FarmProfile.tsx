import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFarmPublicProfile } from '../../services/searchService';
import ActivityCard from '../../components/common/ActivityCard';
import { MapPin, User, Loader2, ArrowLeft } from 'lucide-react';

const FarmProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (url?: string) => {
        if (!url) return 'https://via.placeholder.com/800x400'; // Default Cover placeholder
        if (url.startsWith('http')) return url;
        return `http://localhost:5000${url}`;
    };

    useEffect(() => {
        if (id) {
            getFarmPublicProfile(id).then(res => {
                setData(res.data);
                setLoading(false);
            }).catch(console.error);
        }
    }, [id]);

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
    if (!data) return <div className="p-20 text-center">Farm not found</div>;

    const { farm, activities } = data;

    return (
        <div>
            {/* Farm Cover Image & Header */}
            <div className="relative h-80 bg-gray-900">
                {farm.images?.[0] && (
                    <img src={getImageUrl(farm.images[0].url)} className="w-full h-full object-cover opacity-60" alt={farm.farmName} />
                )}
                <div className="absolute top-4 left-4">
                    <Link to="/activities" className="bg-white/90 p-2 rounded-full flex items-center text-sm hover:bg-white font-medium">
                        <ArrowLeft size={16} className="mr-1" /> Back
                    </Link>
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-8 text-white">
                    <div className="container mx-auto">
                        <h1 className="text-4xl font-bold mb-2">{farm.farmName}</h1>
                        <div className="flex items-center space-x-6 text-sm md:text-base">
                            <span className="flex items-center"><MapPin size={18} className="mr-1 text-secondary" /> {farm.location.city}, {farm.location.district}</span>
                            <span className="flex items-center"><User size={18} className="mr-1 text-secondary" /> Host: {farm.userId?.fullName}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: About Farm */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">About the Farm</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">{farm.description}</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">Facilities</h3>
                            <div className="flex flex-wrap gap-3">
                                {farm.facilities.map((fac: string, i: number) => (
                                    <span key={i} className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium border border-green-100">
                                        {fac}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Other Activities */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-primary pl-3">
                            Experiences at {farm.farmName}
                        </h3>
                        <div className="space-y-6">
                            {activities.length > 0 ? (
                                activities.map((activity: any) => (
                                    <div key={activity._id} className="transform hover:scale-105 transition-transform duration-200">
                                        <ActivityCard activity={{ ...activity, farm: { location: farm.location } }} />
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No other activities listed yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmProfile;