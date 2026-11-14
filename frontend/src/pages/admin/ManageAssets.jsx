// ==============================================================================
// Municipal Infrastructure Asset Management (ManageAssets.jsx)
// Register public civic assets, generate physical QR tags, and track maintenance
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { assetAPI } from '../../services/api';
import { CITY_WARDS } from '../../utils/constants';
import {
  QrCode,
  Plus,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  ExternalLink,
  Copy,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeQrModal, setActiveQrModal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    assetId: '',
    name: '',
    category: 'STREETLIGHT',
    ward: CITY_WARDS[0] || 'Ward 1',
    location: '',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    pincode: '',
    latitude: 17.385,
    longitude: 78.4867,
  });

  const loadAssets = async () => {
    try {
      setRefreshing(true);
      const res = await assetAPI.getAll();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAssets(res.data.data);
      }
    } catch (err) {
      console.warn('Asset load notice:', err.message);
      // Fallback sample assets
      setAssets([
        {
          _id: 'mock-a1',
          assetId: 'SL-HYD-0412',
          name: 'High-Mast LED Streetlight Pole #4',
          category: 'STREETLIGHT',
          ward: 'Ward 4 - South Green Park',
          location: 'Community Center Gate 2',
          state: 'Telangana',
          district: 'Hyderabad',
          city: 'Hyderabad',
          status: 'active',
          relatedComplaints: [1, 2],
        },
        {
          _id: 'mock-a2',
          assetId: 'WP-HYD-0105',
          name: 'Borewell Potable Water Point #1',
          category: 'WATER_PUMP',
          ward: 'Ward 1 - Central Market',
          location: 'Near Old Water Tank, Market St.',
          state: 'Telangana',
          district: 'Hyderabad',
          city: 'Hyderabad',
          status: 'active',
          relatedComplaints: [],
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!formData.assetId.trim() || !formData.name.trim() || !formData.location.trim()) {
      toast.error('Asset ID, Name, and Location description are required.');
      return;
    }

    try {
      const res = await assetAPI.create(formData);
      if (res.data?.success) {
        toast.success(`Asset ${formData.assetId.toUpperCase()} registered successfully!`);
        setShowCreateModal(false);
        setFormData({
          assetId: '',
          name: '',
          category: 'STREETLIGHT',
          ward: CITY_WARDS[0] || 'Ward 1',
          location: '',
          state: 'Telangana',
          district: 'Hyderabad',
          city: 'Hyderabad',
          pincode: '',
          latitude: 17.385,
          longitude: 78.4867,
        });
        loadAssets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register civic asset.');
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = categoryFilter ? asset.category === categoryFilter : true;
    const matchesSearch = searchTerm
      ? asset.assetId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.ward?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const getReportingUrl = (assetId) => {
    return `${window.location.origin}/report/asset/${assetId}`;
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Direct QR reporting link copied to clipboard!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1">
            <QrCode className="w-4 h-4" />
            <span>Public Infrastructure Registry & QR Tagging</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Civic Asset Management</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Register municipal assets, generate scannable QR tags for street furniture, and track recurring incident history.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadAssets}
            disabled={refreshing}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Refresh Assets"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Asset ID, name, ward..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="">All Asset Categories</option>
            <option value="STREETLIGHT">Streetlights</option>
            <option value="WASTE_BIN">Public Waste Bins</option>
            <option value="WATER_PUMP">Water Points & Pumps</option>
            <option value="DRAINAGE_MANHOLE">Drainage Manholes</option>
            <option value="ROAD_SEGMENT">Road Segments</option>
            <option value="PUBLIC_TOILET">Public Sanitation Units</option>
            <option value="TRAFFIC_SIGNAL">Traffic Signals</option>
            <option value="OTHER">Other Assets</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Asset ID / Tag</th>
                <th className="py-3 px-4">Name & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Ward & Location</th>
                <th className="py-3 px-4">Maintenance History</th>
                <th className="py-3 px-4 text-right">QR Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading municipal assets...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No civic assets found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                        {asset.assetId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                      <div className="text-[10px] text-slate-400">{asset.city}, {asset.state}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {asset.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600 dark:text-slate-300 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">{asset.ward}</div>
                      <div className="truncate text-slate-400">{asset.location}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        <span>{asset.relatedComplaints?.length || 0} issues logged</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setActiveQrModal(asset)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View QR</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Inspection Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative text-center">
            <button
              onClick={() => setActiveQrModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 mx-auto flex items-center justify-center mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">Physical Asset QR Tag</h3>
            <p className="text-xs text-slate-400 mt-1">
              Affix this tag to the physical equipment for instant 1-scan citizen grievance filing.
            </p>

            {/* QR Code Visual Card */}
            <div className="my-6 p-6 rounded-2xl bg-white border-2 border-dashed border-sky-300 inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  getReportingUrl(activeQrModal.assetId)
                )}`}
                alt={`QR for ${activeQrModal.assetId}`}
                className="w-44 h-44 mx-auto"
              />
              <div className="mt-3 text-center">
                <span className="font-mono font-black text-sm text-slate-900">
                  {activeQrModal.assetId}
                </span>
                <p className="text-[10px] text-slate-500">{activeQrModal.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleCopyUrl(getReportingUrl(activeQrModal.assetId))}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Direct Citizen Report URL</span>
              </button>

              <a
                href={getReportingUrl(activeQrModal.assetId)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Citizen QR Reporting View</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Register New Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              Register Civic Infrastructure Asset
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Create an asset record to generate its QR identification tag.
            </p>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Asset Tag ID (Unique, e.g. SL-HYD-0412) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SL-HYD-0412"
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Asset Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-Mast LED Light Pole #4"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="STREETLIGHT">Streetlight</option>
                    <option value="WASTE_BIN">Public Waste Bin</option>
                    <option value="WATER_PUMP">Water Point / Pump</option>
                    <option value="DRAINAGE_MANHOLE">Drainage Manhole</option>
                    <option value="ROAD_SEGMENT">Road Segment</option>
                    <option value="PUBLIC_TOILET">Public Toilet</option>
                    <option value="TRAFFIC_SIGNAL">Traffic Signal</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Municipal Ward *
                  </label>
                  <select
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {CITY_WARDS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location Landmark / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Community Center Gate 2, Main Cross Road"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  Save & Generate Asset QR Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

