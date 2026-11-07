import React, { useState } from 'react';
import { COMPLAINT_CATEGORIES, CITY_WARDS, PRIORITY_LEVELS } from '../../utils/constants';
import MapPicker from '../common/MapPicker';
import Button from '../common/Button';
import { UploadCloud, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComplaintForm({ onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'pothole',
    ward: CITY_WARDS[0],
    location: '',
    priority: 'MEDIUM',
    description: '',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    imageFile: null,
    imagePreview: null,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required (minimum 5 characters)';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long';
    }

    if (!formData.location.trim()) {
      errs.location = 'Specific street address or landmark is required';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    const selectedCategory = COMPLAINT_CATEGORIES.find((c) => c.id === formData.category);

    const submissionPayload = {
      title: formData.title,
      category: formData.category,
      categoryLabel: selectedCategory ? selectedCategory.label : formData.category,
      ward: formData.ward,
      location: formData.location,
      priority: formData.priority,
      description: formData.description,
      coordinates: formData.coordinates,
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
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Issue Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Deep asphalt pothole causing traffic jam near Metro station"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.title
              ? 'border-rose-400 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'
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
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Municipal Ward */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Municipal Ward <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.ward}
            onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            {CITY_WARDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Street Address / Landmark */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Street Address / Nearest Landmark <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Opposite Bank of India, 4th Cross Road, Shivaji Nagar"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.location
              ? 'border-rose-400 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'
          }`}
        />
        {errors.location && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.location}</span>
          </p>
        )}
      </div>

      {/* Map Location Picker */}
      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Pin Location on OpenStreetMap (Optional but Recommended)
        </label>
        <MapPicker
          initialLat={formData.coordinates.lat}
          initialLng={formData.coordinates.lng}
          onLocationSelect={(coords) => setFormData((prev) => ({ ...prev, coordinates: coords }))}
          height="240px"
        />
      </div>

      {/* Priority Level */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Perceived Urgency / Priority
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.keys(PRIORITY_LEVELS).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFormData({ ...formData, priority: lvl })}
              className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                formData.priority === lvl
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {PRIORITY_LEVELS[lvl].label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Upload with Live Preview */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Evidence Photograph (PNG, JPG, JPEG)
        </label>

        {formData.imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-64 bg-slate-100 flex items-center justify-center group">
            <img
              src={formData.imagePreview}
              alt="Complaint Evidence Preview"
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-slate-900/70 text-white text-[10px] font-medium backdrop-blur-xs">
              Photo attached
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-sky-50/30 transition-colors">
            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Click to upload photo or drag & drop here
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG up to 5MB</p>
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
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Detailed Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Describe how long the issue has persisted, how severely it affects residents or traffic, and any key hazards..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.description
              ? 'border-rose-400 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'
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
        <p className="text-center text-[11px] text-slate-400 mt-2">
          By submitting, you certify that the provided information and photograph accurately represent the civic problem.
        </p>
      </div>
    </form>
  );
}

