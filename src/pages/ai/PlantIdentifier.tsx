import React, { useState, useContext } from 'react';
import { identifyPlant } from '../../services/aiService';
import { AuthContext } from '../../context/AuthContext';
import {
  Camera, Upload, Loader2, Sprout, Info, Map, AlertTriangle,
  TrendingUp, FileText, ScanLine, X, ChevronRight, Leaf,
  CheckCircle, Droplets, HeartPulse
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ════════════════════════════════════════════════
   INJECTED KEYFRAMES
   ════════════════════════════════════════════════ */
const PLANT_ANIM_CSS = `
  @keyframes scanBeam {
    0%   { top: 0%; }
    100% { top: 100%; }
  }
  .scan-beam {
    position: absolute;
    left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent 0%, #FFB000 30%, #FFB000 70%, transparent 100%);
    box-shadow: 0 0 18px 4px rgba(255,176,0,0.45);
    animation: scanBeam 2s linear infinite;
    z-index: 10;
  }
  @keyframes plantFadeUp {
    0%  { opacity:0; transform:translateY(14px); }
    100%{ opacity:1; transform:translateY(0); }
  }
  .plant-fade-up {
    opacity: 0;
    animation: plantFadeUp 0.42s cubic-bezier(0.22,1,0.36,1) forwards;
  }
`;

/* inject once */
if (typeof document !== 'undefined' && !document.getElementById('agro-plant-anim')) {
  const tag = document.createElement('style');
  tag.id = 'agro-plant-anim';
  tag.textContent = PLANT_ANIM_CSS;
  document.head.appendChild(tag);
}

/* ════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════ */
const PlantIdentifier: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [image, setImage]       = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);

  /* ─── handlers (logic unchanged) ─── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleIdentify = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const response = await identifyPlant(image);
      setResult(response.data);
      setActiveTab(0);
    } catch (error) {
      console.error(error);
      alert('Identification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => { setImage(null); setPreview(null); setResult(null); };

  /* ════════════════════════════════════════════════
     SHARED SUB-COMPONENTS
     ════════════════════════════════════════════════ */

  /* Reusable tab-header row */
  const TabStrip = ({ tabs, accentColor }: { tabs: { name: string; icon: React.ReactNode }[]; accentColor: string }) => (
    <div
      className="flex overflow-x-auto"
      style={{ borderBottom: '1px solid rgba(125,90,80,0.1)' }}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === idx;
        return (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className="relative flex items-center gap-1.5 px-4 py-3.5 text-[11px] font-bold whitespace-nowrap transition-colors duration-200 shrink-0"
            style={{ color: isActive ? accentColor : 'rgba(125,90,80,0.4)' }}
          >
            {tab.icon}
            {tab.name}
            {isActive && (
              <div
                className="absolute bottom-0 left-0 w-full h-0.5 rounded-t-full"
                style={{ background: accentColor }}
              />
            )}
          </button>
        );
      })}
    </div>
  );

  /* ════════════════════════════════════════════════
     TOURIST TABS
     ════════════════════════════════════════════════ */
  const TouristTabs = () => {
    const { knowledgeBase, recommendations, aiAnalysis } = result;
    const tabs = [
      { name: 'Quick Summary', icon: <Info size={13} /> },
      { name: 'Explore & Book', icon: <Map size={13} /> },
      { name: 'Full Report',    icon: <FileText size={13} /> },
    ];

    return (
      <div className="font-sans flex flex-col h-full">
        <TabStrip tabs={tabs} accentColor="#2D6A4F" />

        <div className="flex-1 overflow-y-auto p-5 md:p-7" style={{ minHeight: '380px' }}>

          {/* ── Tab 0: Quick Summary ── */}
          {activeTab === 0 && (
            <div className="space-y-5 plant-fade-up">
              {/* Plant name block */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Confidence pill */}
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: aiAnalysis.confidence >= 80
                        ? 'linear-gradient(135deg, rgba(116,198,157,0.15), rgba(45,106,79,0.08))'
                        : 'linear-gradient(135deg, rgba(255,176,0,0.12), rgba(255,176,0,0.06))',
                      border: aiAnalysis.confidence >= 80
                        ? '1px solid rgba(116,198,157,0.3)'
                        : '1px solid rgba(255,176,0,0.25)',
                      color: aiAnalysis.confidence >= 80 ? '#2D6A4F' : '#c48a00',
                    }}
                  >
                    <CheckCircle size={11} /> {aiAnalysis.confidence}% Confidence
                  </span>

                  {/* Health pill */}
                  {aiAnalysis.healthStatus && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={aiAnalysis.healthStatus === 'Healthy' ? {
                        background: 'linear-gradient(135deg, rgba(116,198,157,0.12), rgba(45,106,79,0.06))',
                        border: '1px solid rgba(116,198,157,0.28)',
                        color: '#2D6A4F',
                      } : {
                        background: 'linear-gradient(135deg, rgba(125,90,80,0.1), rgba(125,90,80,0.05))',
                        border: '1px solid rgba(125,90,80,0.2)',
                        color: 'rgba(125,90,80,0.7)',
                      }}
                    >
                      <HeartPulse size={11} /> {aiAnalysis.healthStatus}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-dark leading-tight" style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)' }}>
                  {aiAnalysis.plantName}
                </h3>

                {knowledgeBase?.localNames && (
                  <div className="flex flex-wrap gap-3 mt-2 text-[11px] font-medium" style={{ color: 'rgba(125,90,80,0.5)' }}>
                    <span>🇨🇱 Sinhala: <span className="text-dark/70 font-bold">{knowledgeBase.localNames.sinhala}</span></span>
                    <span>🕉️ Tamil: <span className="text-dark/70 font-bold">{knowledgeBase.localNames.tamil}</span></span>
                  </div>
                )}
              </div>

              {/* Info cards row */}
              {knowledgeBase ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* About */}
                  <div
                    className="p-5 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(45,106,79,0.06), rgba(116,198,157,0.04))',
                      border: '1px solid rgba(45,106,79,0.12)',
                    }}
                  >
                    <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: '#2D6A4F' }}>
                      <Leaf size={13} /> About this Plant
                    </h4>
                    <p className="text-[12.5px] leading-relaxed" style={{ color: 'rgba(4,31,12,0.65)' }}>
                      {knowledgeBase.touristInfo?.quickDescription}
                    </p>
                  </div>

                  {/* Medicinal */}
                  <div
                    className="p-5 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,176,0,0.07), rgba(255,176,0,0.03))',
                      border: '1px solid rgba(255,176,0,0.18)',
                    }}
                  >
                    <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: '#c48a00' }}>
                      <Info size={13} /> Medicinal & Uses
                    </h4>
                    <p className="text-[12.5px] leading-relaxed" style={{ color: 'rgba(4,31,12,0.65)' }}>
                      {knowledgeBase.touristInfo?.medicinalValue || knowledgeBase.touristInfo?.usage}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="p-5 rounded-2xl text-center"
                  style={{ background: 'rgba(125,90,80,0.04)', border: '1px dashed rgba(125,90,80,0.18)' }}
                >
                  <p className="text-[12px]" style={{ color: 'rgba(125,90,80,0.5)' }}>
                    Basic identification complete. Detailed local knowledge is being updated.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 1: Explore & Book ── */}
          {activeTab === 1 && (
            <div className="space-y-5 plant-fade-up">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-dark text-base">
                  Experience "{aiAnalysis.plantName}" Live
                </h4>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(45,106,79,0.08)', color: '#2D6A4F', border: '1px solid rgba(45,106,79,0.15)' }}
                >
                  {recommendations?.length || 0} Found
                </span>
              </div>

              {recommendations && recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.map((activity: any, i: number) => (
                    <Link
                      to={`/activities/${activity._id}`}
                      key={activity._id}
                      className="plant-fade-up block group"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div
                        className="rounded-2xl overflow-hidden bg-white transition-all duration-300 group-hover:-translate-y-1"
                        style={{
                          border: '1px solid rgba(125,90,80,0.1)',
                          boxShadow: '0 2px 8px rgba(4,31,12,0.06)',
                        }}
                      >
                        {/* Image */}
                        <div className="h-36 relative overflow-hidden" style={{ background: '#e8e2db' }}>
                          {activity.images?.[0] && (
                            <img
                              src={activity.images[0].url.startsWith('http') ? activity.images[0].url : `http://localhost:5000${activity.images[0].url}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              alt={activity.customTitle}
                            />
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Body */}
                        <div className="p-4">
                          <h5 className="text-[13px] font-bold text-dark truncate group-hover:text-primary transition-colors">{activity.customTitle}</h5>
                          <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'rgba(125,90,80,0.45)' }}>
                            <Map size={10} /> {activity.farmId?.farmName || 'Verified Farm'}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[13px] font-bold" style={{ color: '#c48a00' }}>LKR {activity.pricePerPerson}</span>
                            <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                              View <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div
                  className="text-center py-10 rounded-2xl"
                  style={{ background: 'rgba(125,90,80,0.04)', border: '1px dashed rgba(125,90,80,0.18)' }}
                >
                  <Sprout size={36} className="mx-auto mb-3" style={{ color: 'rgba(125,90,80,0.25)' }} />
                  <p className="text-[12px] font-medium" style={{ color: 'rgba(125,90,80,0.5)' }}>
                    No specific activities listed for this plant yet.
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(125,90,80,0.35)' }}>
                    Try searching for "Spice Gardens" or "Tea Estates" in Activities.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 2: Full Report ── */}
          {activeTab === 2 && (
            <div className="space-y-4 plant-fade-up">
              {/* Classification card */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: '#fff', border: '1px solid rgba(125,90,80,0.1)' }}
              >
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(125,90,80,0.04)', borderBottom: '1px solid rgba(125,90,80,0.08)' }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(125,90,80,0.5)' }}>
                    Scientific Classification
                  </span>
                </div>

                <div className="p-5 space-y-0">
                  {[
                    { label: 'Scientific Name', value: aiAnalysis.scientificName, mono: true },
                    { label: 'Family',          value: aiAnalysis.family },
                    { label: 'Genus',           value: aiAnalysis.scientificName?.split(' ')[0] },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="grid py-2.5 items-center"
                      style={{ gridTemplateColumns: '130px 1fr', borderBottom: i < 2 ? '1px solid rgba(125,90,80,0.06)' : 'none' }}
                    >
                      <span className="text-[11px] font-medium" style={{ color: 'rgba(125,90,80,0.45)' }}>{row.label}</span>
                      <span className={`text-[12px] font-bold text-dark ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual analysis */}
              <div
                className="p-5 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(45,106,79,0.05), rgba(116,198,157,0.03))',
                  border: '1px solid rgba(45,106,79,0.1)',
                }}
              >
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2D6A4F' }}>Visual Analysis</h4>
                <p className="text-[12.5px] leading-relaxed" style={{ color: 'rgba(4,31,12,0.6)' }}>
                  {aiAnalysis.visualDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════════
     FARMER TABS
     ════════════════════════════════════════════════ */
  const FarmerTabs = () => {
    const { knowledgeBase, aiAnalysis } = result;
    const tabs = [
      { name: 'Summary',     icon: <Info size={13} /> },
      { name: 'Disease Check', icon: <AlertTriangle size={13} /> },
      { name: 'Grow & Earn', icon: <TrendingUp size={13} /> },
      { name: 'Data',        icon: <FileText size={13} /> },
    ];

    return (
      <div className="font-sans flex flex-col h-full">
        <TabStrip tabs={tabs} accentColor="#FFB000" />

        <div className="flex-1 overflow-y-auto p-5 md:p-7" style={{ minHeight: '380px' }}>

          {/* ── Tab 0: Summary ── */}
          {activeTab === 0 && (
            <div className="space-y-4 plant-fade-up">
              {/* Name + badges row */}
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-serif font-bold text-dark text-xl leading-tight">{aiAnalysis.plantName}</h3>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: 'rgba(125,90,80,0.4)' }}>{aiAnalysis.scientificName}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={aiAnalysis.confidence > 80 ? {
                      background: 'linear-gradient(135deg, rgba(116,198,157,0.15), rgba(45,106,79,0.08))',
                      border: '1px solid rgba(116,198,157,0.3)', color: '#2D6A4F',
                    } : {
                      background: 'linear-gradient(135deg, rgba(255,176,0,0.12), rgba(255,176,0,0.06))',
                      border: '1px solid rgba(255,176,0,0.25)', color: '#c48a00',
                    }}
                  >
                    {aiAnalysis.confidence}% Match
                  </span>
                  {aiAnalysis.healthStatus && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={aiAnalysis.healthStatus === 'Healthy' ? {
                        background: 'linear-gradient(135deg, rgba(116,198,157,0.12), rgba(45,106,79,0.06))',
                        border: '1px solid rgba(116,198,157,0.28)', color: '#2D6A4F',
                      } : {
                        background: 'linear-gradient(135deg, rgba(125,90,80,0.1), rgba(125,90,80,0.05))',
                        border: '1px solid rgba(125,90,80,0.2)', color: 'rgba(125,90,80,0.7)',
                      }}
                    >
                      <HeartPulse size={10} /> {aiAnalysis.healthStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Observation card */}
              <div
                className="flex gap-4 p-4 rounded-2xl bg-white"
                style={{ border: '1px solid rgba(125,90,80,0.1)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(45,106,79,0.1), rgba(116,198,157,0.06))' }}
                >
                  <Camera size={18} style={{ color: '#2D6A4F' }} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#2D6A4F' }}>AI Observation</h4>
                  <p className="text-[12px] leading-relaxed italic" style={{ color: 'rgba(4,31,12,0.6)' }}>"{aiAnalysis.visualDescription}"</p>
                </div>
              </div>

              {/* Care tip */}
              {aiAnalysis.careAdvice && (
                <div
                  className="flex gap-3 p-4 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,106,79,0.05), rgba(116,198,157,0.03))',
                    border: '1px solid rgba(45,106,79,0.12)',
                  }}
                >
                  <Droplets size={18} style={{ color: '#74C69D' }} className="mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#2D6A4F' }}>AI Care Tip</h4>
                    <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(45,106,79,0.7)' }}>{aiAnalysis.careAdvice}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 1: Disease Check ── */}
          {activeTab === 1 && (
            <div className="space-y-5 plant-fade-up">
              {/* AI Diagnosis banner */}
              <div
                className="p-5 rounded-2xl"
                style={aiAnalysis.healthStatus === 'Healthy' ? {
                  background: 'linear-gradient(135deg, rgba(116,198,157,0.1), rgba(45,106,79,0.06))',
                  border: '1px solid rgba(116,198,157,0.25)',
                } : {
                  background: 'linear-gradient(135deg, rgba(125,90,80,0.08), rgba(125,90,80,0.04))',
                  border: '1px solid rgba(125,90,80,0.22)',
                }}
              >
                {/* Status row */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={aiAnalysis.healthStatus === 'Healthy' ? {
                      background: 'linear-gradient(135deg, #74C69D, #2D6A4F)',
                    } : {
                      background: 'linear-gradient(135deg, rgba(125,90,80,0.3), rgba(125,90,80,0.2))',
                    }}
                  >
                    {aiAnalysis.healthStatus === 'Healthy'
                      ? <CheckCircle size={20} color="#fff" />
                      : <AlertTriangle size={20} color="#fff" />
                    }
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold" style={{ color: aiAnalysis.healthStatus === 'Healthy' ? '#2D6A4F' : 'rgba(125,90,80,0.8)' }}>
                      {aiAnalysis.healthStatus === 'Healthy' ? 'Healthy Plant' : 'Issue Detected'}
                    </h4>
                    {aiAnalysis.diseasePrediction && aiAnalysis.diseasePrediction !== 'None' && (
                      <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'rgba(125,90,80,0.6)' }}>
                        Suspected: {aiAnalysis.diseasePrediction}
                      </p>
                    )}
                  </div>
                </div>

                {/* Analysis text */}
                <div
                  className="p-3.5 rounded-xl mb-3"
                  style={{ background: 'rgba(255,255,255,0.6)' }}
                >
                  <p className="text-[11.5px] leading-relaxed" style={{ color: 'rgba(4,31,12,0.65)' }}>
                    <span className="font-bold">Analysis:</span> {aiAnalysis.symptomAnalysis || aiAnalysis.visualDescription}
                  </p>
                </div>

                {/* Recommended action */}
                <div className="flex gap-2.5 items-start">
                  <Info size={14} style={{ color: 'rgba(125,90,80,0.4)' }} className="mt-0.5 shrink-0" />
                  <p className="text-[11px] italic" style={{ color: 'rgba(125,90,80,0.6)' }}>
                    <span className="font-bold not-italic">Recommended Action:</span> {aiAnalysis.careAdvice}
                  </p>
                </div>
              </div>

              {/* Section label */}
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(125,90,80,0.5)' }}>
                  Common Diseases for this Species
                </h4>
                <span className="text-[10px] font-medium" style={{ color: 'rgba(125,90,80,0.35)' }}>Database Info</span>
              </div>

              {/* Disease cards */}
              {knowledgeBase?.commonDiseases && knowledgeBase.commonDiseases.length > 0 ? (
                <div className="space-y-3">
                  {knowledgeBase.commonDiseases.map((disease: any, idx: number) => {
                    const isMatch = aiAnalysis.diseasePrediction &&
                      disease.name.toLowerCase().includes(aiAnalysis.diseasePrediction.toLowerCase());
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl p-4 bg-white transition-all duration-200"
                        style={isMatch ? {
                          border: '1.5px solid rgba(125,90,80,0.4)',
                          boxShadow: '0 0 0 2px rgba(125,90,80,0.1), 0 4px 12px rgba(4,31,12,0.06)',
                        } : {
                          border: '1px solid rgba(125,90,80,0.1)',
                        }}
                      >
                        {/* Name row */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: isMatch ? '#7D5A50' : 'rgba(125,90,80,0.3)' }} />
                          <h5 className="text-[12.5px] font-bold text-dark">{disease.name}</h5>
                          {isMatch && (
                            <span
                              className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(125,90,80,0.1)', color: 'rgba(125,90,80,0.7)', border: '1px solid rgba(125,90,80,0.2)' }}
                            >
                              MATCH FOUND
                            </span>
                          )}
                        </div>

                        {/* Symptoms + Solution */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(125,90,80,0.4)' }}>Symptoms</span>
                            <p className="text-[11.5px] mt-1 leading-relaxed" style={{ color: 'rgba(4,31,12,0.6)' }}>{disease.symptoms}</p>
                          </div>
                          <div
                            className="p-3 rounded-xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(116,198,157,0.1), rgba(45,106,79,0.06))',
                              border: '1px solid rgba(116,198,157,0.2)',
                            }}
                          >
                            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#2D6A4F' }}>Recommended Solution</span>
                            <p className="text-[11.5px] mt-1 font-medium leading-relaxed" style={{ color: 'rgba(45,106,79,0.8)' }}>{disease.solution}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle size={28} className="mx-auto mb-2" style={{ color: '#74C69D' }} />
                  <p className="text-[12px] font-medium" style={{ color: 'rgba(125,90,80,0.5)' }}>No common diseases listed for this plant.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 2: Grow & Earn ── */}
          {activeTab === 2 && (
            <div className="space-y-4 plant-fade-up">
              {knowledgeBase?.farmerInfo ? (
                <>
                  {/* Market potential */}
                  <div
                    className="p-5 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(116,198,157,0.1), rgba(45,106,79,0.06))',
                      border: '1px solid rgba(116,198,157,0.22)',
                    }}
                  >
                    <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#2D6A4F' }}>
                      <TrendingUp size={13} /> Market Potential
                    </h4>
                    <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(45,106,79,0.7)' }}>{knowledgeBase.farmerInfo.marketTips}</p>
                  </div>

                  {/* Cultivation guide */}
                  <div
                    className="p-5 rounded-2xl bg-white"
                    style={{ border: '1px solid rgba(125,90,80,0.1)' }}
                  >
                    <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(125,90,80,0.5)' }}>Cultivation Guide</h4>
                    <p className="text-[12px] leading-relaxed whitespace-pre-line" style={{ color: 'rgba(4,31,12,0.6)' }}>
                      {knowledgeBase.farmerInfo.cultivationTips}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[12px] text-center italic" style={{ color: 'rgba(125,90,80,0.4)' }}>Market data currently unavailable.</p>
              )}

              {/* Monetize CTA */}
              <Link
                to="/farmer/activities/create"
                className="group flex items-center justify-between w-full p-4.5 rounded-2xl transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #FFB000, #e8a000)',
                  boxShadow: '0 6px 20px rgba(255,176,0,0.3)',
                }}
              >
                <div>
                  <span className="block text-[14px] font-bold text-white">Monetize this Crop</span>
                  <span className="text-[10px] text-white/70">Create a farm activity for tourists</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={18} color="#fff" />
                </div>
              </Link>
            </div>
          )}

          {/* ── Tab 3: Data ── */}
          {activeTab === 3 && (
            <div className="space-y-4 plant-fade-up">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: '#fff', border: '1px solid rgba(125,90,80,0.1)' }}
              >
                {/* Header row */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(125,90,80,0.04)', borderBottom: '1px solid rgba(125,90,80,0.08)' }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'rgba(125,90,80,0.5)' }}>
                    <FileText size={11} /> Technical Analysis Report
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: 'rgba(125,90,80,0.3)' }}>
                    REF: {aiAnalysis.plantName ? aiAnalysis.plantName.substring(0, 3).toUpperCase() : 'UNK'}-{Math.floor(Math.random() * 1000)}
                  </span>
                </div>

                {/* Botanical Data */}
                <div className="p-5">
                  <h5 className="text-[9px] font-bold uppercase tracking-widest mb-3 pb-2" style={{ color: 'rgba(125,90,80,0.4)', borderBottom: '1px solid rgba(125,90,80,0.08)' }}>
                    Botanical Data
                  </h5>
                  {[
                    { label: 'Common Name',     value: aiAnalysis.plantName, mono: false },
                    { label: 'Scientific Name', value: aiAnalysis.scientificName || 'N/A', mono: true, italic: true },
                    { label: 'Family',          value: aiAnalysis.family || 'N/A' },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="grid items-center py-2.5"
                      style={{ gridTemplateColumns: '120px 1fr', borderBottom: '1px solid rgba(125,90,80,0.06)' }}
                    >
                      <span className="text-[11px] font-medium" style={{ color: 'rgba(125,90,80,0.45)' }}>{row.label}</span>
                      <span className={`text-[11.5px] font-bold text-dark ${row.mono ? 'font-mono' : ''} ${row.italic ? 'italic font-serif' : ''}`}>{row.value}</span>
                    </div>
                  ))}
                  {/* Confidence row */}
                  <div
                    className="grid items-center py-2.5"
                    style={{ gridTemplateColumns: '120px 1fr' }}
                  >
                    <span className="text-[11px] font-medium" style={{ color: 'rgba(125,90,80,0.45)' }}>Confidence</span>
                    <span
                      className="w-fit text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        background: 'linear-gradient(135deg, rgba(116,198,157,0.12), rgba(45,106,79,0.08))',
                        color: '#2D6A4F',
                        border: '1px solid rgba(116,198,157,0.25)',
                      }}
                    >
                      {aiAnalysis.confidence}% Verified
                    </span>
                  </div>
                </div>

                {/* Health Diagnostics */}
                <div className="p-5" style={{ borderTop: '1px solid rgba(125,90,80,0.08)' }}>
                  <h5 className="text-[9px] font-bold uppercase tracking-widest mb-3 pb-2" style={{ color: 'rgba(125,90,80,0.4)', borderBottom: '1px solid rgba(125,90,80,0.08)' }}>
                    Health Diagnostics
                  </h5>
                  {[
                    {
                      label: 'Health Status',
                      value: aiAnalysis.healthStatus,
                      pill: true,
                      healthy: aiAnalysis.healthStatus === 'Healthy',
                    },
                    { label: 'Identified Issue',  value: aiAnalysis.diseasePrediction || 'None Detected' },
                    { label: 'Action Required',   value: aiAnalysis.healthStatus === 'Healthy' ? 'Routine Maintenance' : 'Immediate Treatment Recommended' },
                  ].map((row: any, i: number) => (
                    <div
                      key={i}
                      className="grid items-center py-2.5"
                      style={{ gridTemplateColumns: '120px 1fr', borderBottom: i < 2 ? '1px solid rgba(125,90,80,0.06)' : 'none' }}
                    >
                      <span className="text-[11px] font-medium" style={{ color: 'rgba(125,90,80,0.45)' }}>{row.label}</span>
                      {row.pill ? (
                        <span
                          className="w-fit text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
                          style={row.healthy ? {
                            background: 'linear-gradient(135deg, rgba(116,198,157,0.12), rgba(45,106,79,0.08))',
                            color: '#2D6A4F', border: '1px solid rgba(116,198,157,0.25)',
                          } : {
                            background: 'linear-gradient(135deg, rgba(125,90,80,0.1), rgba(125,90,80,0.05))',
                            color: 'rgba(125,90,80,0.7)', border: '1px solid rgba(125,90,80,0.2)',
                          }}
                        >
                          {row.value}
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-dark/65">{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* AI Matching Tags */}
                <div className="px-5 py-4" style={{ background: 'rgba(125,90,80,0.03)', borderTop: '1px solid rgba(125,90,80,0.08)' }}>
                  <h5 className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(125,90,80,0.4)' }}>AI Matching Tags</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysis.searchKeywords && aiAnalysis.searchKeywords.length > 0 ? (
                      aiAnalysis.searchKeywords.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-white"
                          style={{ color: 'rgba(125,90,80,0.55)', border: '1px solid rgba(125,90,80,0.12)' }}
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] italic" style={{ color: 'rgba(125,90,80,0.35)' }}>No tags generated</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════════
     MAIN RENDER
     ════════════════════════════════════════════════ */
  return (
    <div
      className="max-w-4xl mx-auto px-4 py-8 font-sans"
    >
      <div
        className="rounded-4xl overflow-hidden relative flex flex-col md:flex-row"
        style={{
          background: '#fff',
          border: '1px solid rgba(125,90,80,0.1)',
          boxShadow: '0 24px 48px -12px rgba(4,31,12,0.14), 0 4px 8px -2px rgba(4,31,12,0.06)',
          minHeight: '620px',
        }}
      >
        {/* ══════════════════════════════════════
            LEFT PANEL — Scanner / Preview
            ══════════════════════════════════════ */}
        <div
          className="w-full md:w-5/12 relative flex flex-col items-center justify-center overflow-hidden"
          style={{ minHeight: '300px', background: 'linear-gradient(160deg, #0a1f14 0%, #041f0c 60%, #061a0e 100%)' }}
        >
          {preview ? (
            /* ── Image preview + scan overlay ── */
            <div className="relative w-full h-full">
              <img src={preview} className="w-full h-full object-cover" style={{ opacity: loading ? 0.7 : 0.92 }} alt="Preview" />

              {/* Saffron scan beam */}
              {loading && <div className="scan-beam" />}

              {/* Subtle tint while scanning */}
              {loading && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,176,0,0.06)' }} />
              )}

              {/* Retake button */}
              {!loading && (
                <button
                  onClick={handleRetake}
                  className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 active:scale-90"
                  style={{ background: 'rgba(4,31,12,0.55)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ) : (
            /* ── Empty scanner state ── */
            <div className="relative z-10 text-center p-6">
              {/* Pulsing camera icon */}
              <div className="relative w-22 h-22 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div
                  className="absolute inset-2 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Camera size={30} color="rgba(255,255,255,0.85)" />
                </div>
              </div>

              <h2 className="font-serif font-bold text-white text-xl mb-1.5">AI Lens</h2>
              <p className="text-[12px] mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Scan plants to identify species, diseases, and opportunities.
              </p>

              {/* Upload CTA */}
              <label className="inline-flex items-center gap-2 cursor-pointer px-6 py-2.5 rounded-xl text-white text-[13px] font-bold transition-all duration-200 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #FFB000, #e8a000)',
                  boxShadow: '0 4px 16px rgba(255,176,0,0.35)',
                }}
              >
                <Upload size={16} />
                Upload Photo
                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          )}

          {/* Decorative corner brackets (scanner feel) */}
          {!preview && (
            <>
              <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 rounded-tl-md" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
              <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 rounded-tr-md" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
              <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 rounded-bl-md" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
              <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 rounded-br-md" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
            </>
          )}
        </div>

        {/* ══════════════════════════════════════
            RIGHT PANEL — Header + Results
            ══════════════════════════════════════ */}
        <div className="w-full md:w-7/12 flex flex-col" style={{ background: 'linear-gradient(175deg, #fff 0%, #FDFBF8 100%)' }}>

          {/* Sticky header strip */}
          <div
            className="flex items-center justify-between px-5 py-3.5 shrink-0"
            style={{ borderBottom: '1px solid rgba(125,90,80,0.08)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(45,106,79,0.1), rgba(116,198,157,0.06))' }}
              >
                <Sprout size={16} style={{ color: '#2D6A4F' }} />
              </div>
              <span className="text-[12px] font-bold text-dark">AgroLK Assistant</span>
            </div>

            {/* Status dot */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(125,90,80,0.4)' }}>
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: loading ? '#FFB000' : '#74C69D',
                  boxShadow: loading ? '0 0 6px rgba(255,176,0,0.5)' : '0 0 5px rgba(116,198,157,0.4)',
                  animation: loading ? 'pulse 1.2s infinite' : 'none',
                }}
              />
              {loading ? 'Analyzing…' : 'Ready'}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto relative">

            {/* ── LOADING ── */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20" style={{ background: 'linear-gradient(175deg, #fff 0%, #FDFBF8 100%)' }}>
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(45,106,79,0.12)' }} />
                  <div
                    className="absolute inset-1.5 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #2D6A4F, #74C69D)' }}
                  >
                    <Loader2 className="animate-spin text-white" size={22} />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-dark text-base">Identifying Plant…</h3>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(125,90,80,0.45)' }}>Analyzing visual patterns</p>
              </div>
            )}

            {/* ── RESULT: not a plant ── */}
            {!loading && result && result.aiAnalysis?.isPlant === false && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center plant-fade-up">
                <div
                  className="w-18 h-18 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(125,90,80,0.1), rgba(125,90,80,0.06))' }}
                >
                  <AlertTriangle size={32} style={{ color: 'rgba(125,90,80,0.6)' }} />
                </div>
                <h3 className="font-serif font-bold text-dark text-lg mb-1.5">Not a Plant</h3>
                <p className="text-[12px] max-w-xs leading-relaxed mb-4" style={{ color: 'rgba(125,90,80,0.55)' }}>
                  Our AI thinks this image is not a plant. It identified it as:{' '}
                  <span className="font-bold text-dark">"{result.aiAnalysis.plantName}"</span>
                </p>
                <button
                  onClick={handleRetake}
                  className="px-5 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 active:scale-95"
                  style={{ background: 'rgba(125,90,80,0.06)', color: 'rgba(125,90,80,0.6)', border: '1px solid rgba(125,90,80,0.15)' }}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* ── RESULT: role-based tabs ── */}
            {!loading && result && result.aiAnalysis?.isPlant !== false && (
              (!user || user.role === 'Tourist') ? <TouristTabs /> :
              (user?.role === 'Farmer')           ? <FarmerTabs />  :
                                                    <TouristTabs />
            )}

            {/* ── EMPTY state ── */}
            {!loading && !result && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <ScanLine size={48} style={{ color: 'rgba(125,90,80,0.18)' }} className="mb-3" />
                <p className="text-[13px] font-semibold" style={{ color: 'rgba(125,90,80,0.4)' }}>Waiting for image…</p>
                <p className="text-[11px] mt-1.5 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(125,90,80,0.3)' }}>
                  Upload a clear photo of a leaf, flower, or fruit for best results.
                </p>
              </div>
            )}
          </div>

          {/* ── Scan CTA footer ── */}
          {preview && !result && !loading && (
            <div className="p-5 shrink-0" style={{ borderTop: '1px solid rgba(125,90,80,0.08)' }}>
              <button
                onClick={handleIdentify}
                className="w-full flex items-center justify-center gap-2 text-white text-[13px] font-bold py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #2D6A4F, #3a8a65)',
                  boxShadow: '0 4px 16px rgba(45,106,79,0.32)',
                }}
              >
                <ScanLine size={20} /> Start Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantIdentifier;