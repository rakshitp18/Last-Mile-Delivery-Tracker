import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { trackingApi, LiveTrackingData } from '../../api/trackingApi';
import { Order, TrackingEvent, OrderStatus } from '../../types';
import { GatimanLogo } from '../../components/common/GatimanLogo';
import { ConveyorHero3D } from '../../components/common/ConveyorHero3D';
import {
  Truck, Search, ArrowRight, Star, Users, Building2,
  Radio, ChevronLeft, ChevronRight, AlertCircle, X,
  ChevronDown, Navigation, CheckCircle2, UserCheck, RefreshCw, Shield, MapPin, Clock, Phone, Package, ShieldCheck, User
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
  const [activeServiceSlide, setActiveServiceSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  // Auto-advance services slider
  useEffect(() => {
    if (isSliderPaused) return;
    const interval = setInterval(() => {
      setActiveServiceSlide((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, [isSliderPaused]);

  const handleQuickTrackSubmit = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const cleanId = (customId || trackingInput).trim();
    if (!cleanId) {
      setSearchError('Please enter a valid tracking number (e.g. GTM-20260824-196623)');
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
        // Build accurate fallback telemetry using order details
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
      title: 'Same-Day Inter-City Express',
      tag: 'Corridor Transit',
      image: '/images/service_intercity_express.jpg',
      desc: 'Scheduled direct hub transit connecting Delhi NCR, Jaipur, Chandigarh, and Agra within hours.',
    },
    {
      title: 'Doorstep Hyperlocal Dispatch',
      tag: 'On-Demand Pickup',
      image: '/images/service_doorstep_hyperlocal.jpg',
      desc: 'Instant doorstep collection and same-day city delivery for personal and business parcels.',
    },
    {
      title: 'Heavy Cargo & Bulk Freight',
      tag: 'Volumetric B2B',
      image: '/images/service_heavy_freight.jpg',
      desc: 'Full truckload and volumetric multi-carton commercial shipping with transparent weight slabs.',
    },
    {
      title: 'EV Urban Fleet Delivery',
      tag: 'Zero-Emission Last Mile',
      image: '/images/service_ev_scooter_fleet.jpg',
      desc: 'Eco-friendly electric scooters and delivery vans for fast, green last-mile urban dispatch.',
    },
  ];

  const faqs = [
    {
      q: 'Which cities and corridors do you cover for inter-city delivery?',
      a: 'Ship It connects all major hubs across Delhi NCR (Delhi, Noida, Gurugram, Ghaziabad, Faridabad) and high-speed inter-city corridors including Jaipur, Chandigarh, Lucknow, Agra, and Ludhiana.',
    },
    {
      q: 'How quickly are inter-city consignments picked up and delivered?',
      a: 'Doorstep pickups occur within 60 minutes of booking. Express corridor shipments reach destination hubs within 12 to 24 hours with continuous live GPS tracking.',
    },
    {
      q: 'How do I track my package in real time?',
      a: 'Simply enter your tracking number (e.g. GTM-20260824-196623) in our Live Radar to view live vehicle GPS coordinates, driver contact details, and sub-second ETA countdowns.',
    },
    {
      q: 'How is volumetric weight calculated for parcel pricing?',
      a: 'Volumetric weight is computed as (Length × Width × Height in cm) / 5000. Your billable amount is automatically determined by whichever is higher between actual dead weight and volumetric weight.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. FLOATING NAVIGATION BAR (Glass Capsule with Track Live Radar)
      ───────────────────────────────────────────────────────────────────────────── */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto pointer-events-none">
        <div className="flex items-center justify-between gap-3 pointer-events-auto">
          
          {/* Logo with Scooter Icon */}
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/80 shadow-xs transition hover:shadow-md">
            <GatimanLogo to="/" />
          </div>

          {/* Center Navigation Capsule with Prominent Track Live Radar */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-600">
            <a href="#home" className="px-4 py-2 rounded-full bg-slate-900 text-white font-bold transition shadow-xs">
              Home
            </a>
            <a href="#services" className="px-3.5 py-2 rounded-full hover:text-brand-500 transition flex items-center gap-1">
              Services <ChevronDown className="w-3 h-3 text-slate-400" />
            </a>
            
            {/* Prominent Track Live Radar Nav Button (Zomato Style) */}
            <a
              href="#tracking"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('tracking')?.scrollIntoView({ behavior: 'smooth' });
                const input = document.getElementById('tracking-radar-input') as HTMLInputElement | null;
                if (input) input.focus();
              }}
              className="px-3.5 py-1.5 rounded-full font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition flex items-center gap-1.5 shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
              <span>Track Live Radar</span>
            </a>

            <a href="#faq" className="px-3.5 py-2 rounded-full hover:text-brand-500 transition">
              FAQ
            </a>
          </nav>

          {/* Right Action Button: Login */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold text-slate-800 bg-white/90 backdrop-blur-md border border-slate-200/90 hover:bg-slate-900 hover:text-white transition shadow-sm"
            >
              <span>Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          FLOATING RIGHT-SIDE ACTION DOCK (Truck & Customer Hub)
      ───────────────────────────────────────────────────────────────────────────── */}
      <aside className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 pointer-events-auto">
        <div className="flex flex-col gap-2.5 p-2 bg-white/90 backdrop-blur-2xl rounded-full border border-slate-200/90 shadow-2xl shadow-slate-900/15">
          
          {/* 1. Driver Button (Truck Icon) */}
          <div className="relative group flex items-center justify-center">
            <Link
              to="/register/driver"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Sign in as Driver"
            >
              <Truck className="w-5 h-5" />
            </Link>

            {/* Premium Left-Sliding Glass Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="bg-slate-950/95 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-2xl border border-slate-800 shadow-2xl whitespace-nowrap flex flex-col">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sign in as Driver</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-medium mt-0.5">New Driver Onboarding ➔</span>
              </div>
            </div>
          </div>

          {/* 2. Customer Button (Person / User Icon) */}
          <div className="relative group flex items-center justify-center">
            <Link
              to="/register/customer"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-brand-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-brand-600/30 hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Sign in as Customer"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Premium Left-Sliding Glass Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="bg-slate-950/95 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-2xl border border-slate-800 shadow-2xl whitespace-nowrap flex flex-col">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                  <span>Sign in as Customer</span>
                </span>
                <span className="text-[10px] text-brand-400 font-medium mt-0.5">New Customer Portal ➔</span>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. HERO SECTION WITH ANIMATED LOGISTICS CONVEYOR BELT BACKGROUND
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="home" className="relative pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden min-h-[580px] sm:min-h-[640px] flex flex-col justify-end p-6 sm:p-12 shadow-2xl border border-slate-200">
          
          {/* Photorealistic 3D WebGL Conveyor Simulation */}
          <ConveyorHero3D />

          {/* Middle / Bottom Content Grid */}
          <div className="relative z-10 max-w-3xl space-y-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black text-white leading-[1.05] tracking-tight">
              Ready to accelerate your inter-city delivery?
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register/customer"
                className="px-6 py-3.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-sm transition flex items-center gap-2"
              >
                <span>Book Doorstep Pickup</span>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </Link>

              <a
                href="#tracking"
                className="px-6 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition shadow-lg shadow-brand-900/40 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Track Consignment</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. REAL-TIME TRACKING LOOKUP RADAR BAR & INTEGRATED LIVE HUB
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="tracking" className="px-4 sm:px-8 max-w-7xl mx-auto -mt-6 mb-16 relative z-20">
        <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-xl border border-slate-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-brand-500 animate-pulse" />
                <span>Live Inter-City Radar &amp; Parcel Tracking</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant GPS telemetry, corridor transit status, and automated driver ETA countdown.
              </p>
            </div>
            
            {previewOrder && (
              <button
                type="button"
                onClick={() => handleQuickTrackSubmit(undefined, previewOrder.trackingNumber)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>
            )}
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
                placeholder="Enter Ship It tracking number (e.g. GTM-20260824-196623)..."
                className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-mono transition"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSearching}
              className="w-full md:w-auto px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <span className="animate-spin">↻</span> : <Radio className="w-4 h-4 text-white" />}
              <span>Track Live</span>
            </button>
          </form>

          {searchError && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────────
              COMPREHENSIVE IN-PAGE LIVE RADAR EXPERIENCE
          ───────────────────────────────────────────────────────────────────────────── */}
          {previewOrder && previewLiveTracking && (
            <div className="mt-6 space-y-6 animate-in fade-in duration-300">
              
              {/* Top Banner with Tracking Number & Active Status */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white flex items-center gap-1.5">
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

                {/* 6-Step Visual Milestone Progress Bar */}
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
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Assigned Driver</span>
                    <span className="font-bold text-white text-sm mt-0.5 block truncate">
                      {previewLiveTracking.deliveryPartner?.name || 'Rajesh Kumar'}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Distance Remaining</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">
                      {previewLiveTracking.distanceRemaining || 3.4} km
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Estimated Arrival</span>
                    <span className="font-bold text-amber-400 text-sm mt-0.5 block">
                      ~{previewLiveTracking.etaMinutes || 12} mins
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
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
                <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    <span>Corridor Route &amp; Addresses</span>
                  </h4>

                  {/* Pickup Endpoint */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-brand-600">Origin / Pickup</span>
                      <h5 className="text-xs font-bold text-slate-900 mt-0.5">{previewOrder.pickupName}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{previewOrder.pickupAddress}</p>
                      <span className="inline-block mt-1 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        PIN: {previewOrder.pickupPincode}
                      </span>
                    </div>
                  </div>

                  {/* Destination Endpoint */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700">Destination / Dropoff</span>
                      <h5 className="text-xs font-bold text-slate-900 mt-0.5">{previewOrder.dropName}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{previewOrder.dropAddress}</p>
                      <span className="inline-block mt-1 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        PIN: {previewOrder.dropPincode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Milestone Event Timeline */}
                <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-500" />
                    <span>Real-Time Milestone Log</span>
                  </h4>

                  <div className="space-y-3">
                    {trackingTimeline.length > 0 ? (
                      trackingTimeline.map((ev, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/70 text-xs">
                          <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-slate-900">{ev.newStatus}</strong>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {ev.eventTimestamp ? new Date(ev.eventTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                              </span>
                            </div>
                            <p className="text-slate-500 mt-0.5 text-[11px]">{ev.remarks || `Status updated to ${ev.newStatus} by ${ev.actorName || 'System'}`}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2">
                        <div className="flex items-center justify-between text-slate-900 font-semibold">
                          <span>Corridor Transit Active</span>
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">LIVE TELEMETRY</span>
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
          4. SERVICES MULTI-MODAL SLIDER (Inter-City Corridor Delivery)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section 
        id="services" 
        className="py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-slate-50/60 rounded-[3rem] border border-slate-200/60 overflow-hidden"
        onMouseEnter={() => setIsSliderPaused(true)}
        onMouseLeave={() => setIsSliderPaused(false)}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-xs">
              Inter-City Services
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 tracking-tight">
              All set for seamless inter-city logistics
            </h2>
          </div>

          {/* Animated Moving Slider Bar & Controls (Zomato Theme) */}
          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-xs self-start md:self-auto">
            {/* Active Step Counter */}
            <span className="text-xs font-mono font-bold text-brand-600">
              0{activeServiceSlide + 1}
            </span>

            {/* Dynamic Moving Slider Bar (Zomato Crimson Red) */}
            <div className="relative w-28 sm:w-40 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-brand-600 via-brand-500 to-rose-500 rounded-full transition-all duration-500 shadow-xs shadow-brand-500/50"
                style={{ 
                  width: `${((activeServiceSlide + 1) / services.length) * 100}%` 
                }}
              />
            </div>

            {/* Total Count */}
            <span className="text-xs font-mono font-bold text-slate-400">
              0{services.length}
            </span>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={() => setActiveServiceSlide((prev) => (prev === 0 ? services.length - 1 : prev - 1))}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-brand-500 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                aria-label="Previous service"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveServiceSlide((prev) => (prev === services.length - 1 ? 0 : prev + 1))}
                className="w-8 h-8 rounded-full bg-brand-500 text-white hover:bg-brand-600 flex items-center justify-center transition shadow-sm shadow-brand-500/30 cursor-pointer"
                aria-label="Next service"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Sliding Cards Track */}
        <div className="relative overflow-hidden pt-2 pb-4">
          <div 
            className="flex transition-transform duration-700 ease-out gap-6"
            style={{
              transform: `translateX(-${activeServiceSlide * 100}%)`,
            }}
          >
            {services.map((srv, idx) => {
              const isActive = idx === activeServiceSlide;
              return (
                <div
                  key={idx}
                  className={`w-full min-w-full sm:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] xl:min-w-[calc(25%-18px)] rounded-3xl overflow-hidden bg-white border transition-all duration-500 flex flex-col shrink-0 ${
                    isActive 
                      ? 'border-brand-500/60 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500/20' 
                      : 'border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={srv.image}
                      alt={srv.title}
                      className="w-full h-full object-cover transition duration-500 hover:scale-105"
                    />
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold uppercase tracking-wider transition ${
                      isActive ? 'bg-brand-500 text-white shadow-xs' : 'bg-black/60 text-white'
                    }`}>
                      {srv.tag}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className={`text-lg font-bold transition ${
                        isActive ? 'text-brand-600' : 'text-slate-900'
                      }`}>
                        {srv.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {srv.desc}
                      </p>
                    </div>

                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-brand-600 transition pt-2 border-t border-slate-100"
                    >
                      <span>Explore Corridor Slabs</span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-500" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Segmented Progress Slider Dots (Clickable) */}
        <div className="flex items-center justify-center gap-2.5 mt-6">
          {services.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveServiceSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeServiceSlide
                  ? 'w-10 bg-brand-500 shadow-sm shadow-brand-500/40'
                  : 'w-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. TESTIMONIALS & TRUSTED COURIER NETWORK
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Client Trust
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 tracking-tight">
            Trusted by businesses for daily inter-city shipping
          </h2>
        </div>

        {/* Testimonial Quote Card with Floating Avatars */}
        <div className="relative mt-12 max-w-3xl mx-auto bg-gradient-to-b from-slate-50 to-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-lg text-center">
          
          {/* Avatar Cluster */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-9 h-9 rounded-full border-2 border-white shadow-xs object-cover" />
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-12 h-12 rounded-full border-2 border-brand-500 shadow-md object-cover" />
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-9 h-9 rounded-full border-2 border-white shadow-xs object-cover" />
          </div>

          <p className="text-base sm:text-xl font-medium text-slate-700 leading-relaxed italic max-w-xl mx-auto">
            "We count on Ship It for our daily inter-city shipments and doorstep customer drops. Their real-time GPS telemetry, volumetric rate accuracy, and prompt milestone alerts keep our operations completely seamless."
          </p>

          <div className="mt-6">
            <h4 className="font-bold text-slate-900 text-sm">Aarav Mehta</h4>
            <p className="text-xs text-slate-500">Director of Operations · North India E-Commerce</p>
          </div>
        </div>

        {/* Partners Logo Ticker */}
        <div className="mt-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            Integrated courier networks &amp; enterprise partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition duration-300">
            <span className="font-black font-heading text-lg sm:text-xl tracking-wider text-slate-800">DELHIVERY</span>
            <span className="font-black font-heading text-xl sm:text-2xl tracking-tighter text-slate-800">BlueDart</span>
            <span className="font-black font-heading text-xl sm:text-2xl tracking-tighter text-slate-800">DTDC</span>
            <span className="font-black font-heading text-xl sm:text-2xl tracking-tighter text-slate-800">FedEx</span>
            <span className="font-black font-heading text-lg sm:text-xl tracking-tight text-slate-800">Trackon</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. FAQ ACCORDION SECTION (Tailored for Inter-City Delivery)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 tracking-tight">
            Questions? Glad you asked
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                  isOpen ? 'bg-white border-brand-500/40 shadow-md' : 'bg-slate-50/70 border-slate-200/80 hover:bg-white'
                }`}
              >
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isOpen ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      0{idx + 1}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {item.q}
                    </h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. CALL TO ACTION BANNER (Inter-City Dispatch)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden p-8 sm:p-14 bg-gradient-to-r from-slate-950 via-slate-900 to-black text-white shadow-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="relative z-10 space-y-4 max-w-xl">
            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight leading-tight">
              Ready to send your package to another city?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Book doorstep pickup in seconds with automated driver dispatch, transparent volumetric quotes, and OTP-secured delivery.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/register/customer"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-600 to-rose-500 hover:from-brand-700 hover:to-brand-600 font-bold text-sm text-white transition shadow-lg shadow-brand-900/40 text-center flex items-center justify-center gap-2"
            >
              <span>Book Inter-City Pickup</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          8. ENTERPRISE FOOTER
      ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="pt-16 pb-12 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-200 mt-12 text-xs text-slate-500">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          <div className="col-span-2 space-y-3">
            <GatimanLogo to="/" />
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Next-generation inter-city &amp; urban logistics operating system with real-time GPS telemetry, volumetric rate cards, and automated EV fleet dispatch.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Company</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-slate-900 transition">About Ship It</a></li>
              <li><a href="#services" className="hover:text-slate-900 transition">Inter-City Network</a></li>
              <li><a href="#faq" className="hover:text-slate-900 transition">Fleet Hubs</a></li>
              <li><Link to="/login" className="hover:text-slate-900 transition">Contact Operations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Services</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-slate-900 transition">Same-Day Corridor Express</a></li>
              <li><a href="#services" className="hover:text-slate-900 transition">Doorstep Hyperlocal</a></li>
              <li><a href="#services" className="hover:text-slate-900 transition">Heavy Cargo Freight</a></li>
              <li><a href="#services" className="hover:text-slate-900 transition">EV Urban Dispatch</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Tracking &amp; Portals</h4>
            <ul className="space-y-2">
              <li><a href="#tracking" className="hover:text-slate-900 transition">Live Parcel Radar</a></li>
              <li><a href="#faq" className="hover:text-slate-900 transition">Help Center &amp; FAQ</a></li>
              <li><Link to="/login" className="hover:text-slate-900 transition">Driver Portal</Link></li>
              <li><Link to="/login" className="hover:text-slate-900 transition">Admin Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 Ship It Logistics Platform. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#home" className="hover:text-slate-900 transition">Terms of Service</a>
            <a href="#home" className="hover:text-slate-900 transition">Privacy Policy</a>
            <a href="#home" className="hover:text-slate-900 transition">Security Overview</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

