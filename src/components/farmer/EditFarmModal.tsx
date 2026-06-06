import React, { useState } from 'react';
import { X, Loader2, Save, MapPin, Plus, Trash2, Layout, Image as ImageIcon, Check } from 'lucide-react';
import { updateFarmDetails, uploadFile } from '../../services/providerService';

interface EditFarmModalProps {
  farm: any;
  onClose: () => void;
  onUpdate: () => void;
}

const EditFarmModal: React.FC<EditFarmModalProps> = ({ farm, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    farmName: farm.farmName || '',
    description: farm.description || '',
    location: {
      address: farm.location?.address || '',
      city: farm.location?.city || '',
      district: farm.location?.district || ''
    },
    facilities: farm.facilities || [],
    images: farm.images || []
  });

  const [newFacility, setNewFacility] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
     if (name.includes('location.')) {
         const field = name.split('.')[1];
         setFormData(prev => ({
             ...prev,
             location: { ...prev.location, [field]: value }
         }));
     } else {
         setFormData(prev => ({ ...prev, [name]: value }));
     }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      setLoading(true);
      try {
          const url = await uploadFile(files[0]); // Upload first file
          setFormData(prev => ({
              ...prev,
              images: [...prev.images, { url, caption: '', isPrimary: prev.images.length === 0 }]
          }));
      } catch (err) {
          alert('Image upload failed');
      } finally {
          setLoading(false);
      }
  };

  const removeImage = (index: number) => {
      setFormData(prev => ({
          ...prev,
          images: prev.images.filter((_: any, i: number) => i !== index)
      }));
  };

  const addFacility = () => {
      if (newFacility.trim()) {
          setFormData(prev => ({ ...prev, facilities: [...prev.facilities, newFacility] }));
          setNewFacility('');
      }
  };

  const removeFacility = (fac: string) => {
      setFormData(prev => ({ ...prev, facilities: prev.facilities.filter((f: string) => f !== fac) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await updateFarmDetails(formData);
          alert('Farm details updated successfully!');
          onUpdate();
          onClose();
      } catch (error) {
          console.error(error);
          alert('Failed to update farm');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       {/* Backdrop with Blur */}
       <div 
         className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
         onClick={onClose}
       ></div>

       {/* Modal Content */}
       <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl flex flex-col font-sans animate-scale-up">
           
           {/* Header */}
           <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
               <div>
                   <h2 className="text-2xl font-serif font-bold text-primary">Edit Farm Profile</h2>
                   <p className="text-sm text-gray-400 mt-1">Update your farm's information and gallery.</p>
               </div>
               <button 
                 onClick={onClose} 
                 className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
               >
                   <X size={20}/>
               </button>
           </div>
           
           {/* Scrollable Form Body */}
           <div className="overflow-y-auto custom-scrollbar flex-1">
               <form onSubmit={handleSubmit} className="p-8 space-y-10">
                   
                   {/* Section 1: Basic Info */}
                   <div className="space-y-6">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
                           <Layout size={16} className="text-secondary"/> General Information
                       </h3>
                       
                       <div className="grid gap-6">
                           <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">Farm Name</label>
                               <input 
                                   name="farmName" 
                                   value={formData.farmName} 
                                   onChange={handleChange} 
                                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" 
                                   placeholder="e.g. Green Valley Estate"
                                   required 
                               />
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                               <textarea 
                                   name="description" 
                                   rows={4} 
                                   value={formData.description} 
                                   onChange={handleChange} 
                                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm leading-relaxed" 
                                   placeholder="Tell us the story of your farm..."
                               />
                           </div>
                       </div>
                   </div>

                   {/* Section 2: Location */}
                   <div className="space-y-6">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
                           <MapPin size={16} className="text-secondary"/> Location Details
                       </h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="md:col-span-2">
                               <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                               <input 
                                   name="location.address" 
                                   value={formData.location.address} 
                                   onChange={handleChange} 
                                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                               />
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                               <input 
                                   name="location.city" 
                                   value={formData.location.city} 
                                   onChange={handleChange} 
                                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                               />
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                               <input 
                                   name="location.district" 
                                   value={formData.location.district} 
                                   onChange={handleChange} 
                                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                               />
                           </div>
                       </div>
                   </div>

                   {/* Section 3: Facilities */}
                   <div className="space-y-6">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
                           <Check size={16} className="text-secondary"/> Amenities & Facilities
                       </h3>
                       
                       <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                           <div className="flex gap-3 mb-4">
                               <input 
                                   value={newFacility} 
                                   onChange={e => setNewFacility(e.target.value)} 
                                   placeholder="Add a facility (e.g. Free Wi-Fi, Parking)" 
                                   className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                   onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                               />
                               <button 
                                   type="button" 
                                   onClick={addFacility} 
                                   className="bg-primary text-white px-5 rounded-xl hover:bg-green-700 font-bold transition-colors flex items-center"
                               >
                                   <Plus size={18} />
                               </button>
                           </div>
                           
                           <div className="flex flex-wrap gap-2">
                               {formData.facilities.length === 0 && (
                                   <span className="text-sm text-gray-400 italic">No facilities added yet.</span>
                               )}
                               {formData.facilities.map((fac: string, i: number) => (
                                   <span key={i} className="group bg-white border border-gray-200 text-gray-700 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium flex items-center shadow-sm hover:border-primary/50 transition-all">
                                       {fac}
                                       <button 
                                           type="button" 
                                           onClick={() => removeFacility(fac)} 
                                           className="ml-2 w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                       >
                                           <X size={12} />
                                       </button>
                                   </span>
                               ))}
                           </div>
                       </div>
                   </div>

                   {/* Section 4: Images */}
                   <div className="space-y-6">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
                           <ImageIcon size={16} className="text-secondary"/> Gallery
                       </h3>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {formData.images.map((img: any, i: number) => (
                               <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-gray-100">
                                   <img 
                                      src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`} 
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                      alt="Farm"
                                   />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                       <button 
                                           type="button" 
                                           onClick={() => removeImage(i)} 
                                           className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500 hover:text-white transition-all"
                                       >
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                               </div>
                           ))}
                           
                           {/* Upload Button */}
                           <label className="aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all group">
                               <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-white group-hover:shadow-sm transition-all">
                                   <Plus size={20} className="text-gray-400 group-hover:text-primary"/>
                               </div>
                               <span className="text-xs font-bold text-gray-500 group-hover:text-primary">Add Photo</span>
                               <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                           </label>
                       </div>
                   </div>
               </form>
           </div>
           
           {/* Footer */}
           <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 z-10">
               <button 
                   onClick={onClose}
                   className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
               >
                   Cancel
               </button>
               <button 
                   onClick={handleSubmit} 
                   disabled={loading} 
                   className="bg-secondary hover:bg-amber-600 text-white px-8 py-3 rounded-xl flex items-center font-bold shadow-lg shadow-amber-100 transform active:scale-95 transition-all disabled:opacity-70"
               >
                   {loading ? <Loader2 className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>}
                   Save Changes
               </button>
           </div>
       </div>
    </div>
  );
};

export default EditFarmModal;