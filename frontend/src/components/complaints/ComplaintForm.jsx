import React, { useState } from 'react';
import { COMPLAINT_CATEGORIES, CITY_WARDS, PRIORITY_LEVELS } from '../../utils/constants';
import {
  INDIAN_STATES_AND_UT,
  INDIAN_DISTRICTS_BY_STATE,
  validateIndianPinCode,
  formatFullIndianAddress,
} from '../../utils/indianGeoData';
import { useAuth } from '../../hooks/useAuth';
import MapPicker from '../common/MapPicker';
import Button from '../common/Button';
import { UploadCloud, X, AlertCircle, CheckCircle2, MapPin, Building, Home as HomeIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComplaintForm({ onSubmit, isSubmitting = false }) {
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (err) {
    user = null;
  }

  const [formData, setFormData] = useState({
    title: '',
    category: 'pothole',
    ward: CITY_WARDS[0],
    country: 'India',
    state: user?.state || 'Telangana',
    district: user?.district || 'Hyderabad',
    city: user?.city || 'Hyderabad',
    street: '',
    landmark: '',
    pincode: user?.pincode || '',
    location: user?.address || '',
    priority: 'MEDIUM',
    description: '',
    coordinates: { lat: 17.3850, lng: 78.4867 },
    imageFile: null,
    imagePreview: null,
  });

  const [errors, setErrors] = useState({});

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
      imageUrl:
        formData.imagePreview ||
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    };

    onSubmit(submissionPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Issue Title <span className="text-rose-500">*</span>
        </label>
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

      {/* Category & Ward Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
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
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Detailed Description <span className="text-rose-500">*</span>
        </label>
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

      {/* Submit CTA */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="accent"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Submit Complaint to Municipal Desk
        </Button>
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2">
          By submitting, you certify that the provided information and photograph accurately represent the civic problem.
        </p>
      </div>
    </form>
  );
}
