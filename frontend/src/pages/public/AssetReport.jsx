// ==============================================================================
// QR Code & Public Civic Asset Reporting (AssetReport.jsx)
// Instant grievance submission pre-filled from scanned municipal asset tags
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QrCode, MapPin, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { assetAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function AssetReport() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    async function loadAsset() {
      if (!assetId) {
        setErrorNotice('No Asset ID specified.');
        setLoading(false);
        return;
      }
      try {
        const res = await assetAPI.getById(assetId);
        if (res.data?.success && res.data.data) {
          setAsset(res.data.data);
        } else {
          setErrorNotice('Asset record not found.');
        }
      } catch (err) {
        setErrorNotice(err.response?.data?.message || `No civic asset registered with ID: ${assetId}`);
      } finally {
        setLoading(false);
      }
    }
    loadAsset();
  }, [assetId]);

  const handleProceedToComplaint = () => {
    if (!asset) return;
    // Navigate to submit complaint with pre-filled state
    navigate('/citizen/submit-complaint', {
      state: {
        assetId: asset.assetId,
        assetName: asset.name,
        category:
          asset.category === 'STREETLIGHT'
            ? 'street_light'
            : asset.category === 'WASTE_BIN'
            ? 'garbage'
            : asset.category === 'WATER_PUMP'
            ? 'water_leakage'
            : asset.category === 'DRAINAGE_MANHOLE'
            ? 'drainage'
            : 'other',
        ward: asset.ward,
        location: asset.location,
        state: asset.state,
        district: asset.district,
        city: asset.city,
        pincode: asset.pincode,
        latitude: asset.latitude,
        longitude: asset.longitude,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin mb-2" />
        <p className="text-xs text-slate-500">Resolving registered municipal asset tag...</p>
      </div>
    );
  }

  if (errorNotice || !asset) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unregistered Civic Asset</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {errorNotice || `We could not locate asset code ${assetId}. You can still file a general complaint by specifying the location manually.`}
          </p>
          <Link
            to="/citizen/submit-complaint"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            File General Grievance Instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-md">
              TAG: {asset.assetId}
            </span>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
              {asset.name}
            </h2>
          </div>
        </div>

        {/* Asset Details Grid */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-xs space-y-2 border border-slate-200/60 dark:border-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-500">Asset Type:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{asset.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Municipal Ward:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{asset.ward}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Registered Location:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
              {asset.location}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Current Status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{asset.status}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          This registered public asset location and ward will be automatically attached to your grievance report for instant municipal crew dispatch.
        </p>

        <button
          type="button"
          onClick={handleProceedToComplaint}
          className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
        >
          <span>Report an Issue on This Asset</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
