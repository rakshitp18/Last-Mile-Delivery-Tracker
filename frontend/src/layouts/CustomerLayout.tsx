import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { GatimanLogo } from '../components/common/GatimanLogo';
import {
  LayoutDashboard, PackagePlus, Package, CalendarClock, User, LogOut, Menu, X, Truck, RefreshCw,
} from 'lucide-react';
import { NotificationBell } from '../components/common/NotificationBell';
import { CompleteProfileModal } from '../components/profile/CompleteProfileModal';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const navigation = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Book Delivery', href: '/customer/orders/create', icon: PackagePlus },
    { name: 'My Orders', href: '/customer/orders', icon: Package },
    { name: 'Reschedule', href: '/customer/reschedule', icon: CalendarClock },
    { name: 'Profile', href: '/customer/profile', icon: User },
  ];

  const mobileNav = [
    { name: 'Home', href: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Book', href: '/customer/orders/create', icon: PackagePlus },
    { name: 'Orders', href: '/customer/orders', icon: Package },
    { name: 'Reschedule', href: '/customer/reschedule', icon: CalendarClock },
    { name: 'Profile', href: '/customer/profile', icon: User },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (href: string) => location.pathname === href || (href !== '/customer/dashboard' && location.pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <GatimanLogo to="/customer/dashboard" />
              <span className="hidden rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-700 sm:inline-block">
                Customer Portal
              </span>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Navbar Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition shadow-2xs cursor-pointer shrink-0"
              title="Refresh page data"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
            </button>

            <NotificationBell />

            <div className="hidden sm:flex items-center gap-2.5 border-l border-slate-200 pl-3">
              <Link to="/customer/profile" className="flex items-center gap-2.5 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-rose-500 text-xs font-black text-white shadow-xs group-hover:ring-2 ring-brand-400/30 transition shrink-0">
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="text-left hidden md:block max-w-[130px]">
                  <p className="truncate text-xs font-bold text-slate-800 group-hover:text-brand-600 transition leading-tight">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="truncate text-[10px] text-slate-400 font-medium leading-tight">{user?.email}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 space-y-1 lg:hidden">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/80'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/customer/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-rose-500 text-xs font-bold text-white">
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden z-30 bg-white border-t border-slate-200 shadow-lg pb-safe">
        <div className="flex items-center justify-around py-2">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition ${
                  active ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Profile Completion Onboarding Modal */}
      <CompleteProfileModal />
    </div>
  );
};
