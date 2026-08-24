import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, LoginFormData } from '../../schemas/authSchema';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Mail, Lock, ArrowRight, AlertCircle, Shield, Truck, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'customer@gmail.com',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await login(data);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'DELIVERY_AGENT') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Invalid email or password. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoRole = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900 sm:text-3xl">
          Welcome to Ship It
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
          Enter your credentials to access your delivery and logistics portal
        </p>
      </div>

      {/* Quick Persona Switcher (Admin, Agent, Customer) */}
      <div className="mb-6 rounded-2xl border border-brand-200/60 bg-gradient-to-b from-brand-50/60 to-rose-50/30 p-3.5 shadow-xs">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5">
          <span>⚡ Demo Quick Logins</span>
          <span className="text-[10px] font-normal text-brand-700">(Click to pre-fill)</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDemoRole('customer@gmail.com')}
            className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 shadow-xs transition hover:border-brand-500 hover:text-brand-600 cursor-pointer"
          >
            <User className="h-4 w-4 text-brand-600" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoRole('agent@gmail.com')}
            className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 shadow-xs transition hover:border-emerald-500 hover:text-emerald-700 cursor-pointer"
          >
            <Truck className="h-4 w-4 text-emerald-600" />
            <span>Driver</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoRole('admin@gmail.com')}
            className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 shadow-xs transition hover:border-slate-800 hover:text-slate-900 cursor-pointer"
          >
            <Shield className="h-4 w-4 text-slate-800" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700">Email address</label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              {...register('email')}
              placeholder="customer@gmail.com"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <a href="#forgot" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Forgot password?
            </a>
          </div>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-rose-500 hover:from-brand-700 hover:to-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/20 transition disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Log in to Ship It</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Google OAuth Login Section */}
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
          text="Continue with Google"
          defaultCustomerType="B2C"
          onError={(msg) => setErrorMessage(msg)}
        />
      </div>

      <div className="mt-8 pt-5 border-t border-slate-200 text-center space-y-2 text-xs text-slate-600">
        <p>
          Don't have an account?{' '}
          <Link to="/register/customer" className="font-bold text-brand-600 hover:text-brand-700">
            Register as Customer
          </Link>
          {' · '}
          <Link to="/register/driver" className="font-bold text-emerald-700 hover:text-emerald-800">
            Join as Driver
          </Link>
        </p>
      </div>
    </div>
  );
};
