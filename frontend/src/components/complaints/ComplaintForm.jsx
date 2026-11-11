import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { COMPLAINT_CATEGORIES, CITY_WARDS, PRIORITY_LEVELS } from '../../utils/constants';
import {
  INDIAN_STATES_AND_UT,
  INDIAN_DISTRICTS_BY_STATE,
  validateIndianPinCode,
  formatFullIndianAddress,
} from '../../utils/indianGeoData';
import { useAuth } from '../../hooks/useAuth';
import { aiAPI } from '../../services/api';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import MapPicker from '../common/MapPicker';
import Button from '../common/Button';
import {
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Building,
  Home as HomeIcon,
  Sparkles,
  Mic,
  MicOff,
  AlertTriangle,
  QrCode,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComplaintForm({ onSubmit, isSubmitting = false }) {
  const routerLocation = useLocation();
  const assetPreload = routerLocation.state || {};

  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (err) {
    user = null;
  }

  const [formData, setFormData] = useState({
    title: '',
    category: assetPreload.category || 'pothole',
    ward: assetPreload.ward || CITY_WARDS[0],
    country: 'India',
    state: assetPreload.state || user?.state || 'Telangana',
    district: assetPreload.district || user?.district || 'Hyderabad',
    city: assetPreload.city || user?.city || 'Hyderabad',
    street: assetPreload.location || '',
    landmark: '',
    pincode: assetPreload.pincode || user?.pincode || '',
    location: assetPreload.location || user?.address || '',
    priority: 'MEDIUM',
    description: '',
    coordinates: {
      lat: assetPreload.latitude || 17.3850,
      lng: assetPreload.longitude || 78.4867,
    },
    imageFile: null,
    imagePreview: null,
    assetId: assetPreload.assetId || '',
  });

  const [errors, setErrors] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [nearbyDuplicates, setNearbyDuplicates] = useState([]);
  const [isDraftRestored, setIsDraftRestored] = useState(false);

  // Restore offline draft on mount if available (unless preloaded from QR asset)
  useEffect(() => {
    if (assetPreload.assetId) return;
    try {
      const savedDraft = localStorage.getItem('civicconnect_complaint_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && (parsed.title || parsed.description || parsed.street)) {
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            imageFile: null,
            imagePreview: null,
          }));
          setIsDraftRestored(true);
        }
      }
    } catch (e) {
      console.warn('Draft restoration notice:', e);
    }
  }, []);

  // Debounced auto-save of complaint draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.trim() || formData.description.trim() || formData.street.trim()) {
        try {
          const draftPayload = {
            ...formData,
            imageFile: null,
            imagePreview: null,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem('civicconnect_complaint_draft', JSON.stringify(draftPayload));
        } catch (e) {}
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem('civicconnect_complaint_draft');
      setIsDraftRestored(false);
      toast.success('Offline draft discarded.');
    } catch (e) {}
  };

  const handleSaveDraftManually = () => {
    try {
      const draftPayload = {
        ...formData,
        imageFile: null,
        imagePreview: null,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('civicconnect_complaint_draft', JSON.stringify(draftPayload));
      toast.success('Complaint progress saved locally as offline draft!');
    } catch (e) {
      toast.error('Unable to save draft locally.');
    }
  };

  // Voice Input Hooks
  const titleVoice = useVoiceInput({
    onTranscript: (text) => setFormData((prev) => ({ ...prev, title: text })),
  });

  const descVoice = useVoiceInput({
    onTranscript: (text) => setFormData((prev) => ({ ...prev, description: text })),
  });

  // AI Smart Classification Assistant
  const handleAISmartAssist = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      toast.info('Please enter a few words in the title or description for AI analysis.');
      return;
    }

    setIsAnalyzingAI(true);
    try {
      const res = await aiAPI.classify({
        title: formData.title,
        description: formData.description,
        location: formData.location || formData.street,
      });

      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        setAiAnalysis(d);

        // Apply suggestions if user hasn't explicitly set them
        setFormData((prev) => ({
          ...prev,
          category: d.category || prev.category,
          priority: d.safetyHazard ? 'URGENT' : d.priority || prev.priority,
          title: prev.title.length < 8 && d.titleSuggestion ? d.titleSuggestion : prev.title,
        }));

        if (d.safetyHazard) {
          toast.success('⚠️ Safety hazard detected: Priority elevated to URGENT.', { icon: '🚨' });
        } else {
          toast.success(`AI Recommended: ${d.categoryLabel} (${d.department})`);
        }
      }
    } catch {
      toast.error('AI assistance is temporarily unavailable.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Check for duplicate reports whenever location or category updates
  useEffect(() => {
    let cancel = false;
    async function checkDuplicates() {
      if (formData.coordinates?.lat && formData.coordinates?.lng && formData.title.length > 5) {
        try {
          const res = await aiAPI.checkDuplicates({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            latitude: formData.coordinates.lat,
            longitude: formData.coordinates.lng,
          });
          if (!cancel && res.data?.success && Array.isArray(res.data.data)) {
            setNearbyDuplicates(res.data.data);
          }
        } catch {
          // ignore duplicate check failure
        }
      }
    }
    const timer = setTimeout(checkDuplicates, 800);
    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [formData.coordinates, formData.category, formData.title]);

  // Get dynamic district list for selected state
  const availableDistricts = INDIAN_DISTRICTS_BY_STATE[formData.state] || [];

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const districts = INDIAN_DISTRICTS_BY_STATE[newState] || [];
    setFormData((prev) => ({
      ...prev,
      state: newState,
      district: districts[0] || '',
    }));
  };

  // Callback when user selects or drags marker on the interactive India map
  const handleMapLocationSelect = (loc) => {
    if (!loc) return;
    setFormData((prev) => {
      const updated = {
        ...prev,
        coordinates: { lat: loc.lat, lng: loc.lng },
      };
      if (loc.state) updated.state = loc.state;
      if (loc.district) updated.district = loc.district;
      if (loc.city) updated.city = loc.city;
      if (loc.street) updated.street = loc.street;
      if (loc.pincode) updated.pincode = loc.pincode;
      if (loc.formattedAddress) updated.location = loc.formattedAddress;
      return updated;
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required (minimum 5 characters)';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long';
    }

    if (!formData.street.trim() && !formData.location.trim()) {
      errs.street = 'Specific street address or landmark location is required';
    }

    if (!formData.state) {
      errs.state = 'State / UT selection is required';
    }

    if (formData.pincode && !validateIndianPinCode(formData.pincode)) {
      errs.pincode = 'Valid 6-digit Indian Postal PIN Code is required (e.g. 500001)';
    }

    if (!formData.description.trim()) {
      errs.description = 'Please provide detailed description of the problem (minimum 15 characters)';
    } else if (formData.description.trim().length < 15) {
      errs.description = 'Description should be at least 15 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: null, imagePreview: null }));
  };

  const handleUseProfileAddress = () => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      street: user.address || prev.street,
      state: user.state || prev.state,
      district: user.district || prev.district,
      city: user.city || prev.city,
      pincode: user.pincode || prev.pincode,
      location: user.address || prev.location,
    }));
    toast.success('Address populated from your citizen profile!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    const selectedCategory = COMPLAINT_CATEGORIES.find((c) => c.id === formData.category);

    // Build standard formatted Indian civic location string
    const fullLocation = formatFullIndianAddress({
      street: formData.street || formData.location,
      landmark: formData.landmark,
      city: formData.city,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,
    }) || formData.location || formData.street;

    const submissionPayload = {
      title: formData.title,
      category: formData.category,
      categoryLabel: selectedCategory ? selectedCategory.label : formData.category,
      ward: formData.ward,
      country: 'India',
      state: formData.state,
      district: formData.district,
      city: formData.city,
      street: formData.street,
      landmark: formData.landmark,
      pincode: formData.pincode,
      location: fullLocation,
      priority: formData.priority,
      description: formData.description,
      coordinates: formData.coordinates,
      latitude: formData.coordinates.lat,
      longitude: formData.coordinates.lng,
      imageFile: formData.imageFile,
      assetId: formData.assetId || '',
      imageUrl:
        formData.imagePreview ||
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    };

    try {
      localStorage.removeItem('civicconnect_complaint_draft');
      setIsDraftRestored(false);
    } catch (e) {}

    onSubmit(submissionPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Offline Draft Restored Banner */}
      {isDraftRestored && (
        <div className="flex items-center justify-between p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Restored an in-progress complaint draft from your device cache.</span>
          </div>
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="text-amber-700 dark:text-amber-300 font-bold hover:underline cursor-pointer ml-3 shrink-0"
          >
            Discard
          </button>
        </div>
      )}
      {/* Scanned QR Asset Notice (if applicable) */}
      {formData.assetId && (
        <div className="flex items-center gap-2.5 p-3.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-2xl text-xs text-sky-800 dark:text-sky-300">
          <QrCode className="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <p className="font-bold">Registered Public Infrastructure Asset Linked</p>
            <p className="text-[11px] text-sky-700 dark:text-sky-400">
              Asset Tag: <span className="font-mono font-bold">{formData.assetId}</span> • Ward & coordinates auto-attached.
            </p>
          </div>
        </div>
      )}

      {/* Title with Voice Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Issue Title <span className="text-rose-500">*</span>
          </label>
          {titleVoice.isSupported && (
            <button
              type="button"
              onClick={titleVoice.isListening ? titleVoice.stopListening : titleVoice.startListening}
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                titleVoice.isListening
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {titleVoice.isListening ? <MicOff className="w-3 h-3 text-rose-600" /> : <Mic className="w-3 h-3 text-sky-600" />}
              <span>{titleVoice.isListening ? 'Listening...' : 'Voice Dictate'}</span>
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="e.g., Deep asphalt pothole causing traffic jam near Metro station"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
            errors.title
              ? 'border-rose-400 focus:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.title}</span>
          </p>
        )}
      </div>

      {/* AI Smart Assist Recommendation Banner */}
      {aiAnalysis && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Recommendation: {aiAnalysis.categoryLabel}
            </span>
            <span className="font-mono text-[10px] bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-md text-indigo-800 dark:text-indigo-200 font-bold">
              {Math.round(aiAnalysis.confidence * 100)}% Confidence
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            {aiAnalysis.explanation}
          </p>
          {aiAnalysis.safetyHazard && (
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-xs pt-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Safety hazard detected: Priority elevated to URGENT.</span>
            </div>
          )}
        </div>
      )}

      {/* Category & Ward Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAISmartAssist}
              disabled={isAnalyzingAI}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
              {isAnalyzingAI ? <Loader2 className="w-3 h-3 animate-spin text-indigo-600" /> : <Sparkles className="w-3 h-3 text-indigo-600" />}
              <span>{isAnalyzingAI ? 'Analyzing...' : 'AI Smart Assist'}</span>
            </button>
          </div>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id} className="dark:bg-slate-900">
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Municipal Ward */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Municipal Ward <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.ward}
            onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            {CITY_WARDS.map((w) => (
              <option key={w} value={w} className="dark:bg-slate-900">
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indian Geographic Address Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Indian Municipal Location & Address Details
            </h3>
          </div>
          {user?.address && (
            <button
              type="button"
              onClick={handleUseProfileAddress}
              className="text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-200 inline-flex items-center gap-1 cursor-pointer bg-sky-100/70 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2.5 py-1 rounded-lg transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Use My Registered Profile Address</span>
            </button>
          )}
        </div>

        {/* Cascading Location Hierarchy: Country (Fixed) -> State -> District */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Country <span className="text-slate-400 font-normal">(National Portal)</span>
            </label>
            <div className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
              <span className="text-base leading-none">🇮🇳</span>
              <span>India</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              State / Union Territory <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.state}
              onChange={handleStateChange}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              {INDIAN_STATES_AND_UT.map((st) => (
                <option key={st} value={st} className="dark:bg-slate-900">
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              District
            </label>
            <select
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              {availableDistricts.length > 0 ? (
                availableDistricts.map((d) => (
                  <option key={d} value={d} className="dark:bg-slate-900">
                    {d}
                  </option>
                ))
              ) : (
                <option value={formData.district || 'General'}>{formData.district || 'General'}</option>
              )}
            </select>
          </div>
        </div>

        {/* City / Town / Village & PIN Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              City / Town / Village
            </label>
            <input
              type="text"
              placeholder="e.g., Hyderabad, Vijayawada, Warangal, Pune, Rampur"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              PIN Code (6 Digits)
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g., 500001"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 ${
                errors.pincode
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
              }`}
            />
            {errors.pincode && <p className="mt-1 text-xs text-rose-500">{errors.pincode}</p>}
          </div>
        </div>

        {/* Street & Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Locality / Street / Road Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 4th Cross Road, Shivaji Nagar, Sector 5"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value, location: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 ${
                errors.street
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
              }`}
            />
            {errors.street && <p className="mt-1 text-xs text-rose-500">{errors.street}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nearest Landmark
            </label>
            <input
              type="text"
              placeholder="e.g., Opposite State Bank of India ATM"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Map Location Picker */}
      <div className="bg-slate-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
          Pin Location on OpenStreetMap (Pan-India Interactive Geotagging)
        </label>
        <MapPicker
          initialLat={formData.coordinates.lat}
          initialLng={formData.coordinates.lng}
          onLocationSelect={handleMapLocationSelect}
          height="320px"
        />
      </div>

      {/* Nearby Duplicate Reports Alert Banner */}
      {nearbyDuplicates.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{nearbyDuplicates.length} Related Reports Detected Nearby</span>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            Another citizen has recently reported: <strong>"{nearbyDuplicates[0].title}"</strong> ({nearbyDuplicates[0].distanceMeters}m away, Status: {nearbyDuplicates[0].status}). You may still submit your report; related reports help municipal teams allocate larger repair crews.
          </p>
        </div>
      )}

      {/* Priority Level */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Perceived Urgency / Priority
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.keys(PRIORITY_LEVELS).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFormData({ ...formData, priority: lvl })}
              className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                formData.priority === lvl
                  ? 'bg-slate-900 dark:bg-sky-600 text-white border-slate-900 dark:border-sky-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {PRIORITY_LEVELS[lvl].label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Upload with Live Preview */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Evidence Photograph (PNG, JPG, JPEG)
        </label>
        {formData.imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-64 bg-slate-100 dark:bg-slate-800 flex items-center justify-center group">
            <img
              src={formData.imagePreview}
              alt="Complaint Evidence Preview"
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-slate-900/70 text-white text-[10px] font-medium backdrop-blur-xs">
              Photo attached
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-900/40 hover:bg-sky-50/30 dark:hover:bg-sky-950/20 transition-colors">
            <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Click to upload photo or drag & drop here
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">JPEG, PNG up to 5MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Detailed Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          {descVoice.isSupported && (
            <button
              type="button"
              onClick={descVoice.isListening ? descVoice.stopListening : descVoice.startListening}
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                descVoice.isListening
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {descVoice.isListening ? <MicOff className="w-3 h-3 text-rose-600" /> : <Mic className="w-3 h-3 text-sky-600" />}
              <span>{descVoice.isListening ? 'Listening...' : 'Voice Dictate'}</span>
            </button>
          )}
        </div>
        <textarea
          rows={4}
          placeholder="Describe how long the issue has persisted, how severely it affects residents or traffic, and any key hazards..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
            errors.description
              ? 'border-rose-400 focus:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.description}</span>
          </p>
        )}
      </div>

      {/* Submit CTA & Offline Draft Button */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            isLoading={isSubmitting}
            className="w-full sm:flex-1"
          >
            Submit Complaint to Municipal Desk
          </Button>
          <button
            type="button"
            onClick={handleSaveDraftManually}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Save Draft Locally
          </button>
        </div>
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2">
          By submitting, you certify that the provided information and photograph accurately represent the civic problem.
        </p>
      </div>
    </form>
  );
}
