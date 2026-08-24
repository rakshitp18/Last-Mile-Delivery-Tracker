import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { registerSchema, RegisterFormData } from '../../schemas/authSchema';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, Building2, Truck, MapPin, Package, Bike, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine initial role from URL path or search query
  const isDriverPath = location.pathname === '/register/driver' || searchParams.get('role') === 'agent';
  const initialRole = isDriverPath ? 'DELIVERY_AGENT' : 'CUSTOMER';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: initialRole,
      customerType: 'B2C',
      vehicleType: 'EV_SCOOTER',
    },
  });

  useEffect(() => {
    if (location.pathname === '/register/driver' || searchParams.get('role') === 'agent') {
      setValue('role', 'DELIVERY_AGENT');
    } else if (location.pathname === '/register/customer' || searchParams.get('role') === 'customer') {
      setValue('role', 'CUSTOMER');
    }
  }, [location.pathname, searchParams, setValue]);

  const selectedRole = watch('role');
  const selectedCustomerType = watch('customerType');

  const handleRoleSelect = (role: 'CUSTOMER' | 'DELIVERY_AGENT') => {
    setValue('role', role);
    setSearchParams({ role: role === 'DELIVERY_AGENT' ? 'agent' : 'customer' });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await registerAuth(data);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'DELIVERY_AGENT') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Registration failed. Please verify the entered details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. TOP TAB SWITCHER (Customer vs Driver Partner)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleRoleSelect('CUSTOMER')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              selectedRole === 'CUSTOMER'
                ? 'bg-white text-orange-600 shadow-md border border-orange-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Send Parcel (Customer)</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('DELIVERY_AGENT')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              selectedRole === 'DELIVERY_AGENT'
                ? 'bg-white text-emerald-700 shadow-md border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Drive & Earn (Partner)</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. DYNAMIC HEADER
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900 sm:text-3xl">
          {selectedRole === 'CUSTOMER' ? 'Customer & Sender Registration' : 'Delivery Fleet Partner Onboarding'}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {selectedRole === 'CUSTOMER'
            ? 'Set up your account for instant doorstep pickup, volumetric pricing & live GPS parcel tracking.'
            : 'Register your vehicle, choose your service city, and start earning on every delivery.'}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. REGISTRATION FORM
      ───────────────────────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Basic Name Fields */}
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

        {/* ─────────────────────────────────────────────────────────────────────────────
            A. CUSTOMER-SPECIFIC FORM FIELDS
        ───────────────────────────────────────────────────────────────────────────── */}
        {selectedRole === 'CUSTOMER' && (
          <div className="space-y-4">
            
            {/* Customer Account Type (B2C vs B2B) */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Sender Account Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition ${
                    selectedCustomerType === 'B2C'
                      ? 'bg-white border-orange-500 text-orange-700 shadow-xs'
                      : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <input type="radio" value="B2C" {...register('customerType')} className="sr-only" />
                  <User className="w-4 h-4 text-orange-600" />
                  <span>Personal (B2C)</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition ${
                    selectedCustomerType === 'B2B'
                      ? 'bg-white border-orange-500 text-orange-700 shadow-xs'
                      : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <input type="radio" value="B2B" {...register('customerType')} className="sr-only" />
                  <Building2 className="w-4 h-4 text-orange-600" />
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
                      placeholder="Acme Enterprises Pvt Ltd"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">GSTIN (Optional)</label>
                    <input
                      type="text"
                      {...register('gstNumber')}
                      placeholder="07AAAAA0000A1Z5"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
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

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            B. DRIVER / FLEET PARTNER SPECIFIC FORM FIELDS
        ───────────────────────────────────────────────────────────────────────────── */}
        {selectedRole === 'DELIVERY_AGENT' && (
          <div className="space-y-4">
            
            {/* Vehicle Fleet Selection */}
            <div className="p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Select Fleet Vehicle Type</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'EV_SCOOTER', label: 'EV Electric Scooter', sub: 'Zero Emission' },
                  { id: 'BIKE', label: 'Motorbike / Scooter', sub: 'Hyperlocal Courier' },
                  { id: 'VAN', label: 'Cargo Delivery Van', sub: 'Inter-City Express' },
                  { id: 'TRUCK', label: 'Commercial Truck', sub: 'Heavy Freight Haul' },
                ].map((v) => (
                  <label
                    key={v.id}
                    className={`p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition flex flex-col ${
                      watch('vehicleType') === v.id
                        ? 'bg-white border-emerald-600 text-emerald-900 shadow-xs ring-1 ring-emerald-600/30'
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

            {/* Driver Identity Card */}
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

          </div>
        )}

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

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer ${
            selectedRole === 'CUSTOMER'
              ? 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 shadow-orange-500/20'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-600/20'
          }`}
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>
                {selectedRole === 'CUSTOMER'
                  ? 'Create Customer Account & Send Parcel'
                  : 'Join Delivery Fleet & Start Earning'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Customer Google OAuth Section */}
      {selectedRole === 'CUSTOMER' && (
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
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
          Log in
        </Link>
      </p>
    </div>
  );
};
