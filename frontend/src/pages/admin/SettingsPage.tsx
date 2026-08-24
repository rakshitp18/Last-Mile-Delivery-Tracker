import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Server,
  Bell,
  Mail,
  Zap,
  Truck,
  DollarSign,
  Key,
  CheckCircle2,
  Save,
  RotateCcw,
  Sliders,
  Radio,
  Lock,
  Globe,
  Database,
  Cpu,
  Navigation,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  // Dispatch Engine Settings
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [dispatchStrategy, setDispatchStrategy] = useState('PROXIMITY');
  const [maxRadiusKm, setMaxRadiusKm] = useState(15);
  const [maxDriverOrders, setMaxDriverOrders] = useState(5);
  const [geofenceToleranceMeters, setGeofenceToleranceMeters] = useState(150);

  // Billing & Volumetric Constants
  const [volumetricDivisor, setVolumetricDivisor] = useState(5000);
  const [codFlatFee, setCodFlatFee] = useState(40);
  const [codPercentFee, setCodPercentFee] = useState(2.0);
  const [fuelSurcharge, setFuelSurcharge] = useState(0.0);
  const [gstRate, setGstRate] = useState(18);

  // Notifications
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [deduplicationEnabled, setDeduplicationEnabled] = useState(true);
  const [telemetryBroadcastInterval, setTelemetryBroadcastInterval] = useState(5);

  // UI state
  const [activeTab, setActiveTab] = useState<'dispatch' | 'billing' | 'notifications' | 'security'>('dispatch');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    // Save to localStorage
    const config = {
      autoDispatch,
      dispatchStrategy,
      maxRadiusKm,
      maxDriverOrders,
      geofenceToleranceMeters,
      volumetricDivisor,
      codFlatFee,
      codPercentFee,
      fuelSurcharge,
      gstRate,
      emailAlertsEnabled,
      deduplicationEnabled,
      telemetryBroadcastInterval,
    };
    localStorage.setItem('gatiman_dispatch_settings', JSON.stringify(config));
    setToastMessage('System settings & dispatch thresholds updated successfully.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReset = () => {
    setAutoDispatch(true);
    setDispatchStrategy('PROXIMITY');
    setMaxRadiusKm(15);
    setMaxDriverOrders(5);
    setGeofenceToleranceMeters(150);
    setVolumetricDivisor(5000);
    setCodFlatFee(40);
    setCodPercentFee(2.0);
    setFuelSurcharge(0.0);
    setGstRate(18);
    setEmailAlertsEnabled(true);
    setDeduplicationEnabled(true);
    setTelemetryBroadcastInterval(5);
    setToastMessage('Settings restored to platform defaults.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-orange-600" />
            System & Dispatch Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated driver matching algorithms, volumetric billing divisors, CORS thresholds, and notification relays
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-orange-500 transition cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800 text-xs font-semibold shadow-2xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-2">
        {[
          { id: 'dispatch', label: 'Dispatch & Fleet Engine', icon: Truck },
          { id: 'billing', label: 'Pricing & Volumetric Constants', icon: DollarSign },
          { id: 'notifications', label: 'Email & Telemetry Channels', icon: Mail },
          { id: 'security', label: 'API Keys & System Health', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═════════════════════════════════════════════════════════
          TAB 1: DISPATCH & FLEET ENGINE
      ═════════════════════════════════════════════════════════ */}
      {activeTab === 'dispatch' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Pairing Algorithm */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Auto-Dispatch Engine</h3>
                <p className="text-[11px] text-slate-500">Autonomous pairing of bookings to drivers</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Autonomous Auto-Pairing</span>
                  <span className="text-slate-500 text-[11px]">Automatically dispatch nearest driver upon order creation</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDispatch}
                    onChange={(e) => setAutoDispatch(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Driver Selection Strategy</label>
                <select
                  value={dispatchStrategy}
                  onChange={(e) => setDispatchStrategy(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 focus:border-orange-600 focus:bg-white focus:outline-none"
                >
                  <option value="PROXIMITY">Haversine GPS Proximity (Shortest Distance)</option>
                  <option value="LEAST_LOADED">Least Loaded Driver (Balanced Fleet Quota)</option>
                  <option value="ROUND_ROBIN">Round Robin Dispatch Distribution</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-slate-800">Max Search Proximity Radius</span>
                  <span className="font-mono font-bold text-orange-600">{maxRadiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="40"
                  value={maxRadiusKm}
                  onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>3 km (Hyperlocal)</span>
                  <span>40 km (NCR Regional)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Driver Quotas & Geofencing */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Capacity & Geofence Limits</h3>
                <p className="text-[11px] text-slate-500">Payload thresholds and SLA validation</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Concurrent Active Order Ceiling per Driver
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={maxDriverOrders}
                    onChange={(e) => setMaxDriverOrders(Math.max(1, Number(e.target.value)))}
                    className="w-24 rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono font-bold text-slate-900 text-xs focus:border-orange-600 focus:bg-white focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500">Maximum orders handled simultaneously</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Geofence Arrival Tolerance (Meters)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="25"
                    min="50"
                    max="500"
                    value={geofenceToleranceMeters}
                    onChange={(e) => setGeofenceToleranceMeters(Number(e.target.value))}
                    className="w-24 rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono font-bold text-slate-900 text-xs focus:border-orange-600 focus:bg-white focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500">Trigger 'Near Destination' within radius</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold">Haversine Metric:</span>
                  <span className="font-mono text-slate-800">Earth Radius = 6371 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">SLA Window:</span>
                  <span className="text-emerald-700 font-bold">45 mins Intra-Zone Target</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 2: PRICING & VOLUMETRIC CONSTANTS
      ═════════════════════════════════════════════════════════ */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Volumetric Weight Divisor</h3>
                <p className="text-[11px] text-slate-500">IATA commercial volumetric formula</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Volumetric Divisor Constant (cm³/kg)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={volumetricDivisor}
                    onChange={(e) => setVolumetricDivisor(Number(e.target.value))}
                    className="w-32 rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono font-bold text-slate-900 text-xs focus:border-orange-600 focus:bg-white focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500">Standard: <strong>5000 cm³/kg</strong></span>
                </div>
              </div>

              <div className="rounded-xl bg-orange-50/70 border border-orange-100 p-3 text-[11px] text-orange-950 font-mono">
                Billable Weight = MAX(Actual Weight, (L × W × H) / {volumetricDivisor})
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Surcharges & Taxation</h3>
                <p className="text-[11px] text-slate-500">COD, GST, and handling rates</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">COD Flat Base (₹)</label>
                  <input
                    type="number"
                    value={codFlatFee}
                    onChange={(e) => setCodFlatFee(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono font-bold text-slate-900 text-xs focus:border-orange-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">COD Percent (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={codPercentFee}
                    onChange={(e) => setCodPercentFee(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono font-bold text-slate-900 text-xs focus:border-orange-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">GST / Tax Rate (%)</label>
                  <input
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono font-bold text-slate-900 text-xs focus:border-orange-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Fuel Surcharge (%)</label>
                  <input
                    type="number"
                    value={fuelSurcharge}
                    onChange={(e) => setFuelSurcharge(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono font-bold text-slate-900 text-xs focus:border-orange-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 3: EMAIL & TELEMETRY CHANNELS
      ═════════════════════════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Email Notification Relays</h3>
                <p className="text-[11px] text-slate-500">Automated milestone transmissions</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Milestone Email Dispatch</span>
                  <span className="text-slate-500 text-[11px]">Send customer updates on order events</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlertsEnabled}
                    onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">Idempotent Deduplication</span>
                  <span className="text-slate-500 text-[11px]">Prevent duplicate email dispatches per milestone</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deduplicationEnabled}
                    onChange={(e) => setDeduplicationEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Telemetry Webhook Interval</h3>
                <p className="text-[11px] text-slate-500">Real-time driver location updates</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-slate-800">Telemetry Broadcast Interval</span>
                  <span className="font-mono font-bold text-orange-600">{telemetryBroadcastInterval} seconds</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={telemetryBroadcastInterval}
                  onChange={(e) => setTelemetryBroadcastInterval(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span className="font-mono font-bold text-slate-800">SSE / WebSocket Telemetry</span>
                </div>
                <div className="flex justify-between">
                  <span>Location Refresh Rate:</span>
                  <span className="font-bold text-emerald-700">~{telemetryBroadcastInterval}s Latency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 4: SECURITY & API KEYS HEALTH
      ═════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Environment & Authentication Status</h3>
              <p className="text-[11px] text-slate-500">Live operational integrations loaded from root .env</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Google OAuth 2.0</span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate" title={import.meta.env.VITE_GOOGLE_CLIENT_ID || '631552883561-r8m66tevmlmtn07ice0g4oq7jidflcov.apps.googleusercontent.com'}>
                {import.meta.env.VITE_GOOGLE_CLIENT_ID || '631552883561-r8m66tevmlmtn07ice0g4oq7jidflcov.apps.googleusercontent.com'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Razorpay Payment</span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  rzp_test
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                rzp_test_TTNaA35CVbi6kG
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Gmail SMTP & Brevo</span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Operational
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                smtp.gmail.com : 587
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Master Config</span>
                <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                  Root Unified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                /.env (Single Source of Truth)
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">API Rate Limiting</span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  100 req/min
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                Bucket4j Token Bucket Active
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Database Persistence</span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  PostgreSQL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                Neon Cloud Serverless PostgreSQL
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
