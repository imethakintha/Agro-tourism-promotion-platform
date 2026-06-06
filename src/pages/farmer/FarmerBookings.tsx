import React, { useEffect, useState } from 'react';
import { getMyBookings, updateBookingStatus } from '../../services/bookingService';
import BookingStatusBadge from '../../components/common/BookingStatusBadge';
import { Check, X, Loader2, User, Map, Bus, Calendar, Clock, MoreHorizontal, FileCheck, DollarSign } from 'lucide-react';

const FarmerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await getMyBookings();
      // Sort by date (newest first)
      const sorted = res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: 'Confirmed' | 'Declined' | 'Completed') => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this booking?`)) return;
    try {
      await updateBookingStatus(bookingId, status); 
      // Optimistic update
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
      alert(`Booking ${status}`);
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const filteredBookings = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  // Calculate Stats
  const stats = {
      pending: bookings.filter(b => b.status === 'Pending').length,
      confirmed: bookings.filter(b => b.status === 'Confirmed').length,
      total: bookings.length
  };

  if (loading) return (
      <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="animate-spin text-primary mb-4" size={32} />
          <p className="text-gray-500 font-medium">Loading your bookings...</p>
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      
      {/* Header & Stats */}
      <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-6">Booking Requests</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Pending Action</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{stats.pending}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-full text-orange-500"><Clock size={24} /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Upcoming</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{stats.confirmed}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-full text-green-600"><Calendar size={24} /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Total Bookings</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600"><FileCheck size={24} /></div>
              </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
                  <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`
                          px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                          ${filter === f 
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}
                      `}
                  >
                      {f}
                  </button>
              ))}
          </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        
        {filteredBookings.length === 0 ? (
            <div className="text-center py-16 px-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Calendar size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-700">No bookings found</h3>
                <p className="text-gray-500 text-sm mt-1">There are no {filter === 'All' ? '' : filter.toLowerCase()} bookings at the moment.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                    <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Activity Date</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Requirements</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                    {filteredBookings.map(booking => (
                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                        
                        {/* Guest Column */}
                        <td className="px-8 py-5">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {booking.touristId?.fullName?.charAt(0) || 'G'}
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-bold text-gray-900">{booking.touristId?.fullName || "Guest"}</div>
                                    <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                        <User size={12} className="mr-1" /> {booking.numberOfParticipants} People
                                    </div>
                                </div>
                            </div>
                        </td>

                        {/* Activity Date Column */}
                        <td className="px-6 py-5">
                            <div className="text-sm font-medium text-gray-900">{booking.activityId?.customTitle}</div>
                            <div className="flex items-center text-xs text-gray-500 mt-1 bg-gray-100 w-fit px-2 py-1 rounded-md">
                                <Calendar size={12} className="mr-1.5" />
                                {new Date(booking.activityDate).toLocaleDateString()}
                                <span className="mx-1">•</span>
                                {booking.activityTime.startTime}
                            </div>
                        </td>

                        {/* Requirements Column */}
                        <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                                {booking.pricing.guideCost > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                                    <Map size={10} className="mr-1.5" /> Guide
                                </span>
                                )}
                                {booking.pricing.transportCost > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 w-fit">
                                    <Bus size={10} className="mr-1.5" /> Transport
                                </span>
                                )}
                                {booking.pricing.guideCost === 0 && booking.pricing.transportCost === 0 && (
                                <span className="text-xs text-gray-400 font-medium pl-1">- None -</span>
                                )}
                            </div>
                        </td>

                        {/* Price Column */}
                        <td className="px-6 py-5">
                            <div className="flex items-center text-sm font-bold text-gray-900">
                                <DollarSign size={14} className="text-gray-400 mr-0.5" />
                                {booking.pricing?.totalCost?.toLocaleString()}
                            </div>
                            {booking.pricing.activityCost > 0 && (
                                <div className="text-[10px] text-gray-400">Paid Online</div>
                            )}
                        </td>

                        {/* Status Column */}
                        <td className="px-6 py-5 text-center">
                            <BookingStatusBadge status={booking.status} />
                        </td>

                        {/* Actions Column */}
                        <td className="px-8 py-5 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2 items-center">
                                {booking.status === 'Pending' && (
                                    <>
                                    <button 
                                        onClick={() => handleStatusUpdate(booking._id, 'Confirmed')} 
                                        className="bg-green-50 text-green-700 hover:bg-green-600 hover:text-white p-2 rounded-xl transition-all shadow-sm" 
                                        title="Confirm Booking"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(booking._id, 'Declined')} 
                                        className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white p-2 rounded-xl transition-all shadow-sm" 
                                        title="Decline Booking"
                                    >
                                        <X size={18} />
                                    </button>
                                    </>
                                )}

                                {booking.status === 'Confirmed' && (
                                    <button
                                        onClick={() => handleStatusUpdate(booking._id, 'Completed')}
                                        className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                                    >
                                        <FileCheck size={14} /> Mark Done
                                    </button>
                                )}

                                {/* Read-only view for other statuses */}
                                {['Completed', 'Declined', 'Cancelled'].includes(booking.status) && (
                                    <span className="text-gray-300">
                                        <MoreHorizontal size={20} />
                                    </span>
                                )}
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default FarmerBookings;