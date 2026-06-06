import React, { useState } from 'react';
import { updateAvailability, bulkUpdateAvailability } from '../../services/activityService';
import { Calendar, Clock, Save, Repeat, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface AvailabilityCalendarProps {
  activityId: string;
  onUpdate?: () => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ activityId, onUpdate }) => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([{ startTime: '09:00', endTime: '12:00', availableSlots: 10 }]);

  // Single Date State
  const [selectedDate, setSelectedDate] = useState('');

  // Bulk State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0=Sun, 1=Mon

  const handleSlotChange = (index: number, field: string, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const addSlot = () => {
    setSlots([...slots, { startTime: '13:00', endTime: '16:00', availableSlots: 10 }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (mode === 'single') {
        if (!selectedDate) throw new Error('Please select a date');
        await updateAvailability(activityId, { date: selectedDate, timeSlots: slots });
      } else {
        if (!startDate || !endDate) throw new Error('Please select start and end dates');
        if (selectedDays.length === 0) throw new Error('Please select at least one day of the week');

        await bulkUpdateAvailability(activityId, {
          startDate,
          endDate,
          daysOfWeek: selectedDays,
          timeSlots: slots
        });
      }

      alert('Availability updated successfully!');
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to update availability';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl mt-6 animate-fade-in font-sans">
      
      {/* --- Header & Toggle --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h4 className="text-xl font-serif font-bold text-gray-800 flex items-center gap-2">
             <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calendar size={20} /></div>
             Manage Availability
           </h4>
           <p className="text-sm text-gray-400 mt-1 ml-11">Set when tourists can book this activity.</p>
        </div>
        
        {/* Modern Segmented Control */}
        <div className="bg-gray-100 p-1.5 rounded-xl flex self-start md:self-auto">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                mode === 'single' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Single Date
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                mode === 'bulk' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bulk Update
          </button>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* --- Date Selection Section --- */}
        {mode === 'single' ? (
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              className="w-full md:w-1/2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-700 font-medium"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        ) : (
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-6">
            
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full p-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-700 font-medium"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full p-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-700 font-medium"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Weekday Repeater */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Repeat On</label>
              <div className="flex gap-2 flex-wrap">
                {daysLabels.map((day, index) => {
                  const isSelected = selectedDays.includes(index);
                  return (
                    <button
                        key={day}
                        onClick={() => toggleDay(index)}
                        className={`
                            w-11 h-11 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center border
                            ${isSelected 
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110' 
                                : 'bg-white border-gray-200 text-gray-400 hover:border-primary/50 hover:text-primary'
                            }
                        `}
                    >
                        {day.charAt(0)}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center mt-3 text-xs font-medium text-blue-600 bg-blue-100/50 py-1.5 px-3 rounded-lg w-fit">
                <Repeat size={12} className="mr-1.5" /> 
                Applies to all selected days within the date range.
              </div>
            </div>
          </div>
        )}

        {/* --- Time Slots Section --- */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-4">
             <label className="text-sm font-bold text-gray-700">
               {mode === 'single' ? 'Available Time Slots' : 'Daily Schedule Template'}
             </label>
             <button 
                onClick={addSlot} 
                className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
             >
               <Plus size={14} /> Add Slot
             </button>
          </div>

          <div className="space-y-3">
            {slots.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <p className="text-gray-400 text-sm">No time slots added yet.</p>
                </div>
            )}
            
            {slots.map((slot, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-primary/30 transition-colors group">
                
                {/* Time Range */}
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                  <input 
                    type="time" 
                    value={slot.startTime} 
                    onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)} 
                    className="bg-transparent p-1.5 text-sm font-bold text-gray-700 outline-none w-24 text-center" 
                  />
                  <span className="text-gray-400 text-xs font-medium">TO</span>
                  <input 
                    type="time" 
                    value={slot.endTime} 
                    onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)} 
                    className="bg-transparent p-1.5 text-sm font-bold text-gray-700 outline-none w-24 text-center" 
                  />
                </div>

                {/* Capacity Input */}
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-gray-400 uppercase">Capacity:</span>
                    <input
                        type="number"
                        value={slot.availableSlots}
                        onChange={(e) => handleSlotChange(index, 'availableSlots', parseInt(e.target.value))}
                        className="w-20 p-2 text-center text-sm font-bold border border-gray-200 rounded-lg focus:border-primary outline-none"
                        min={1}
                    />
                    <span className="text-xs text-gray-400">guests</span>
                </div>

                {/* Remove Button */}
                <button 
                    onClick={() => removeSlot(index)} 
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove Slot"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || slots.length === 0}
            className="bg-secondary hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
                <span className="flex items-center gap-2">Saving...</span>
            ) : (
                <>
                   <CheckCircle size={18} className="mr-2" /> 
                   Save Availability
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;