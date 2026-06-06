import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerFarm } from '../../services/providerService';
import FileUpload from '../../components/common/FileUpload';
import { 
  Loader2, CheckCircle, Building, MapPin, FileText, 
  ChevronRight, ChevronLeft, Sprout, Wand2 
} from 'lucide-react';
import AdvancedLocationPicker from '../../components/common/AdvancedLocationPicker';

const FarmRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    farmName: '',
    farmType: 'Spice Garden',
    description: '',
    location: {
      address: '',
      city: '',
      district: '',
      coordinates: { lat: 6.9271, lng: 79.8612 }
    },
    facilities: [] as string[],
    documents: [] as { documentType: string, url: string }[]
  });

  const magicFill = () => {
    setFormData({
      farmName: "Misty Valley Tea & Vanilla Estate",
      farmType: "Spice Garden",
      description: "A lush, eco-conscious estate nestled in the misty hills of Nawalapitiya, specializing in premium organic tea and high-quality Bourbon vanilla, focusing on sustainable highland agriculture.",
      location: {
        address: "No. 42, Kadiyanlena Road, Nawalapitiya",
        city: "Nawalapitiya",
        district: "Kandy",
        coordinates: { lat: 7.0325, lng: 80.5986 }
      },
      facilities: ['Parking', 'Restrooms', 'Dining Area', 'First Aid'],
      documents: [
        { documentType: 'NIC', url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh4u3TmiZswGkqzl8gSVdOsf0LTLQIXDdXSgiF49erZAwGiT0w0d8oh4aGLgH1B_VNXRFkQLJ6h0z0g2fGKNX8TiTSqSoFRLwGHsBVULj5_eLGpe-V7m_HdPAUuWUnFn9SiOQS3bUE1Vk_6/s1600/NIC_CI.jpg' },
        { documentType: 'LandOwnership', url: 'https://static.vecteezy.com/system/resources/previews/068/582/784/non_2x/land-certificate-free-editor_template.jpeg' }
      ]
    });
  };

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const locField = name.split('.')[1];
      setFormData(prev => ({ ...prev, location: { ...prev.location, [locField]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFacilityChange = (facility: string) => {
    setFormData(prev => {
      const newFacilities = prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility];
      return { ...prev, facilities: newFacilities };
    });
  };

  const handleDocUpload = (type: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents.filter(d => d.documentType !== type), { documentType: type, url }]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await registerFarm(formData);
      alert('Farm registration submitted successfully! Pending approval.');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  // --- UI Components ---
  
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
        {[
            { num: 1, label: 'Basics', icon: <Building size={18} /> },
            { num: 2, label: 'Location', icon: <MapPin size={18} /> },
            { num: 3, label: 'Verify', icon: <FileText size={18} /> }
        ].map((s, idx) => (
            <React.Fragment key={s.num}>
                <div className="flex flex-col items-center relative z-10 group">
                    <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                        ${step >= s.num 
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
                            : 'bg-white border-gray-200 text-gray-400 group-hover:border-primary/50'}
                    `}>
                        {step > s.num ? <CheckCircle size={24} /> : s.icon}
                    </div>
                    <span className={`text-xs font-bold mt-2 uppercase tracking-wider ${step >= s.num ? 'text-primary' : 'text-gray-400'}`}>
                        {s.label}
                    </span>
                </div>
                {idx < 2 && (
                    <div className={`w-24 h-1 mx-2 -mt-6 rounded-full transition-all duration-500 ${step > s.num ? 'bg-primary' : 'bg-gray-100'}`}></div>
                )}
            </React.Fragment>
        ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary/5 p-8 text-center border-b border-primary/10">
           <h2 className="text-3xl font-serif font-bold text-gray-800 flex items-center justify-center gap-2">
              <Sprout className="text-primary" /> Register Your Farm
           </h2>
           <p className="text-gray-500 mt-2">Join Sri Lanka's largest agro-tourism network.</p>
        </div>

        <div className="p-8 md:p-12">
          <StepIndicator />

          <div className="flex justify-end mb-4">
             <button
               type="button"
               onClick={magicFill}
               className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-xl text-sm font-bold hover:shadow-md transition-all border border-amber-200"
             >
               <Wand2 size={16} /> Demo Magic Fill
             </button>
          </div>

          {/* --- STEP 1: Basic Information --- */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Farm Name</label>
                    <input 
                       name="farmName" 
                       value={formData.farmName} 
                       onChange={handleInputChange} 
                       placeholder="e.g. Green Valley Spice Garden"
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Farm Type</label>
                    <select 
                       name="farmType" 
                       value={formData.farmType} 
                       onChange={handleInputChange} 
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium appearance-none"
                    >
                       {['Spice Garden', 'Tea Plantation', 'Paddy Field', 'Fruit Orchard', 'Vegetable Farm', 'Organic Farm', 'Mixed Farm', 'Other'].map(t => (
                          <option key={t} value={t}>{t}</option>
                       ))}
                    </select>
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                 <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows={4} 
                    placeholder="Tell tourists about your farm's history, crops, and what makes it special..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                 />
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-3">Available Facilities</label>
                 <div className="flex flex-wrap gap-3">
                    {['Parking', 'Restrooms', 'Dining Area', 'Accommodation', 'First Aid', 'WiFi', 'Wheelchair Accessible', 'Pet Friendly'].map(f => {
                       const isSelected = formData.facilities.includes(f);
                       return (
                          <button 
                             key={f} 
                             onClick={() => handleFacilityChange(f)}
                             className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                                isSelected 
                                ? 'bg-primary text-white border-primary shadow-md' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                             }`}
                          >
                             {f}
                          </button>
                       );
                    })}
                 </div>
              </div>
            </div>
          )}

          {/* --- STEP 2: Location --- */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                 <MapPin className="text-blue-600 flex-shrink-0" />
                 <div>
                    <h4 className="font-bold text-blue-900 text-sm">Pin Point Accuracy</h4>
                    <p className="text-xs text-blue-700 mt-1">
                       Use the map to pin the <strong>exact entrance</strong> of your farm. This location will be used for tourist navigation.
                    </p>
                 </div>
              </div>

              <div className="border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                 <AdvancedLocationPicker
                    onLocationSelect={(loc) => {
                       setFormData(prev => ({
                          ...prev,
                          location: {
                             ...prev.location,
                             address: loc.address,
                             city: loc.city,
                             district: loc.district,
                             coordinates: { lat: loc.coordinates[1], lng: loc.coordinates[0] }
                          }
                       }));
                    }}
                    initialCoordinates={
                       formData.location.coordinates.lng && formData.location.coordinates.lat
                          ? [formData.location.coordinates.lng, formData.location.coordinates.lat]
                          : undefined
                    }
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                 <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Formatted Address</label>
                    <input
                       name="location.address"
                       value={formData.location.address}
                       onChange={handleInputChange}
                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:border-primary outline-none"
                       placeholder="Auto-filled from map..."
                       readOnly
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">City</label>
                    <input 
                       name="location.city" 
                       value={formData.location.city} 
                       onChange={handleInputChange} 
                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:border-primary outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">District</label>
                    <input 
                       name="location.district" 
                       value={formData.location.district} 
                       onChange={handleInputChange} 
                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:border-primary outline-none"
                    />
                 </div>
              </div>
            </div>
          )}

          {/* --- STEP 3: Verification --- */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
               <div className="text-center max-w-lg mx-auto">
                  <h3 className="text-xl font-bold text-gray-800">Verify Ownership</h3>
                  <p className="text-gray-500 text-sm mt-2">
                     To maintain trust on AgroLK, we need to verify that you own or manage this farm. 
                     Please upload <strong>at least one</strong> of the following.
                  </p>
               </div>

               <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                     <FileUpload 
                        label="National ID Copy (NIC)" 
                        onUpload={(url) => handleDocUpload('NIC', url)} 
                        helperText="Front and back of owner's ID"
                     />
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                     <FileUpload 
                        label="Land Ownership / Deed" 
                        onUpload={(url) => handleDocUpload('LandOwnership', url)} 
                        helperText="Proof of land ownership or lease agreement"
                     />
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                     <FileUpload 
                        label="Business Registration (Optional)" 
                        onUpload={(url) => handleDocUpload('BusinessRegistration', url)} 
                        helperText="If registered as a business entity"
                     />
                  </div>
               </div>
            </div>
          )}

          {/* --- Navigation Buttons --- */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
             {step > 1 ? (
                <button 
                   onClick={() => setStep(step - 1)} 
                   className="flex items-center text-gray-500 font-bold hover:text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                   <ChevronLeft size={20} className="mr-1" /> Back
                </button>
             ) : <div></div>}

             <button 
                onClick={() => {
                   if (step < 3) setStep(step + 1);
                   else handleSubmit();
                }} 
                disabled={loading || (step === 1 && !formData.farmName)}
                className="flex items-center bg-secondary hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-amber-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none"
             >
                {loading ? (
                   <Loader2 className="animate-spin mr-2" />
                ) : (
                   step === 3 ? (
                      <>Submit Registration <CheckCircle size={20} className="ml-2" /></>
                   ) : (
                      <>Next Step <ChevronRight size={20} className="ml-2" /></>
                   )
                )}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FarmRegistration;