import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, RegisterFormData } from '../../schemas/authSchema';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, Building2, MapPin, Package, Truck } from 'lucide-react';

export const CustomerRegisterPage: React.FC = () => {
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
      role: 'CUSTOMER',
      customerType: 'B2C',
    },
  });

  const selectedCustomerType = watch('customerType');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await registerAuth({
        ...data,
        role: 'CUSTOMER',
      });
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Registration failed. Please verify your details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-[11px] font-bold uppercase tracking-wider text-brand-700 mb-3">
          <Package className="w-3.5 h-3.5" />
          <span>Customer &amp; Business Portal</span>
        </div>
        <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900 sm:text-3xl">
          Send Parcels with Ship It
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Create your account for instant doorstep pickup, volumetric rate quotes, and real-time GPS parcel tracking.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Customer Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Customer Account Type (B2C vs B2B) */}
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Sender Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition ${
                selectedCustomerType === 'B2C'
                  ? 'bg-white border-brand-500 text-brand-700 shadow-xs'
                  : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <input type="radio" value="B2C" {...register('customerType')} className="sr-only" />
              <User className="w-4 h-4 text-brand-500" />
              <span>Individual / B2C</span>
            </label>

            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition ${
                selectedCustomerType === 'B2B'
                  ? 'bg-white border-brand-500 text-brand-700 shadow-xs'
                  : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <input type="radio" value="B2B" {...register('customerType')} className="sr-only" />
              <Building2 className="w-4 h-4 text-brand-500" />
              <span>Business / B2B</span>
            </label>
          </div>

          {selectedCustomerType === 'B2B' && (
            <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  {...register('companyName')}
                  placeholder="Acme Logistics Pvt Ltd"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">GSTIN (Optional)</label>
                <input
                  type="text"
                  {...register('gstNumber')}
                  placeholder="07AAAAA0000A1Z5"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none font-mono uppercase"
                />
              </div>
            </div>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">First Name</label>
            <input
              type="text"
              {...register('firstName')}
              placeholder="Rahul"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            {errors.firstName && <p className="mt-1 text-xs text-rose-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Last Name</label>
            <input
              type="text"
              {...register('lastName')}
              placeholder="Sharma"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                {...register('email')}
                placeholder="rahul@gmail.com"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-xs focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Mobile Number</label>
            <div className="relative mt-1">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                {...register('phoneNumber')}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-xs focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            {errors.phoneNumber && <p className="mt-1 text-xs text-rose-600">{errors.phoneNumber.message}</p>}
          </div>
        </div>

        {/* Pickup Location Info */}
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            <MapPin className="h-4 w-4 text-orange-600" />
            <span>Primary Pickup & Drop Address</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Street Address / Landmark</label>
            <input
              type="text"
              {...register('address')}
              placeholder="Plot 42, Sector 18, Commercial Hub"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">City</label>
              <input
                type="text"
                {...register('city')}
                placeholder="New Delhi"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">State</label>
              <input
                type="text"
                {...register('state')}
                placeholder="Delhi"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Postal PIN</label>
              <input
                type="text"
                maxLength={6}
                {...register('pinCode')}
                placeholder="110016"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none font-mono"
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
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-xs focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 shadow-orange-500/20"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Create Customer Account & Send Parcel</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Google OAuth Section */}
      <div className="mt-6">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-3 text-slate-400 font-bold tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleSignInButton
          text="Sign up with Google"
          defaultCustomerType={selectedCustomerType || 'B2C'}
          onError={(msg) => setErrorMessage(msg)}
        />
      </div>

      {/* Switch to Driver Portal Link */}
      <div className="mt-6 pt-5 border-t border-slate-200 text-center space-y-2">
        <p className="text-xs text-slate-500">
          Want to deliver parcels with your vehicle?{' '}
          <Link to="/register/driver" className="font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            <span>Join as Driver Partner</span>
          </Link>
        </p>

        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700">
            Log in
          </Link>
        </p>
      </div>

    </div>
  );
};
