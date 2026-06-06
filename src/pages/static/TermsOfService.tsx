import React from 'react';
import { Shield, FileText, AlertCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <FileText className="mr-3 text-primary" size={32} />
        Terms of Service
      </h1>

      <div className="space-y-8 text-gray-600 leading-relaxed">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Shield size={20} className="mr-2 text-green-600"/> 1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using AgroLK, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">2. User Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Users must provide accurate and complete registration information.</li>
            <li>Tourists are responsible for their conduct during farm visits.</li>
            <li>Farmers must ensure the safety and accuracy of their listed activities.</li>
            <li>Guides and Transport Providers must maintain valid licenses and insurance.</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">3. Booking & Cancellations</h2>
          <p className="mb-3">
            <strong>Cancellations:</strong> Tourists can cancel a booking up to 24 hours before the scheduled time for a full refund. Cancellations made within 24 hours are non-refundable.
          </p>
          <p>
            <strong>Provider Cancellations:</strong> If a Farmer, Guide, or Transport Provider cancels, the tourist will receive a full refund regardless of the time.
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
             <AlertCircle size={20} className="mr-2 text-amber-500"/> 4. Liability Disclaimer
          </h2>
          <p>
            AgroLK acts solely as a platform to connect users. We are not liable for any direct, indirect, incidental, or consequential damages arising from the use of our service or participation in any farm activities.
          </p>
        </section>
        
        <div className="text-sm text-gray-500 pt-4 border-t">
            Last updated: December 2025
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;