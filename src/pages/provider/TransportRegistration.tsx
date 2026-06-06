import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerTransport } from '../../services/providerService';
import FileUpload from '../../components/common/FileUpload';
import { Loader2 } from 'lucide-react';
import AdvancedLocationPicker from '../../components/common/AdvancedLocationPicker';

const TransportRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: 'Car',
    vehicleRegistrationNo: '',
    location: {
      type: 'Point',
      coordinates: [0, 0], // [Longitude, Latitude]
      address: ''
    },
    address: '',
    maxPassengers: 4,
    pricePerKm: 0,
    basePrice: 0,
    documents: [] as { documentType: string, url: string }[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
      alert("Please pin your base location on the map!");
      return;
    }
    setLoading(true);
    try {
      await registerTransport(formData);
      alert('Transport registration submitted successfully!');
      navigate('/dashboard/transport');
    } catch (error) {
      console.error(error);
      alert('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Transport Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select
              className="border p-2 rounded w-full"
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            >
              {['Car', 'Van', 'Bus', 'Tuk-Tuk', 'SUV', 'Mini-Bus'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Reg No</label>
            <input
              placeholder="e.g. WP CAA-1234"
              className="border p-2 rounded w-full"
              value={formData.vehicleRegistrationNo}
              onChange={(e) => setFormData({ ...formData, vehicleRegistrationNo: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="space-y-4 border-t border-b py-4">
          <h4 className="font-medium text-gray-800">Base Location / Service Area</h4>
          <p className="text-xs text-gray-500">Set the main location where you operate from.</p>
          <AdvancedLocationPicker
            initialCoordinates={
              formData.location.coordinates[0] !== 0
                ? [formData.location.coordinates[0], formData.location.coordinates[1]]
                : undefined
            }
            onLocationSelect={(loc) => {
              // Address සහ Coordinates දෙකම State එකට දාගන්න
              setFormData(prev => ({
                ...prev,
                address: loc.address, // For manual display input
                location: {
                  type: 'Point',
                  address: loc.address,
                  coordinates: loc.coordinates
                }
              }));
            }}
          />
          <input
            placeholder="Location Address"
            className="border p-2 rounded w-full bg-gray-50"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            readOnly
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Passengers:</label>
          <input
            type="number"
            placeholder="Max Passengers"
            className="border p-2 rounded w-full"
            value={formData.maxPassengers}
            onChange={(e) => setFormData({ ...formData, maxPassengers: parseInt(e.target.value) })}
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Per KM:</label>
          <input
            type="number"
            placeholder="Price Per KM"
            className="border p-2 rounded w-full"
            value={formData.pricePerKm}
            onChange={(e) => setFormData({ ...formData, pricePerKm: parseInt(e.target.value) })}
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Base Price:</label>
          <input
            type="number"
            placeholder="Base Price"
            className="border p-2 rounded w-full"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Upload Documents</h4>
          <FileUpload label="Driving License" onUpload={(url) => setFormData(prev => ({ ...prev, documents: [...prev.documents, { documentType: 'DrivingLicense', url }] }))} />
          <FileUpload label="Vehicle Registration" onUpload={(url) => setFormData(prev => ({ ...prev, documents: [...prev.documents, { documentType: 'VehicleRegistration', url }] }))} />
          <FileUpload label="Revenue License" onUpload={(url) => setFormData(prev => ({ ...prev, documents: [...prev.documents, { documentType: 'RevenueLicense', url }] }))} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-green-700 flex justify-center">
          {loading ? <Loader2 className="animate-spin" /> : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
};

export default TransportRegistration;