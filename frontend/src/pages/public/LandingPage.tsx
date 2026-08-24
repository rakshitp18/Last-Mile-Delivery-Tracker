import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { trackingApi, LiveTrackingData } from '../../api/trackingApi';
import { Order, TrackingEvent, OrderStatus } from '../../types';
import { GatimanLogo } from '../../components/common/GatimanLogo';
import { ConveyorHero3D } from '../../components/common/ConveyorHero3D';
import {
  Truck, Search, ArrowRight, Radio, AlertCircle,
  Navigation, CheckCircle2, UserCheck, RefreshCw,
  MapPin, Clock, Package, ShieldCheck, User,
  Calculator, Cpu, Sparkles, ExternalLink, Check,
  HelpCircle, ChevronDown, ChevronRight, Zap, Shield, ArrowUpRight
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
      badgeColor: 'bg-orange-50 text-brand-700 border-brand-200',
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
    <div className="relative min-h-screen bg-slate-50/80 text-slate-900 font-sans selection:bg-brand-500 selection:text-white antialiased overflow-x-hidden">
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          FULL-SCREEN 3D CONVEYOR BELT ANIMATION (Spacious Center-Right Staging)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-4/5 lg:w-[66%] pointer-events-none overflow-hidden z-0">
        {/* Full Bleed 3D Canvas */}
        <ConveyorHero3D className="absolute inset-0 w-full h-full" showOverlay={false} />
        
        {/* Subtle left-side feather to seamlessly blend with white background */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          1. FLOATING GLASSPHORPHISM NAVIGATION BAR (Light Theme)
      ───────────────────────────────────────────────────────────────────────────── */}
      <header className="fixed top-3 inset-x-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto pointer-events-none">
        <div className="flex items-center justify-between gap-3 pointer-events-auto">
          
          {/* Logo Capsule */}
          <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-200/90 shadow-lg shadow-slate-900/5 transition hover:shadow-xl hover:border-brand-300">
            <GatimanLogo to="/" />
          </div>

          {/* Center Navigation Links Capsule */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/90 backdrop-blur-xl px-3 py-1.5 rounded-full border border-slate-200/90 shadow-lg shadow-slate-900/5 text-xs font-semibold text-slate-600">
            <a href="#home" className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-bold transition shadow-xs">
              Home
            </a>
            <a href="#tracking" className="px-3.5 py-1.5 rounded-full text-brand-600 hover:bg-brand-50 transition flex items-center gap-1.5 font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-brand-500" />
              <span>Live Radar</span>
            </a>
            <a href="#calculator" className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-slate-500" />
              <span>Rate Calculator</span>
            </a>
            <a href="#services" className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100 transition">
              Fleet &amp; Services
            </a>
            <a href="#features" className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100 transition">
              Architecture
            </a>
            <a href="#faq" className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100 transition">
              FAQ
            </a>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-[11px] font-mono text-emerald-700 font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Hubs Online</span>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 border border-brand-400/30 transition shadow-md shadow-brand-600/20 hover:scale-105 active:scale-95 cursor-pointer"
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
        <div className="flex flex-col gap-2.5 p-2 bg-white/90 backdrop-blur-2xl rounded-full border border-slate-200/90 shadow-2xl shadow-slate-900/10">
          
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
              <div className="bg-slate-900 text-white text-xs px-3.5 py-2 rounded-2xl border border-slate-800 shadow-2xl whitespace-nowrap flex flex-col">
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
              <div className="bg-slate-900 text-white text-xs px-3.5 py-2 rounded-2xl border border-slate-800 shadow-2xl whitespace-nowrap flex flex-col">
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
          MAIN CONTENT LAYER (Floats with glass cards on top of full-bleed 3D background)
      ───────────────────────────────────────────────────────────────────────────── */}
      <main className="relative z-10">

        {/* ─────────────────────────────────────────────────────────────────────────────
            2. HERO SECTION (Light Theme, Uncontained Full-Background 3D)
        ───────────────────────────────────────────────────────────────────────────── */}
        <section id="home" className="pt-32 sm:pt-40 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-brand-200/80 text-xs font-bold text-brand-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Next-Gen Hyperlocal &amp; Inter-City Dispatch</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black text-slate-950 leading-[1.08] tracking-tight">
              Speed-of-Light Last-Mile Logistics.
            </h1>
            
            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-700 max-w-2xl leading-relaxed font-normal">
              Deterministic volumetric rating, automated proximity driver pairing, and real-time sub-second GPS telemetry engineered for modern commerce.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register/customer"
                className="px-7 py-4 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 hover:from-brand-700 hover:to-rose-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-xl shadow-brand-600/30 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Book Instant Pickup</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#tracking"
                className="px-7 py-4 rounded-full bg-white/90 hover:bg-white text-slate-800 font-bold text-sm transition flex items-center gap-2 border border-slate-200/90 shadow-md shadow-slate-900/5 hover:border-brand-300"
              >
                <Radio className="w-4 h-4 text-brand-500 animate-pulse" />
                <span>Track Live Radar</span>
              </a>

              <a
                href="#calculator"
                className="px-6 py-4 rounded-full bg-white/70 hover:bg-white text-slate-700 font-bold text-sm transition flex items-center gap-2 border border-slate-200/80 shadow-xs"
              >
                <Calculator className="w-4 h-4 text-slate-500" />
                <span>Rate Estimator</span>
              </a>
            </div>

            {/* Live Platform KPI Stats Bar (Light Glass Card) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-8 text-xs">
              <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md shadow-slate-900/5">
                <span className="text-slate-500 block text-[11px] font-semibold">Average Pairing</span>
                <span className="text-xl font-black text-slate-950 mt-1 block font-heading">⚡ 12.4 Min</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md shadow-slate-900/5">
                <span className="text-slate-500 block text-[11px] font-semibold">On-Time SLA</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block font-heading">🎯 99.8%</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md shadow-slate-900/5">
                <span className="text-slate-500 block text-[11px] font-semibold">Express Hubs</span>
                <span className="text-xl font-black text-amber-700 mt-1 block font-heading">📍 500+ Active</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md shadow-slate-900/5">
                <span className="text-slate-500 block text-[11px] font-semibold">OTP Protected</span>
                <span className="text-xl font-black text-teal-700 mt-1 block font-heading">🛡️ 100% Verified</span>
              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────────────
            3. REAL-TIME TRACKING RADAR COCKPIT (Light Theme)
        ───────────────────────────────────────────────────────────────────────────── */}
        <section id="tracking" className="px-4 sm:px-8 max-w-7xl mx-auto mb-20 relative">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-slate-900/10 border border-slate-200/90">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-950 flex items-center gap-2.5">
                  <Radio className="w-6 h-6 text-brand-500 animate-pulse" />
                  <span>Live Inter-City Radar &amp; Parcel Telemetry</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Instant GPS telemetry, corridor transit status, and automated driver ETA countdown.
                </p>
              </div>
              
              {/* Quick Sample Tracking Numbers */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-500 font-mono text-[11px]">Demo ID:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingInput('GTM-20260820-875171');
                    handleQuickTrackSubmit(undefined, 'GTM-20260820-875171');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 text-brand-600 font-mono text-xs font-bold border border-slate-200 hover:border-brand-300 transition cursor-pointer"
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
                  className="w-full pl-12 pr-4 py-4 text-sm bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-mono transition shadow-inner"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSearching}
                className="w-full md:w-auto px-9 py-4 bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 hover:from-brand-700 hover:to-rose-700 text-white text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 cursor-pointer disabled:opacity-50"
              >
                {isSearching ? <span className="animate-spin">↻</span> : <Radio className="w-4 h-4 text-white" />}
                <span>Track Live Telemetry</span>
              </button>
            </form>

            {searchError && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{searchError}</span>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────────────────────
                ACTIVE LIVE TELEMETRY DASHBOARD PREVIEW
            ───────────────────────────────────────────────────────────────────────────── */}
            {previewOrder && previewLiveTracking && (
              <div className="mt-8 space-y-6 animate-in fade-in duration-300">
                
                {/* Top Banner with Tracking Number & Active Status */}
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-600 text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <span>{previewOrder.status}</span>
                        </span>
                        <span className="font-mono text-lg sm:text-xl font-bold text-white tracking-wide">
                          {previewOrder.trackingNumber}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 mt-2">
                        Corridor Transit: <strong className="text-slate-200 font-mono">{previewOrder.pickupPincode}</strong> ➔ <strong className="text-slate-200 font-mono">{previewOrder.dropPincode}</strong> · Total Billed: <strong className="text-emerald-400 font-bold">₹{previewOrder.totalCharge}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-400 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
                              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                isCurrent
                                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/40 ring-4 ring-brand-500/20 scale-110'
                                  : isCompleted
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}
                            >
                              <StepIcon className="w-5 h-5" />
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-slate-400 block text-[11px]">Assigned Driver</span>
                      <span className="font-bold text-white text-base mt-1 block truncate">
                        {previewLiveTracking.deliveryPartner?.name || 'Rajesh Kumar'}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-slate-400 block text-[11px]">Distance Remaining</span>
                      <span className="font-bold text-emerald-400 text-base mt-1 block">
                        {previewLiveTracking.distanceRemaining || 3.4} km
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-slate-400 block text-[11px]">Estimated Arrival</span>
                      <span className="font-bold text-amber-400 text-base mt-1 block">
                        ~{previewLiveTracking.etaMinutes || 12} mins
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-slate-400 block text-[11px]">Fleet Vehicle</span>
                      <span className="font-bold text-white text-base mt-1 block font-mono">
                        {previewLiveTracking.deliveryPartner?.vehicleNumber || 'DL-03-EV-9821'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Corridor Route & Milestone Timeline Split Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Origin & Destination Route Card */}
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand-500" />
                      <span>Corridor Route &amp; Addresses</span>
                    </h4>

                    {/* Pickup Endpoint */}
                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-brand-600">Origin / Pickup</span>
                        <h5 className="text-sm font-bold text-slate-900 mt-0.5">{previewOrder.pickupName}</h5>
                        <p className="text-xs text-slate-600 mt-0.5">{previewOrder.pickupAddress}</p>
                        <span className="inline-block mt-1.5 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                          PIN: {previewOrder.pickupPincode}
                        </span>
                      </div>
                    </div>

                    {/* Destination Endpoint */}
                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-700">Destination / Dropoff</span>
                        <h5 className="text-sm font-bold text-slate-900 mt-0.5">{previewOrder.dropName}</h5>
                        <p className="text-xs text-slate-600 mt-0.5">{previewOrder.dropAddress}</p>
                        <span className="inline-block mt-1.5 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                          PIN: {previewOrder.dropPincode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Milestone Event Timeline */}
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-500" />
                      <span>Real-Time Milestone Log</span>
                    </h4>

                    <div className="space-y-2.5">
                      {trackingTimeline.length > 0 ? (
                        trackingTimeline.map((ev, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-xs">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <strong className="text-slate-900">{ev.newStatus}</strong>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {ev.eventTimestamp ? new Date(ev.eventTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                                </span>
                              </div>
                              <p className="text-slate-500 mt-0.5 text-[11px]">{ev.remarks || `Status updated to ${ev.newStatus}`}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between text-slate-900 font-semibold">
                            <span>Corridor Transit Active</span>
                            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">LIVE TELEMETRY</span>
                          </div>
                          <p className="text-slate-500 text-[11px]">
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
            4. INTERACTIVE VOLUMETRIC RATE CALCULATOR TOOL (Light Theme)
        ───────────────────────────────────────────────────────────────────────────── */}
        <section id="calculator" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="rounded-[2.5rem] bg-white/95 backdrop-blur-xl border border-slate-200/90 p-6 sm:p-12 shadow-2xl shadow-slate-900/5">
            
            <div className="max-w-3xl mb-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                <Calculator className="w-3.5 h-3.5" />
                <span>Deterministic Rating Engine</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-950 tracking-tight">
                Instant Volumetric Rate Calculator
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Calculate exact shipping costs in real-time based on actual dead weight versus cubic dimensional weight: <span className="font-mono font-bold text-brand-600">(L × B × H) / 5000</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Form Controls (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Route Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Route Scope
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCalcRouteType('INTRA_ZONE')}
                      className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        calcRouteType === 'INTRA_ZONE'
                          ? 'bg-brand-50/80 border-brand-500 text-slate-950 ring-2 ring-brand-500/20 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-bold">Intra-City Zone</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">Same Hub / Same City</div>
                      </div>
                      {calcRouteType === 'INTRA_ZONE' && <Check className="w-4 h-4 text-brand-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcRouteType('INTER_ZONE')}
                      className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        calcRouteType === 'INTER_ZONE'
                          ? 'bg-brand-50/80 border-brand-500 text-slate-950 ring-2 ring-brand-500/20 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-bold">Inter-City Corridor</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">Between Different Cities</div>
                      </div>
                      {calcRouteType === 'INTER_ZONE' && <Check className="w-4 h-4 text-brand-600" />}
                    </button>
                  </div>
                </div>

                {/* Package Dimensions (L, B, H) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-mono text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-inner font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Breadth (cm)</span>
                      <input
                        type="number"
                        min="1"
                        value={calcBreadth}
                        onChange={(e) => setCalcBreadth(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-mono text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-inner font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Height (cm)</span>
                      <input
                        type="number"
                        min="1"
                        value={calcHeight}
                        onChange={(e) => setCalcHeight(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-mono text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-inner font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Actual Physical Dead Weight */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actual Dead Weight
                    </label>
                    <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                      {calcActualWeight} kg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="30"
                    step="0.1"
                    value={calcActualWeight}
                    onChange={(e) => setCalcActualWeight(Number(e.target.value))}
                    className="w-full accent-brand-600 bg-slate-200 rounded-lg cursor-pointer h-2.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>0.1 kg</span>
                    <span>15 kg</span>
                    <span>30 kg</span>
                  </div>
                </div>

              </div>

              {/* Right Computed Rate Card (5 Cols) */}
              <div className="lg:col-span-5 p-7 rounded-3xl bg-slate-900 text-white space-y-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Price</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    B2C Standard Rate
                  </span>
                </div>

                <div className="text-center py-2">
                  <span className="text-5xl font-black font-heading text-white tracking-tight">
                    ₹{calculatedEstimates.charge}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1.5">
                    Estimated Transit Time: <strong className="text-brand-400">{calculatedEstimates.transitTime}</strong>
                  </span>
                </div>

                {/* Weight Breakdown Comparison */}
                <div className="space-y-2.5 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
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
                    <span className="font-mono text-emerald-400 text-sm">{calculatedEstimates.billableWeight} kg</span>
                  </div>
                </div>

                <Link
                  to="/register/customer"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Dispatch Shipment at this Rate</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────────────
            5. FLEET & SERVICES SHOWCASE (Light Theme)
        ───────────────────────────────────────────────────────────────────────────── */}
        <section id="services" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs">
                <Truck className="w-3.5 h-3.5 text-brand-600" />
                <span>Corridor Transit &amp; Fleet Solutions</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-950 tracking-tight">
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
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {s.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Highlighted Service Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-[2.5rem] bg-white/95 backdrop-blur-xl border border-slate-200/90 p-6 sm:p-10 shadow-2xl shadow-slate-900/5">
            <div className="lg:col-span-6 relative h-64 sm:h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
              <img
                src={services[activeServiceTab].image}
                alt={services[activeServiceTab].title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${services[activeServiceTab].badgeColor}`}>
                  {services[activeServiceTab].tag}
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 tracking-tight">
                {services[activeServiceTab].title}
              </h3>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {services[activeServiceTab].desc}
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block text-[11px] font-semibold">Guaranteed SLA</span>
                  <span className="text-base font-bold text-slate-900 mt-1 block">{services[activeServiceTab].sla}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block text-[11px] font-semibold">Vehicle Assignment</span>
                  <span className="text-base font-bold text-brand-600 mt-1 block">{services[activeServiceTab].type}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register/customer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Dispatch with this Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────────────
            6. ARCHITECTURAL PILLARS & FEATURES (Light Theme)
        ───────────────────────────────────────────────────────────────────────────── */}
        <section id="features" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs">
              <Cpu className="w-3.5 h-3.5 text-brand-600" />
              <span>Platform Capabilities</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-950 tracking-tight">
              Built for High-Velocity Scale
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Engineered with a clean separation of concerns, finite state machines, and cryptographic auditability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-brand-500/50 hover:shadow-xl shadow-md shadow-slate-900/5 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Calculator className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-950">Volumetric Pricing</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Deterministic billable rating based on cubic parcel dimensions prevents carrier weight discrepancies.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl shadow-md shadow-slate-900/5 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Navigation className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-950">Proximity Auto-Pairing</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Real-time driver location and workload quota balancing assigns pickups in under 15 minutes.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-amber-500/50 hover:shadow-xl shadow-md shadow-slate-900/5 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-950">Self-Service Recovery</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Multi-attempt failed delivery recovery empowers customers to pick custom reschedule windows with 1-click.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-purple-500/50 hover:shadow-xl shadow-md shadow-slate-900/5 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-950">Immutable Event Logs</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Append-only audit trail logs every state transition, GPS waypoint, and actor timestamp securely.
              </p>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────────────
            7. FAQ ACCORDION SECTION (Light Theme)
        ───────────────────────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs">
              <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>Got Questions?</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md overflow-hidden transition shadow-sm hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-slate-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                    activeFaq === idx ? 'rotate-180 text-brand-600' : ''
                  }`} />
                </button>

                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────────────
            8. CALL TO ACTION SECTION (Radiant Gradient Banner)
        ───────────────────────────────────────────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 p-8 sm:p-16 text-white shadow-2xl shadow-brand-600/30 text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white">
                Accelerate Your Delivery Operations Today
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                Experience the speed, reliability, and precision of Ship It for your parcels, e-commerce orders, and corridor freight.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                to="/register/customer"
                className="px-8 py-4 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm transition shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-full bg-black/25 hover:bg-black/35 backdrop-blur-md border border-white/30 text-white font-bold text-sm transition cursor-pointer"
              >
                Log in to Portal
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────────────
            9. FOOTER (Light Theme)
        ───────────────────────────────────────────────────────────────────────────── */}
        <footer className="border-t border-slate-200/90 bg-white/90 backdrop-blur-xl py-12 px-4 sm:px-8 text-xs text-slate-600">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <GatimanLogo to="/" />
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">Intelligent Last-Mile Logistics</span>
            </div>

            <div className="flex items-center gap-6 font-semibold">
              <a href="https://github.com/rakshitp18/Last-Mile-Delivery-Tracker" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition flex items-center gap-1.5">
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <Link to="/login" className="hover:text-brand-600 transition">Portal Login</Link>
              <a href="#tracking" className="hover:text-brand-600 transition">Live Radar</a>
            </div>

            <div className="text-center sm:text-right">
              <p>© 2026 <strong className="text-slate-900">Rakshit Pandey</strong>. All Rights Reserved.</p>
            </div>

          </div>
        </footer>

      </main>

    </div>
  );
};
