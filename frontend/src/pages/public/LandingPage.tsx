import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { trackingApi, LiveTrackingData } from '../../api/trackingApi';
import { Order, TrackingEvent, OrderStatus } from '../../types';
import { GatimanLogo, ScooterIcon } from '../../components/common/GatimanLogo';
import { ConveyorHero3D } from '../../components/common/ConveyorHero3D';
import {
  Truck, Search, ArrowRight, Star, Users, Building2,
  Radio, ChevronLeft, ChevronRight, AlertCircle, X,
  ChevronDown, Navigation, CheckCircle2, UserCheck, RefreshCw,
  Shield, MapPin, Clock, Phone, Package, ShieldCheck, User,
  Zap, Calculator, ArrowUpRight, Gauge, Cpu, Route, Sparkles,
  ExternalLink, Layers, Check, HelpCircle
} from 'lucide-react';

const deliverySteps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'CREATED', label: 'Order Created', icon: Package },
  { status: 'ASSIGNED', label: 'Driver Assigned', icon: UserCheck },
  { status: 'PICKED_UP', label: 'Picked Up', icon: Package },
  { status: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Navigation },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

const getStepIndex = (status?: OrderStatus) => {
  const map: Partial<Record<OrderStatus, number>> = {
    CREATED: 0, ASSIGNED: 1, PICKED_UP: 2, IN_TRANSIT: 3,
    OUT_FOR_DELIVERY: 4, DELIVERED: 5, FAILED: 4, RESCHEDULED: 4,
  };
  return status ? (map[status] ?? 0) : 0;
};

