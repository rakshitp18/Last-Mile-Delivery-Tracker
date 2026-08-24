import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, RegisterFormData } from '../../schemas/authSchema';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Phone, ArrowRight, AlertCircle, Truck, MapPin, ShieldCheck, Bike, Package } from 'lucide-react';

export const DriverRegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'DELIVERY_AGENT',
      vehicleType: 'EV_SCOOTER',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await registerAuth({
        ...data,
        role: 'DELIVERY_AGENT',
      });
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'DELIVERY_AGENT') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Driver registration failed. Please verify your vehicle details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-3">
          <Truck className="w-3.5 h-3.5" />
          <span>Delivery Fleet Partner Onboarding</span>
        </div>
        <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900 sm:text-3xl">
          Drive &amp; Earn with Ship It
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Register your vehicle, select your delivery zone city, and start earning on every completed parcel dispatch.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Driver Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Driver Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">First Name</label>
            <input
              type="text"
              {...register('firstName')}
              placeholder="Rahul"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
            {errors.firstName && <p className="mt-1 text-xs text-rose-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Last Name</label>
            <input
              type="text"
              {...register('lastName')}
              placeholder="Sharma"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
        </div>

        {/* Email & Mobile Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                {...register('email')}
                placeholder="driver@gmail.com"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Mobile Number (For Dispatch)</label>
            <div className="relative mt-1">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                {...register('phoneNumber')}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>
            {errors.phoneNumber && <p className="mt-1 text-xs text-rose-600">{errors.phoneNumber.message}</p>}
          </div>
        </div>

        {/* Fleet Vehicle Selection */}
        <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900">
            <Truck className="h-4 w-4 text-emerald-600" />
            <span>Select Your Delivery Fleet Vehicle</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'EV_SCOOTER', label: 'EV Electric Scooter', sub: 'Zero Emission Hyperlocal' },
              { id: 'BIKE', label: 'Motorbike / 2-Wheeler', sub: 'Standard Courier Dispatch' },
              { id: 'VAN', label: 'Cargo Delivery Van', sub: 'Inter-City Express Freight' },
              { id: 'TRUCK', label: 'Commercial Truck', sub: 'Heavy Freight Haul' },
            ].map((v) => (
              <label
                key={v.id}
                className={`p-3 rounded-xl border cursor-pointer text-xs font-bold transition flex flex-col ${
                  watch('vehicleType') === v.id
                    ? 'bg-white border-emerald-600 text-emerald-900 shadow-sm ring-2 ring-emerald-600/20'
                    : 'bg-white/80 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input type="radio" value={v.id} {...register('vehicleType')} className="sr-only" />
                <span>{v.label}</span>
                <span className="text-[10px] text-slate-400 font-normal mt-0.5">{v.sub}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Vehicle Registration No.</label>
              <input
                type="text"
                {...register('vehicleNumber')}
                placeholder="DL-01-AB-1234"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Operating City</label>
              <input
                type="text"
                {...register('city')}
                placeholder="Delhi NCR"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Driver License & Service Base */}
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Driver Verification & Service Base</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Driver License No.</label>
              <input
                type="text"
                {...register('address')}
                placeholder="DL-98202612345"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Base Pincode</label>
              <input
                type="text"
                maxLength={6}
                {...register('pinCode')}
                placeholder="110001"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Create Secure Password</label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-600/20"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Join Delivery Fleet & Start Earning</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Customer Portal Link */}
      <div className="mt-6 pt-5 border-t border-slate-200 text-center space-y-2">
        <p className="text-xs text-slate-500">
          Looking to send a parcel instead?{' '}
          <Link to="/register/customer" className="font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            <span>Send Parcel as Customer</span>
          </Link>
        </p>

        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800">
            Log in
          </Link>
        </p>
      </div>

    </div>
  );
};
