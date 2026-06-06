import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getCategories, getTagsByCategory, createActivity, getActivity, updateActivity } from '../../services/activityService';
import { uploadFile } from '../../services/providerService';
import {
    Loader2, Image as ImageIcon, Plus, ChevronRight, ChevronLeft,
    Check, DollarSign, Clock, Users, BarChart, UploadCloud, X, Sparkles, Leaf
} from 'lucide-react';
import { getSmartPricePrediction } from '../../services/aiService';

const ActivityForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEditMode = !!id;

    const jumpToStep = location.state?.jumpToStep;
    const suggestedPrice = location.state?.suggestedPrice;

    const [step, setStep] = useState(jumpToStep || 1);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    // Data sources
    const [categories, setCategories] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        categoryId: '',
        tagIds: [] as string[],
        customTitle: '',
        customDescription: '',
        pricePerPerson: 0,
        durationHours: 1,
        maxParticipants: 10,
        minParticipants: 1,
        difficulty: 'Easy',
        includedItems: [] as string[],
        whatToBring: [] as string[],
        images: [] as { url: string, caption: string }[]
    });

    const [smartPriceData, setSmartPriceData] = useState<any>(null);
    const [analyzingPrice, setAnalyzingPrice] = useState(false);

    // Helper inputs
    const [itemInput, setItemInput] = useState('');
    // const [bringInput, setBringInput] = useState(''); // Can implement similarly if needed

    useEffect(() => {
        getCategories().then(res => setCategories(res.data)).catch(console.error);
        if (isEditMode) {
            setFetchingData(true);
            getActivity(id!)
                .then(res => {
                    const responseBody = res.data;
                    const data = responseBody.data;
                    // Backend එකෙන් එන data Form එකට ගැලපෙන විදියට map කරගන්න
                    setFormData({
                        categoryId: data.categoryId._id || data.categoryId, // Populated object හෝ ID එක වෙන්න පුළුවන්
                        tagIds: data.tagIds.map((t: any) => t._id || t),
                        customTitle: data.customTitle,
                        customDescription: data.customDescription,
                        pricePerPerson: suggestedPrice || data.pricePerPerson || 0,
                        durationHours: data.durationHours,
                        maxParticipants: data.maxParticipants,
                        minParticipants: data.minParticipants || 1,
                        difficulty: data.difficulty,
                        includedItems: data.includedItems || [],
                        whatToBring: data.whatToBring || [],
                        images: data.images || []
                    });
                    if (suggestedPrice) {
                        // Step 3 එකට මාරු වෙන්න (State එකේ මුලින්ම setStep කළාට, සමහර වෙලාවට data load වුනාම reset වෙන්න පුළුවන් නිසා මෙතනත් දාමු)
                        setStep(3);
                    }

                })
                .catch(err => {
                    console.error(err);
                    alert("Failed to load activity details.");
                    navigate('/farmer/activities');
                })
                .finally(() => setFetchingData(false));
        }
    }, [id, isEditMode, navigate, suggestedPrice]);

    useEffect(() => {
        if (formData.categoryId) {
            getTagsByCategory(formData.categoryId).then(res => setTags(res.data)).catch(console.error);
        } else {
            setTags([]);
        }
    }, [formData.categoryId]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setLoading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const url = await uploadFile(files[i]);
                setFormData(prev => ({ ...prev, images: [...prev.images, { url, caption: '' }] }));
            }
        } catch (error) {
            console.error(error);
            alert('Image upload failed');
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSmartPriceCheck = async () => {
        if (!formData.categoryId) {
            alert("Please select a category first!");
            return;
        }
        setAnalyzingPrice(true);
        try {
            const res = await getSmartPricePrediction({
                categoryId: formData.categoryId,
                tagIds: formData.tagIds,
                currentPrice: formData.pricePerPerson
            });
            if (res.data.success) {
                setSmartPriceData(res.data);
            }
        } catch (error) {
            console.error("Pricing error", error);
        } finally {
            setAnalyzingPrice(false);
        }
    };

    const applySmartPrice = () => {
        if (smartPriceData) {
            setFormData({ ...formData, pricePerPerson: smartPriceData.suggestedPrice });
            setSmartPriceData(null); // Close modal/tooltip
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (isEditMode) {
                await updateActivity(id!, formData); // Update
                alert('Activity updated successfully!');
            } else {
                await createActivity(formData); // Create
                alert('Activity created successfully!');
            }
            navigate('/farmer/activities'); // Dashboard එක වෙනුවට Activity List එකට යැව්වා
        } catch (error) {
            console.error(error);
            alert(isEditMode ? 'Failed to update activity' : 'Failed to create activity');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    // --- UI Components ---

    const StepIndicator = () => (
        <div className="flex items-center justify-center mb-10">
            {[
                { num: 1, label: 'Category' },
                { num: 2, label: 'Details' },
                { num: 3, label: 'Logistics' }
            ].map((s, idx) => (
                <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center relative z-10">
                        <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                        ${step >= s.num
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-white border-gray-200 text-gray-400'}
                    `}>
                            {step > s.num ? <Check size={20} /> : s.num}
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
        <div className="max-w-5xl mx-auto px-4 py-8 font-sans">

            <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-8 text-center">
                    <h2 className="text-3xl font-serif font-bold text-gray-800">List Your Activity</h2>
                    <p className="text-gray-500 mt-2">Share your authentic rural experience with the world.</p>
                </div>

                <div className="p-8 md:p-12">
                    <StepIndicator />

                    {/* --- STEP 1: Category & Tags --- */}
                    {step === 1 && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                                    Choose a Category
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {categories.map(cat => (
                                        <div
                                            key={cat._id}
                                            onClick={() => setFormData({ ...formData, categoryId: cat._id, tagIds: [] })}
                                            className={`
                                        cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 text-center flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-md
                                        ${formData.categoryId === cat._id
                                                    ? 'border-primary bg-primary/5 shadow-inner'
                                                    : 'border-gray-100 hover:border-primary/50 bg-white'}
                                    `}
                                        >
                                            <span className="text-4xl">{cat.icon}</span>
                                            <h4 className={`font-bold text-sm ${formData.categoryId === cat._id ? 'text-primary' : 'text-gray-600'}`}>
                                                {cat.categoryName}
                                            </h4>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {formData.categoryId && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                                        Select Tags
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {tags.map(tag => {
                                            const isSelected = formData.tagIds.includes(tag._id);
                                            return (
                                                <button
                                                    key={tag._id}
                                                    onClick={() => setFormData(prev => {
                                                        const exists = prev.tagIds.includes(tag._id);
                                                        return {
                                                            ...prev,
                                                            tagIds: exists ? prev.tagIds.filter(id => id !== tag._id) : [...prev.tagIds, tag._id]
                                                        };
                                                    })}
                                                    className={`
                                                px-4 py-2 rounded-full text-sm font-bold transition-all border
                                                ${isSelected
                                                            ? 'bg-primary text-white border-primary shadow-md'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
                                            `}
                                                >
                                                    {tag.tagName}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- STEP 2: Details & Media --- */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fade-in">

                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Activity Title</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-lg"
                                        placeholder="e.g., Sunset Cinnamon Harvesting & Tea Tasting"
                                        value={formData.customTitle}
                                        onChange={e => setFormData({ ...formData, customTitle: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[150px]"
                                        placeholder="Describe the experience in detail..."
                                        value={formData.customDescription}
                                        onChange={e => setFormData({ ...formData, customDescription: e.target.value })}
                                    />

                                    {/* AI Tip */}
                                    <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 flex gap-4">
                                        <div className="bg-white p-2 rounded-full shadow-sm text-indigo-500 h-fit">
                                            <Sparkles size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-indigo-900 text-sm mb-1">AI Recommendation Tip</h4>
                                            <p className="text-xs text-indigo-700 leading-relaxed">
                                                Use keywords like <span className="font-bold">Organic, Traditional, Hands-on, Village Life</span> to attract international tourists. Our AI will automatically translate this for non-English speakers!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Gallery</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group border border-gray-200">
                                            <img src={`http://localhost:5000${img.url}`} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={() => removeImage(i)} className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-all group">
                                        {loading ? (
                                            <Loader2 className="animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <div className="bg-gray-100 p-3 rounded-full mb-2 group-hover:bg-white group-hover:shadow-md transition-all">
                                                    <UploadCloud className="text-gray-400 group-hover:text-primary" size={24} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 group-hover:text-primary">Add Photos</span>
                                            </>
                                        )}
                                        <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 3: Logistics --- */}
                    {step === 3 && (
                        <div className="space-y-8 animate-fade-in">

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                                        Price Per Person (LKR)
                                        {/* Smart Price Button */}
                                        <button
                                            onClick={handleSmartPriceCheck}
                                            className="text-primary hover:text-green-700 flex items-center gap-1 text-[10px] bg-green-50 px-2 py-0.5 rounded-full transition-colors"
                                        >
                                            <Sparkles size={12} /> {analyzingPrice ? 'Analyzing...' : 'Get Smart Price'}
                                        </button>
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-gray-800"
                                            value={formData.pricePerPerson || ''}
                                            onChange={e => setFormData({ ...formData, pricePerPerson: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    {smartPriceData && (
                                        <div className="mt-2 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-xl animate-fade-in shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-indigo-900 font-bold text-sm flex items-center gap-2">
                                                        <Sparkles size={14} className="text-indigo-600" /> AI Suggested Price
                                                    </h4>
                                                    <p className="text-2xl font-bold text-indigo-700 mt-1">
                                                        LKR {smartPriceData.suggestedPrice}
                                                    </p>
                                                    <p className="text-xs text-indigo-500 mt-1 max-w-[200px]">
                                                        {smartPriceData.reasoning}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={applySmartPrice}
                                                        className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                                    >
                                                        Apply Price
                                                    </button>
                                                    <button
                                                        onClick={() => setSmartPriceData(null)}
                                                        className="text-gray-400 text-xs hover:text-gray-600"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex gap-2 text-[10px] text-gray-500 font-medium">
                                                <span className="bg-white px-2 py-1 rounded border border-indigo-100">
                                                    Market Avg: {smartPriceData.marketAvg}
                                                </span>
                                                <span className="bg-white px-2 py-1 rounded border border-indigo-100">
                                                    Range: {smartPriceData.minPrice} - {smartPriceData.maxPrice}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Duration (Hours)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-gray-800"
                                            value={formData.durationHours}
                                            onChange={e => setFormData({ ...formData, durationHours: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Max Participants</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-gray-800"
                                            value={formData.maxParticipants}
                                            onChange={e => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Difficulty Level</label>
                                    <div className="relative">
                                        <BarChart className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <select
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-gray-800 appearance-none"
                                            value={formData.difficulty}
                                            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                        >
                                            <option>Easy</option>
                                            <option>Moderate</option>
                                            <option>Challenging</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Included Items Tag Input */}
                            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                                    <Leaf size={16} className="mr-2 text-primary" /> What's Included?
                                </label>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={itemInput}
                                        onChange={e => setItemInput(e.target.value)}
                                        placeholder="e.g. Traditional Lunch, Welcome Drink"
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), setFormData(prev => ({ ...prev, includedItems: [...prev.includedItems, itemInput] })), setItemInput(''))}
                                    />
                                    <button
                                        onClick={() => { if (itemInput) { setFormData(prev => ({ ...prev, includedItems: [...prev.includedItems, itemInput] })); setItemInput('') } }}
                                        className="bg-primary hover:bg-green-700 text-white px-4 rounded-xl transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.includedItems.length === 0 && <span className="text-gray-400 text-xs italic">No items added yet.</span>}
                                    {formData.includedItems.map((item, i) => (
                                        <span key={i} className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-sm">
                                            {item}
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, includedItems: prev.includedItems.filter((_, idx) => idx !== i) }))}
                                                className="ml-2 hover:text-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Footer Controls --- */}
                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center text-gray-500 font-bold hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft size={20} className="mr-1" /> Back
                            </button>
                        ) : (
                            <div></div> // Spacer
                        )}

                        <button
                            onClick={() => {
                                if (step < 3) setStep(step + 1);
                                else handleSubmit();
                            }}
                            disabled={step === 1 && !formData.categoryId || loading}
                            className="flex items-center bg-secondary hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                step === 3 ? 'Publish Activity' : 'Next Step'
                            )}
                            {!loading && step < 3 && <ChevronRight size={20} className="ml-2" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityForm;