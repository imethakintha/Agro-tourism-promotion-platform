import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';
import { submitFeedback } from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    subject: '',
    category: 'General',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitFeedback({
          ...formData,
          userId: user?.id // Logged in නම් ID එක යවනවා
      });
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', category: 'General', message: '' }); // Reset form
      setTimeout(() => setSuccess(false), 5000); // 5 sec වලින් success msg එක යනවා
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-green-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about agro-tourism? Found a bug? Or just want to say hi? 
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-xl text-green-600">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Email Us</h3>
                <p className="text-gray-600 mt-1">support@agrolk.com</p>
                <p className="text-gray-500 text-sm mt-1">We typically reply within 24h</p>
              </div>
            </div>
            {/* Add more info cards if needed (Phone, Location etc.) */}
          </div>

          {/* Feedback Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-green-50">
              {success ? (
                  <div className="text-center py-12 animate-fade-in">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="text-green-600" size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Message Sent!</h3>
                      <p className="text-gray-500 mt-2">Thank you for your feedback. We'll get back to you shortly.</p>
                      <button onClick={() => setSuccess(false)} className="mt-6 text-green-600 font-bold hover:underline">Send another message</button>
                  </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                        <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder="john@example.com"
                        />
                    </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <input
                            type="text"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                            placeholder="How can we help?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="General">General Inquiry</option>
                                <option value="Bug">Report a Bug</option>
                                <option value="Complaint">Complaint</option>
                                <option value="Suggestion">Suggestion</option>
                            </select>
                        </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                    />
                    </div>

                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                    >
                    {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    Send Message
                    </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;