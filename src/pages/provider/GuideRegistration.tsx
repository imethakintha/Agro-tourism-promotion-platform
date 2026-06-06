import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerGuide } from '../../services/providerService';
import FileUpload from '../../components/common/FileUpload';
import { Loader2 } from 'lucide-react';
import AdvancedLocationPicker from '../../components/common/AdvancedLocationPicker';

const GuideRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    nic: '',
    location: { type: 'Point', coordinates: [0, 0] },
    serviceRadius: 20, // Default 20km
    address: '',
    yearsOfExperience: 0,
    bio: '',
    pricing: { priceModel: 'PerHalfDay', rate: 0 },
    documents: [] as { documentType: string, url: string }[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerGuide(formData);
      alert('Guide registration submitted successfully!');
      navigate('/dashboard/guide');
    } catch (error) {
      console.error(error);
      alert('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Guide Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            placeholder="License Number"
            className="border p-2 rounded w-full"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            required
          />
          <input
            placeholder="NIC Number"
            className="border p-2 rounded w-full"
            value={formData.nic}
            onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
            required
          />
        </div>
        <div className="space-y-4 border-t border-b py-4">
          <h4 className="font-medium">Service Area</h4>
          <p className="text-xs text-gray-500">Set your base location and how far you can travel.</p>

          <AdvancedLocationPicker
            onLocationSelect={(loc) => {
              console.log("Selected Location:", loc);
              setFormData(prev => ({
                ...prev,
                address: loc.address, // Display purpose
                location: {
                  type: 'Point',
                  coordinates: loc.coordinates // [lng, lat]
                }
              }));
            }}
          />

          {/* Radius Slider */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Service Radius</span>
              <span className="font-bold text-primary">{formData.serviceRadius} km</span>
            </div>
            <input
              type="range" min="5" max="100" step="5"
              value={formData.serviceRadius}
              onChange={(e) => setFormData({ ...formData, serviceRadius: parseInt(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        </div>
        <input
          type="number"
          placeholder="Years of Experience"
          className="border p-2 rounded w-full"
          value={formData.yearsOfExperience}
          onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) })}
          required
        />
        <textarea
          placeholder="Short Bio"
          rows={4}
          className="border p-2 rounded w-full"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            className="border p-2 rounded w-full"
            value={formData.pricing.priceModel}
            onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, priceModel: e.target.value } })}
          >
            <option value="PerHour">Per Hour</option>
            <option value="PerHalfDay">Per Half Day</option>
            <option value="PerFullDay">Per Full Day</option>
          </select>
          <input
            type="number"
            placeholder="Rate (LKR)"
            className="border p-2 rounded w-full"
            value={formData.pricing.rate}
            onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, rate: parseInt(e.target.value) } })}
            required
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Upload Documents</h4>
          <FileUpload label="Tourist Board License" onUpload={(url) => setFormData(prev => ({ ...prev, documents: [...prev.documents, { documentType: 'License', url }] }))} />
          <FileUpload label="Police Clearance" onUpload={(url) => setFormData(prev => ({ ...prev, documents: [...prev.documents, { documentType: 'PoliceClearance', url }] }))} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-green-700 flex justify-center">
          {loading ? <Loader2 className="animate-spin" /> : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
};

export default GuideRegistration;