export const LandingPage: React.FC = () => {
  const [trackingInput, setTrackingInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [previewLiveTracking, setPreviewLiveTracking] = useState<LiveTrackingData | null>(null);
  const [trackingTimeline, setTrackingTimeline] = useState<TrackingEvent[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeServiceTab, setActiveServiceTab] = useState(0);

  // Volumetric Rate Calculator interactive state
  const [calcLength, setCalcLength] = useState<number>(30);
  const [calcBreadth, setCalcBreadth] = useState<number>(20);
  const [calcHeight, setCalcHeight] = useState<number>(15);
  const [calcActualWeight, setCalcActualWeight] = useState<number>(1.5);
  const [calcRouteType, setCalcRouteType] = useState<'INTRA_ZONE' | 'INTER_ZONE'>('INTRA_ZONE');

  // Computed rate calculation
  const calculatedEstimates = useMemo(() => {
    const volumetricWeight = (calcLength * calcBreadth * calcHeight) / 5000;
    const billableWeight = Math.max(calcActualWeight, volumetricWeight);
    const roundedBillable = Math.round(billableWeight * 100) / 100;
    
    // Base slab formula (Standard B2C)
    const baseAllowance = 2.0;
    const baseRate = calcRouteType === 'INTRA_ZONE' ? 60 : 120;
    const ratePerKg = calcRouteType === 'INTRA_ZONE' ? 25 : 45;
    
    const extraWeight = Math.max(0, roundedBillable - baseAllowance);
    const estimatedCharge = Math.round(baseRate + (extraWeight * ratePerKg));
    const estimatedHours = calcRouteType === 'INTRA_ZONE' ? '2 - 4 Hours' : 'Same-Day / Next-Day';

    return {
      volumetricWeight: Math.round(volumetricWeight * 100) / 100,
      billableWeight: roundedBillable,
      charge: estimatedCharge,
      transitTime: estimatedHours,
    };
  }, [calcLength, calcBreadth, calcHeight, calcActualWeight, calcRouteType]);

  const handleQuickTrackSubmit = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const cleanId = (customId || trackingInput).trim();
    if (!cleanId) {
      setSearchError('Please enter a valid tracking number (e.g. GTM-20260820-875171)');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setPreviewOrder(null);
    setPreviewLiveTracking(null);
    setTrackingTimeline([]);
    try {
      const order = await orderApi.trackByNumber(cleanId);
      setPreviewOrder(order);

      try {
        const events = await orderApi.getTrackingTimeline(order.id);
        setTrackingTimeline(events);
      } catch {
        setTrackingTimeline([]);
      }

      try {
        const live = await trackingApi.getLiveTracking(order.id);
        setPreviewLiveTracking(live);
      } catch {
        // Fallback telemetry simulation
        setPreviewLiveTracking({
          orderId: order.id,
          trackingNumber: order.trackingNumber,
          status: order.status,
          isLive: true,
          deliveryPartner: order.assignedAgentName
            ? {
              id: order.assignedAgentId || 3,
              name: order.assignedAgentName,
              phoneNumber: '+91 98999 11223',
              vehicleType: 'EV_SCOOTER',
              vehicleNumber: 'DL-03-EV-9821',
            }
            : undefined,
          currentLocation: { latitude: 28.512, longitude: 77.145 },
          heading: 220,
          speed: 28,
          pickupLocation: {
            name: order.pickupName,
            address: order.pickupAddress,
            pincode: order.pickupPincode,
            latitude: 28.5494,
            longitude: 77.2001,
          },
          destination: {
            name: order.dropName,
            address: order.dropAddress,
            pincode: order.dropPincode,
            latitude: 28.49,
            longitude: 77.0888,
          },
          routeWaypoints: [
            { latitude: 28.5494, longitude: 77.2001 },
            { latitude: 28.5384, longitude: 77.1737 },
            { latitude: 28.5198, longitude: 77.1358 },
            { latitude: 28.5054, longitude: 77.1119 },
            { latitude: 28.49, longitude: 77.0888 },
          ],
          distanceRemaining: 3.4,
          distanceUnit: 'km',
          etaMinutes: 8,
          expectedArrival: '03:45 PM',
          lastUpdated: new Date().toISOString(),
          nearDestination: false,
        });
      }
    } catch (err: any) {
      setSearchError(
        err.response?.data?.message ||
        `No active shipment found with tracking ID "${cleanId}". Please check the number and try again.`
      );
    } finally {
      setIsSearching(false);
    }
  };

  const services = [
    {
      title: 'Same-Day Inter-City Corridor Express',
      tag: 'Express Corridor',
      image: '/images/service_intercity_express.jpg',
      desc: 'Scheduled direct hub transit connecting Delhi NCR, Jaipur, Chandigarh, Lucknow, and Agra within guaranteed SLA windows.',
      sla: 'Under 6 Hours',
      type: 'Direct Van / Highway Linehaul',
      badgeColor: 'bg-orange-50 text-brand-600 border-brand-200',
    },
    {
      title: 'Hyperlocal Doorstep On-Demand',
      tag: 'Urban Hyperlocal',
      image: '/images/service_doorstep_hyperlocal.jpg',
      desc: 'Point-to-point doorstep collection and rapid city delivery for parcels, documents, and retail orders with instant driver pairing.',
      sla: '30 - 90 Minutes',
      type: 'EV Scooter / Bike Fleet',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Heavy Cargo & Bulk B2B Freight',
      tag: 'Volumetric Freight',
      image: '/images/service_heavy_freight.jpg',
      desc: 'Dedicated commercial trucks for warehouse replenishment, multi-box inventory, and bulk industrial cargo with volumetric discounts.',
      sla: 'Same-Day / Next-Day',
      type: 'Tempo & 14ft Commercial Truck',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Eco-Friendly Clean Fleet EV Network',
      tag: 'Zero Emissions',
      image: '/images/service_ev_scooter_fleet.jpg',
      desc: '100% electrified last-mile delivery fleet with smart battery swapping hubs minimizing carbon footprint across urban clusters.',
      sla: 'Instant City Dispatch',
      type: 'High-Torque Cargo EV Scooters',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    },
  ];

  const faqs = [
    {
      q: 'How is the volumetric billable weight calculated?',
      a: 'We use the global air and express cargo formula: (Length × Breadth × Height in cm) / 5000. Your billable weight is automatically computed as the maximum of actual dead weight and volumetric dimensional weight, ensuring 100% transparent and deterministic billing.',
    },
    {
      q: 'How does proximity driver auto-assignment work?',
      a: 'Our dispatch engine combines Haversine GPS geo-distance, driver real-time workload quotas (< Max Capacity), and cluster zone matching to automatically pair shipments with the closest qualified driver within seconds of booking.',
    },
    {
      q: 'What happens if a delivery attempt fails?',
      a: 'If recipient is unreachable or unavailable, the delivery agent logs the reason. The recipient instantly receives an OTP-secured link to reschedule delivery to their preferred date and time slot without contacting support.',
    },
    {
      q: 'Which cities and corridors are currently covered?',
      a: 'Ship It covers the complete Delhi NCR metropolitan cluster (Delhi, Noida, Gurugram, Ghaziabad, Faridabad) along with high-speed inter-city corridors linking Jaipur, Chandigarh, Lucknow, and Agra.',
    },
    {
      q: 'Can I test demo accounts without registration?',
      a: 'Yes! The login screen provides 1-click Quick Demo buttons for Customer, Delivery Driver, and Operations Admin portals pre-loaded with live mock orders, real-time telemetry, and rate card rules.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white antialiased">
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. FLOATING GLASSPHORPHISM NAVIGATION BAR
      ───────────────────────────────────────────────────────────────────────────── */}
      <header className="fixed top-3 inset-x-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto pointer-events-none">
        <div className="flex items-center justify-between gap-3 pointer-events-auto">
          
          {/* Logo Capsule */}
          <div className="bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-800 shadow-xl transition hover:border-brand-500/50">
            <GatimanLogo to="/" textColor="text-white" />
          </div>

          {/* Center Navigation Links Capsule */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl px-3 py-1.5 rounded-full border border-slate-800 shadow-xl text-xs font-semibold text-slate-300">
            <a href="#home" className="px-3.5 py-1.5 rounded-full bg-slate-800 text-white font-bold transition shadow-xs">
              Home
            </a>
            <a href="#tracking" className="px-3.5 py-1.5 rounded-full text-brand-400 hover:bg-brand-500/10 transition flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse text-brand-500" />
              <span>Live Radar</span>
            </a>
            <a href="#calculator" className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1">
              <Calculator className="w-3 h-3 text-slate-400" />
              <span>Rate Calculator</span>
            </a>
            <a href="#services" className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-slate-800/60 transition">
              Fleet &amp; Services
            </a>
            <a href="#features" className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-slate-800/60 transition">
              Architecture
            </a>
            <a href="#faq" className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-slate-800/60 transition">
              FAQ
            </a>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Hubs Online</span>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 border border-brand-400/30 transition shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          FLOATING RIGHT-SIDE QUICK PERSONA ONBOARDING DOCK
      ───────────────────────────────────────────────────────────────────────────── */}
      <aside className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 pointer-events-auto">
        <div className="flex flex-col gap-2.5 p-2 bg-slate-900/90 backdrop-blur-2xl rounded-full border border-slate-800 shadow-2xl shadow-black/50">
          
          {/* Driver Quick Button */}
          <div className="relative group flex items-center justify-center">
            <Link
              to="/register/driver"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Drive & Earn with Ship It"
            >
              <Truck className="w-5 h-5" />
            </Link>

            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="bg-slate-900 text-white text-xs px-3.5 py-2 rounded-2xl border border-slate-700 shadow-2xl whitespace-nowrap flex flex-col">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Join Fleet as Driver</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-medium mt-0.5">High-Earning Run Sheets ➔</span>
              </div>
            </div>
          </div>

          {/* Customer Quick Button */}
          <div className="relative group flex items-center justify-center">
            <Link
              to="/register/customer"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-brand-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Send Parcels with Ship It"
            >
              <User className="w-5 h-5" />
            </Link>

            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="bg-slate-900 text-white text-xs px-3.5 py-2 rounded-2xl border border-slate-700 shadow-2xl whitespace-nowrap flex flex-col">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                  <span>Register as Customer</span>
                </span>
                <span className="text-[10px] text-brand-400 font-medium mt-0.5">Instant Parcel Dispatch ➔</span>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. HERO SECTION WITH EMBEDDED 3D CONVEYOR BACKGROUND
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="home" className="relative pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden min-h-[620px] sm:min-h-[680px] flex flex-col justify-end p-6 sm:p-12 shadow-2xl border border-slate-800 bg-slate-900/40">
          
          {/* Photorealistic 3D WebGL Conveyor Simulation Canvas */}
          <ConveyorHero3D />

          {/* Deep ambient contrast gradient overlay to ensure crystal clear readability */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-5" />
          <div className="absolute inset-0 pointer-events-none bg-radial-at-bl from-slate-950/90 via-transparent to-transparent z-5" />

          {/* Hero Content Stack */}
          <div className="relative z-10 max-w-3xl space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-brand-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Next-Gen Hyperlocal &amp; Inter-City Dispatch</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black text-white leading-[1.05] tracking-tight">
              Speed-of-Light Last-Mile Logistics.
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Deterministic volumetric rating, automated proximity driver pairing, and real-time sub-second GPS telemetry built for modern commerce.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register/customer"
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-brand-600/40 hover:scale-105 active:scale-95"
              >
                <span>Book Instant Pickup</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#tracking"
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-sm transition flex items-center gap-2"
              >
                <Radio className="w-4 h-4 text-brand-400 animate-pulse" />
                <span>Track Live Radar</span>
              </a>

              <a
                href="#calculator"
                className="px-6 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700 text-slate-200 font-bold text-sm transition flex items-center gap-2"
              >
                <Calculator className="w-4 h-4 text-slate-400" />
                <span>Rate Estimator</span>
              </a>
            </div>

            {/* Live Platform KPI Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-slate-400 block text-[11px]">Average Pairing</span>
                <span className="text-lg font-black text-white mt-0.5 block font-heading">⚡ 12.4 Min</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-slate-400 block text-[11px]">On-Time SLA</span>
                <span className="text-lg font-black text-emerald-400 mt-0.5 block font-heading">🎯 99.8%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-slate-400 block text-[11px]">Express Hubs</span>
                <span className="text-lg font-black text-amber-400 mt-0.5 block font-heading">📍 500+ Active</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-slate-400 block text-[11px]">OTP Protected</span>
                <span className="text-lg font-black text-teal-400 mt-0.5 block font-heading">🛡️ 100% Verified</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. REAL-TIME TRACKING RADAR COCKPIT
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="tracking" className="px-4 sm:px-8 max-w-7xl mx-auto -mt-8 mb-16 relative z-20">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-brand-500 animate-pulse" />
                <span>Live Inter-City Radar &amp; Parcel Telemetry</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant GPS telemetry, corridor transit status, and automated driver ETA countdown.
              </p>
            </div>
            
            {/* Quick Sample Tracking Numbers */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-500 font-mono text-[11px]">Try demo:</span>
              <button
                type="button"
                onClick={() => {
                  setTrackingInput('GTM-20260820-875171');
                  handleQuickTrackSubmit(undefined, 'GTM-20260820-875171');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400 font-mono text-[11px] border border-slate-700 transition cursor-pointer"
              >
                GTM-20260820-875171
              </button>
            </div>
          </div>

          <form onSubmit={handleQuickTrackSubmit} className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-brand-500" />
              </div>
              <input
                id="tracking-radar-input"
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter Ship It tracking number (e.g. GTM-20260820-875171)..."
                className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-mono transition"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSearching}
              className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <span className="animate-spin">↻</span> : <Radio className="w-4 h-4 text-white" />}
              <span>Track Live Telemetry</span>
            </button>
          </form>

          {searchError && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────────
              ACTIVE LIVE TELEMETRY DASHBOARD PREVIEW
          ───────────────────────────────────────────────────────────────────────────── */}
          {previewOrder && previewLiveTracking && (
            <div className="mt-6 space-y-6 animate-in fade-in duration-300">
              
              {/* Top Banner with Tracking Number & Active Status */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-600 text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>{previewOrder.status}</span>
                      </span>
                      <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wide">
                        {previewOrder.trackingNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Corridor Transit: <strong className="text-slate-200 font-mono">{previewOrder.pickupPincode}</strong> ➔ <strong className="text-slate-200 font-mono">{previewOrder.dropPincode}</strong> · Total Billed: <strong className="text-emerald-400">₹{previewOrder.totalCharge}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-orange-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>OTP Protected Delivery</span>
                    </div>
                  </div>
                </div>

                {/* 6-Step Visual Milestone Stepper */}
                <div className="py-6 border-b border-slate-800">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {deliverySteps.map((step, idx) => {
                      const currentIdx = getStepIndex(previewOrder.status);
                      const isCompleted = idx < currentIdx;
                      const isCurrent = idx === currentIdx;
                      const StepIcon = step.icon;

                      return (
                        <div key={step.status} className="flex flex-col items-center text-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/40 ring-4 ring-brand-500/20 scale-110'
                                : isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <span className={`text-[11px] font-bold mt-2 ${
                            isCurrent ? 'text-brand-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time Telemetry Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Assigned Driver</span>
                    <span className="font-bold text-white text-sm mt-0.5 block truncate">
                      {previewLiveTracking.deliveryPartner?.name || 'Rajesh Kumar'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Distance Remaining</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">
                      {previewLiveTracking.distanceRemaining || 3.4} km
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Estimated Arrival</span>
                    <span className="font-bold text-amber-400 text-sm mt-0.5 block">
                      ~{previewLiveTracking.etaMinutes || 12} mins
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Fleet Vehicle</span>
                    <span className="font-bold text-white text-sm mt-0.5 block font-mono">
                      {previewLiveTracking.deliveryPartner?.vehicleNumber || 'DL-03-EV-9821'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Corridor Route & Milestone Timeline Split Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Origin & Destination Route Card */}
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    <span>Corridor Route &amp; Addresses</span>
                  </h4>

                  {/* Pickup Endpoint */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-brand-400">Origin / Pickup</span>
                      <h5 className="text-xs font-bold text-white mt-0.5">{previewOrder.pickupName}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">{previewOrder.pickupAddress}</p>
                      <span className="inline-block mt-1 font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        PIN: {previewOrder.pickupPincode}
                      </span>
                    </div>
                  </div>

                  {/* Destination Endpoint */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-400">Destination / Dropoff</span>
                      <h5 className="text-xs font-bold text-white mt-0.5">{previewOrder.dropName}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">{previewOrder.dropAddress}</p>
                      <span className="inline-block mt-1 font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        PIN: {previewOrder.dropPincode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Milestone Event Timeline */}
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-500" />
                    <span>Real-Time Milestone Log</span>
                  </h4>

                  <div className="space-y-2.5">
                    {trackingTimeline.length > 0 ? (
                      trackingTimeline.map((ev, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                          <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-white">{ev.newStatus}</strong>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {ev.eventTimestamp ? new Date(ev.eventTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                              </span>
                            </div>
                            <p className="text-slate-400 mt-0.5 text-[11px]">{ev.remarks || `Status updated to ${ev.newStatus}`}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
                        <div className="flex items-center justify-between text-white font-semibold">
                          <span>Corridor Transit Active</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE TELEMETRY</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Driver {previewLiveTracking.deliveryPartner?.name || 'Partner'} is moving along the designated corridor. Updates are broadcast via sub-second WebSocket telemetry.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. INTERACTIVE VOLUMETRIC RATE CALCULATOR TOOL
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="calculator" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-12 shadow-2xl">
          
          <div className="max-w-3xl mb-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-[11px] font-bold uppercase tracking-wider text-brand-400">
              <Calculator className="w-3.5 h-3.5" />
              <span>Deterministic Rating Engine</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight">
              Instant Volumetric Rate Calculator
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Calculate exact shipping costs in real-time based on actual dead weight versus cubic dimensional weight: <span className="font-mono text-brand-400">(L × B × H) / 5000</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Form Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Route Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Route Scope
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCalcRouteType('INTRA_ZONE')}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      calcRouteType === 'INTRA_ZONE'
                        ? 'bg-brand-500/10 border-brand-500 text-white ring-1 ring-brand-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-left">
                      <div>Intra-City Zone</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Same Hub / Same City</div>
                    </div>
                    {calcRouteType === 'INTRA_ZONE' && <Check className="w-4 h-4 text-brand-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCalcRouteType('INTER_ZONE')}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      calcRouteType === 'INTER_ZONE'
                        ? 'bg-brand-500/10 border-brand-500 text-white ring-1 ring-brand-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-left">
                      <div>Inter-City Corridor</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Between Different Cities</div>
                    </div>
                    {calcRouteType === 'INTER_ZONE' && <Check className="w-4 h-4 text-brand-400" />}
                  </button>
                </div>
              </div>

              {/* Package Dimensions (L, B, H) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Parcel Dimensions (Centimeters)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Length (cm)</span>
                    <input
                      type="number"
                      min="1"
                      value={calcLength}
                      onChange={(e) => setCalcLength(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Breadth (cm)</span>
                    <input
                      type="number"
                      min="1"
                      value={calcBreadth}
                      onChange={(e) => setCalcBreadth(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Height (cm)</span>
                    <input
                      type="number"
                      min="1"
                      value={calcHeight}
                      onChange={(e) => setCalcHeight(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actual Physical Dead Weight */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Actual Dead Weight
                  </label>
                  <span className="text-xs font-mono font-bold text-brand-400">{calcActualWeight} kg</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="30"
                  step="0.1"
                  value={calcActualWeight}
                  onChange={(e) => setCalcActualWeight(Number(e.target.value))}
                  className="w-full accent-brand-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0.1 kg</span>
                  <span>15 kg</span>
                  <span>30 kg</span>
                </div>
              </div>

            </div>

            {/* Right Computed Rate Card (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Price</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  B2C Standard Rate
                </span>
              </div>

              <div className="text-center py-2">
                <span className="text-4xl sm:text-5xl font-black font-heading text-white tracking-tight">
                  ₹{calculatedEstimates.charge}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  Estimated Transit Time: <strong className="text-slate-300">{calculatedEstimates.transitTime}</strong>
                </span>
              </div>

              {/* Weight Breakdown Comparison */}
              <div className="space-y-2.5 text-xs bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between text-slate-400">
                  <span>Actual Scale Weight:</span>
                  <span className="font-mono text-white font-bold">{calcActualWeight} kg</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Volumetric Weight:</span>
                  <span className="font-mono text-brand-400 font-bold">{calculatedEstimates.volumetricWeight} kg</span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold pt-2 border-t border-slate-800">
                  <span>Billable Weight:</span>
                  <span className="font-mono text-emerald-400">{calculatedEstimates.billableWeight} kg</span>
                </div>
              </div>

              <Link
                to="/register/customer"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30"
              >
                <span>Dispatch Shipment at this Rate</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. FLEET & SERVICES SHOWCASE
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="services" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Truck className="w-3.5 h-3.5 text-brand-400" />
              <span>Corridor Transit &amp; Fleet Solutions</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight">
              Engineered for Every Cargo Dimension
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {services.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveServiceTab(idx)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeServiceTab === idx
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {s.tag}
              </button>
            ))}
          </div>
        </div>

        {/* Highlighted Service Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-[2.5rem] bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <div className="lg:col-span-6 relative h-64 sm:h-80 rounded-3xl overflow-hidden border border-slate-800 shadow-inner">
            <img
              src={services[activeServiceTab].image}
              alt={services[activeServiceTab].title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${services[activeServiceTab].badgeColor}`}>
                {services[activeServiceTab].tag}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
              {services[activeServiceTab].title}
            </h3>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {services[activeServiceTab].desc}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Guaranteed SLA</span>
                <span className="text-base font-bold text-white mt-0.5 block">{services[activeServiceTab].sla}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Vehicle Assignment</span>
                <span className="text-base font-bold text-brand-400 mt-0.5 block">{services[activeServiceTab].type}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/register/customer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs transition shadow-md"
              >
                <span>Dispatch with this Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. ARCHITECTURAL PILLARS & FEATURES
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span>Platform Capabilities</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight">
            Built for High-Velocity Scale
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Engineered with a clean separation of concerns, finite state machines, and cryptographic auditability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Volumetric Pricing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic billable rating based on cubic parcel dimensions prevents carrier weight discrepancies.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Navigation className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Proximity Auto-Pairing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time driver location and workload quota balancing assigns pickups in under 15 minutes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Self-Service Recovery</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-attempt failed delivery recovery empowers customers to pick custom reschedule windows with 1-click.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Immutable Event Logs</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Append-only audit trail logs every state transition, GPS waypoint, and actor timestamp securely.
            </p>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. FAQ ACCORDION SECTION
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
            <span>Got Questions?</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  activeFaq === idx ? 'rotate-180 text-brand-400' : ''
                }`} />
              </button>

              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          8. CALL TO ACTION SECTION
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-rose-600 p-8 sm:p-14 text-white shadow-2xl text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight">
              Accelerate Your Delivery Operations Today
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Experience the speed, reliability, and precision of Ship It for your parcels, e-commerce orders, and corridor freight.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/register/customer"
              className="px-8 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm transition shadow-lg hover:scale-105 active:scale-95"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-md border border-white/20 text-white font-bold text-sm transition"
            >
              Log in to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          9. FOOTER
      ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <GatimanLogo to="/" textColor="text-white" />
            <span className="text-slate-600">|</span>
            <span>Intelligent Last-Mile Logistics</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://github.com/rakshitp18/Last-Mile-Delivery-Tracker" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1.5">
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link to="/login" className="hover:text-white transition">Portal Login</Link>
            <a href="#tracking" className="hover:text-white transition">Live Radar</a>
          </div>

          <div className="text-center sm:text-right">
            <p>© 2026 **Rakshit Pandey**. All Rights Reserved.</p>
          </div>

        </div>
      </footer>

    </div>
  );
};
