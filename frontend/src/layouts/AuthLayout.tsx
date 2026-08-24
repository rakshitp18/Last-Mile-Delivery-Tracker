import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Gauge, Radio, Zap } from 'lucide-react';
import { GatimanLogo } from '../components/common/GatimanLogo';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. LEFT HERO SIDEBAR (Photorealistic Twilight Hub)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div 
        className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex overflow-hidden bg-cover bg-center border-r border-slate-800"
        style={{ backgroundImage: `url('/images/auth_logistics_hub.jpg')` }}
      >
        {/* Dark Film Grade Backdrop Overlays with High Vibrancy */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/70" />
        
        {/* Ambient Glows */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />

        {/* Brand Header with Crisp White Logo */}
        <div className="relative z-10 space-y-3">
          <div className="inline-block bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-xl">
            <GatimanLogo to="/" textColor="text-white" />
          </div>

          <p className="text-sm text-slate-200 font-medium max-w-md leading-relaxed">
            Next-generation logistics operating system with real-time GPS telemetry, volumetric rate cards, and automated EV fleet dispatch.
          </p>
        </div>

        {/* Value Prop Highlights (Frosted Glass Cards) */}
        <div className="relative z-10 space-y-4 my-auto py-8">
          
          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-brand-500/40 transition">
            <div className="rounded-xl bg-brand-500/20 p-2.5 text-brand-400 border border-brand-500/30 shrink-0">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Volumetric Rate Engine</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Automated formula billing with transparent rate slabs for parcel and cargo shipping.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-brand-500/40 transition">
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Sub-Second GPS Radar</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Live driver telemetry, route corridor coordinates, and instant countdown ETAs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-brand-500/40 transition">
            <div className="rounded-xl bg-rose-500/20 p-2.5 text-rose-400 border border-rose-500/30 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">OTP-Secured Handover</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Immutable audit timeline and secure 4-digit verification for safe doorstep deliveries.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10">
          <span>© 2026 Ship It Logistics Platform</span>
          <span className="flex items-center gap-1.5 font-bold text-brand-400">
            <Zap className="h-3.5 w-3.5" /> Express Corridor Transit
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. RIGHT AUTH CONTENT AREA
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex w-full flex-col justify-between px-6 py-8 sm:px-12 lg:w-1/2 lg:px-16 min-h-screen">
        
        {/* Top Mobile / Desktop Header with Back Button */}
        <div className="flex items-center justify-between pb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50 transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-brand-600" />
            <span>Back to Home</span>
          </Link>

          <div className="lg:hidden">
            <GatimanLogo to="/" />
          </div>
        </div>

        {/* Form Container */}
        <div className="my-auto py-6">
          <Outlet />
        </div>

        {/* Right Footer */}
        <div className="pt-4 text-center text-xs text-slate-400">
          Ship It Logistics Platform · <Link to="/#tracking" className="text-brand-600 hover:underline font-semibold">Track Live Shipment</Link>
        </div>
      </div>

    </div>
  );
};

