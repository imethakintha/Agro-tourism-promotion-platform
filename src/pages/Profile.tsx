import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import { User, Mail, Phone, Camera, Loader2, Save, LogOut, CheckCircle2, MapPin } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    countryOfResidence: 'Sri Lanka'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        countryOfResidence: user.countryOfResidence || 'Sri Lanka' 
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.updateProfile(formData);
      if (response.success) {
        const updatedUser = response.data.profile;
        updateUser({ ...updatedUser, id: updatedUser._id });
        setIsEditing(false);
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update failed', error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formDataUpload = new FormData();
      formDataUpload.append('profilePic', file);

      try {
          const response = await authService.uploadProfilePic(formDataUpload);
          if (response.success && user) {
             updateUser({ ...user, profilePic: response.data.profilePicUrl });
          }
      } catch (error) {
          console.error('Image upload failed', error);
          alert('Failed to upload image');
      }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
         <div>
            <h1 className="text-4xl font-serif font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
         </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-white/50 overflow-hidden relative">
        
        {/* Cover Photo Area */}
        <div className="h-48 relative overflow-hidden group">
            <img 
               src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop" 
               alt="Cover" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        
        <div className="px-8 pb-8">
          
          {/* Avatar & Action Row */}
          <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 mb-8 gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-[6px] border-white bg-gray-200 overflow-hidden flex items-center justify-center shadow-lg">
                {user.profilePic ? (
                   <img src={`http://localhost:5000${user.profilePic}`} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                   <User size={48} className="text-gray-400" />
                )}
              </div>
              
              <label className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-all hover:scale-110 border border-gray-100 group-hover:opacity-100">
                <Camera size={18} className="text-primary" />
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="mb-2 bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Personal Info */}
            <div>
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">
                   Personal Information
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                    ) : (
                      <div className="text-lg font-medium text-gray-900 border-b border-transparent py-2.5 px-1">{user.fullName}</div>
                    )}
                  </div>

                  {/* Email (Read Only mostly) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Email Address</label>
                    <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                      <Mail size={18} className="mr-3 text-gray-400" />
                      {user.email}
                      {user.emailVerified && (
                          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                             <CheckCircle2 size={10} /> Verified
                          </span>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                    ) : (
                      <div className="flex items-center text-gray-800 py-2.5 px-1">
                        <Phone size={18} className="mr-3 text-gray-400" />
                        {user.phoneNumber}
                      </div>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                     <label className="block text-sm font-bold text-gray-700">Country of Residence</label>
                     {isEditing ? (
                        <select
                          name="countryOfResidence"
                          value={formData.countryOfResidence}
                          onChange={handleChange as any}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium appearance-none"
                        >
                            {['France', 'Germany', 'China', 'Japan', 'India', 'Australia', 'USA', 'UK', 'Korea', 'Russia', 'Netherlands','Canada','Italy','Poland','Sri Lanka','Maldives','Other'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                     ) : (
                        <div className="flex items-center text-gray-800 py-2.5 px-1">
                           <MapPin size={18} className="mr-3 text-gray-400" />
                           {user.countryOfResidence || 'Not Specified'}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Section 2: Account Details */}
            <div>
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">
                   Account Details
               </h3>
               <div className="flex items-center gap-4">
                  <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                     <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <User size={20} />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-blue-400 uppercase">Role</p>
                        <p className="font-bold text-blue-800">{user.role}</p>
                     </div>
                  </div>
                  {/* Can add more stats here later like "Member since", "Bookings count" etc. */}
               </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 animate-fade-in">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-primary/30 transform active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 border border-red-100 bg-red-50/50 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
           <h3 className="text-lg font-bold text-red-600">Account Actions</h3>
           <p className="text-sm text-red-400/80 mt-1">Sign out of your session or manage account deletion.</p>
        </div>
        <button 
            onClick={logout}
            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
        >
            <LogOut size={18} /> Logout
        </button>
      </div>

    </div>
  );
};

export default Profile;