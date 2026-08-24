import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { trackingApi } from '../../api/trackingApi';
import { useLiveTracking } from '../../hooks/useLiveTracking';
import { LiveTrackingStatusCard } from '../../components/tracking/LiveTrackingStatusCard';
import { RazorpayCheckoutModal } from '../../components/payment/RazorpayCheckoutModal';
import { Order, TrackingEvent, OrderStatus } from '../../types';
import {
  Search, Truck, MapPin, Clock, CheckCircle2, AlertCircle,
  ArrowLeft, RefreshCw, Phone, CreditCard, Lock, Navigation, Package,
  Users, UserCheck, XCircle, RotateCcw,
} from 'lucide-react';

const steps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
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

const getStatusColor = (status?: OrderStatus) => {
  switch (status) {
    case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'OUT_FOR_DELIVERY': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'IN_TRANSIT': case 'PICKED_UP': case 'ASSIGNED': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'FAILED': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'RESCHEDULED': return 'bg-purple-50 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const PublicTrackingPage: React.FC = () => {
  const { trackingNumber: routeTrackingNumber } = useParams<{ trackingNumber?: string }>();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState(routeTrackingNumber || '');
  const [activeTrackingNumber, setActiveTrackingNumber] = useState<string | null>(routeTrackingNumber || null);
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: liveTracking, connectionState, refetch: refetchLive } = useLiveTracking(order?.id);

  const sampleTrackingNumbers = ['GTM-20260820-875171', 'GTM-20260820-000001', 'GTM-20260820-000002'];

  const fetchTrackingDetails = async (num: string) => {
    const cleanNum = num.trim();
    if (!cleanNum) return;
    setIsLoading(true); setErrorMsg(null);
    try {
      const fetchedOrder = await orderApi.trackByNumber(cleanNum);
      setOrder(fetchedOrder);
      setActiveTrackingNumber(cleanNum);
      try {
        const events = await orderApi.getTrackingTimeline(fetchedOrder.id);
        setTrackingEvents(events);
      } catch { setTrackingEvents([]); }
    } catch (err: any) {
      setOrder(null); setTrackingEvents([]);
      setErrorMsg(err.response?.data?.message || `No shipment found with tracking number "${cleanNum}". Please verify and try again.`);
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (routeTrackingNumber) {
      setInputVal(routeTrackingNumber);
      fetchTrackingDetails(routeTrackingNumber);
    } else {
      fetchTrackingDetails('GTM-20260820-875171');
    }
  }, [routeTrackingNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) navigate(`/track/${inputVal.trim()}`);
  };

  const currentStepIdx = getStepIndex(order?.status);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="h-5 w-5 text-brand-500" />
                <h1 className="text-xl font-black text-slate-900">Live Package Tracker</h1>
              </div>
              <p className="text-sm text-slate-500">
                Track any shipment across the Ship It logistics network with real-time GPS telemetry.
              </p>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Enter Tracking ID..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15 transition font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-brand-500/20"
              >
                Track
              </button>
            </form>
          </div>

          {/* Sample IDs */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Sample IDs:</span>
            {sampleTrackingNumbers.map((num) => (
              <button
                key={num}
                onClick={() => { setInputVal(num); navigate(`/track/${num}`); }}
                className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition cursor-pointer ${
                  activeTrackingNumber === num
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error */}
        {errorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-rose-800">Shipment Lookup Notice</h3>
              <p className="mt-1 text-sm text-rose-600">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm font-medium text-slate-500">Querying live telemetry...</p>
          </div>
        )}

        {/* Main content */}
        {!isLoading && order && (
          <div className="space-y-6">
            {/* Order summary header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-lg font-black text-indigo-600">{order.trackingNumber}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  {order.routeType && (
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {order.routeType}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Booked {new Date(order.createdAt).toLocaleString()} · {order.customerType} · {order.paymentType}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Email Alerts Active</span>
                </div>

                <button
                  onClick={() => { fetchTrackingDetails(order.trackingNumber); refetchLive(); }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Real-Time Live Telemetry Status (Map Removed) */}
            {liveTracking && (
              <div className="w-full">
                <LiveTrackingStatusCard trackingData={liveTracking} connectionState={connectionState} />
              </div>
            )}

            {/* Progress stepper */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Delivery Progress</h3>

              {/* Desktop horizontal stepper */}
              <div className="hidden sm:flex items-center justify-between relative">
                <div className="absolute left-0 top-5 h-0.5 w-full bg-slate-100" />
                <div
                  className="absolute left-0 top-5 h-0.5 bg-indigo-500 transition-all duration-700"
                  style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                />
                {steps.map((step, idx) => {
                  const isCompleted = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.status} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isCompleted ? 'border-indigo-500 bg-indigo-600 text-white shadow-md' :
                        isCurrent ? 'border-indigo-500 bg-white text-indigo-600 ring-4 ring-indigo-100 shadow-md' :
                        'border-slate-200 bg-white text-slate-400'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-4 w-4" />}
                      </div>
                      <span className={`text-xs font-medium text-center max-w-[70px] leading-tight ${
                        isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile vertical stepper */}
              <div className="sm:hidden space-y-3">
                {steps.map((step, idx) => {
                  const isCompleted = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.status} className={`flex items-center gap-3 rounded-xl p-3 ${
                      isCurrent ? 'bg-indigo-50 border border-indigo-200' : ''
                    }`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isCompleted ? 'bg-indigo-600 text-white' :
                        isCurrent ? 'bg-white border-2 border-indigo-500 text-indigo-600' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className="h-3.5 w-3.5" />}
                      </div>
                      <span className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Route */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Route &amp; Addresses</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Origin</p>
                      <p className="text-sm font-bold text-slate-900">{order.pickupName}</p>
                      <p className="text-sm text-slate-500">{order.pickupAddress}</p>
                      <p className="text-xs text-slate-400 font-mono">PIN: {order.pickupPincode} {order.pickupZoneName && `(${order.pickupZoneName})`}</p>
                    </div>
                  </div>
                  <div className="border-l-2 border-dashed border-slate-200 ml-4 h-4" />
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drop Destination</p>
                      <p className="text-sm font-bold text-slate-900">{order.dropName}</p>
                      <p className="text-sm text-slate-500">{order.dropAddress}</p>
                      <p className="text-xs text-slate-400 font-mono">PIN: {order.dropPincode} {order.dropZoneName && `(${order.dropZoneName})`}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Billing &amp; Payment</h3>
                  {order.paymentType === 'PREPAID' ? (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    }`}>
                      <Lock className="h-3 w-3" />
                      {order.paymentStatus === 'PAID' ? 'PAID (Razorpay)' : 'PAYMENT PENDING'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      Cash on Delivery
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Actual Weight:</span>
                    <span className="font-semibold text-slate-900">{order.actualWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Billable Weight:</span>
                    <span className="font-bold text-indigo-600">{order.billableWeightKg} kg</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 flex justify-between text-slate-600">
                    <span>Delivery Charge:</span>
                    <span className="font-semibold text-slate-900">₹{Number(order.baseCharge).toFixed(2)}</span>
                  </div>
                  {Number(order.codSurcharge) > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>COD Surcharge:</span>
                      <span className="font-semibold">₹{Number(order.codSurcharge).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-2.5 flex justify-between">
                    <span className="font-bold text-slate-900">Total Amount</span>
                    <span className="font-black text-indigo-600 text-base">₹{Number(order.totalCharge).toFixed(2)}</span>
                  </div>

                  {order.paymentType === 'PREPAID' && order.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow hover:bg-indigo-700 transition cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4" />
                      Pay ₹{Number(order.totalCharge).toFixed(2)} with Razorpay
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Timeline */}
            {trackingEvents.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Delivery Audit Timeline</h3>
                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {[...trackingEvents].sort((a, b) => new Date(b.eventTimestamp).getTime() - new Date(a.eventTimestamp).getTime()).map((event, idx) => (
                    <div key={event.id} className="relative">
                      <div className={`absolute -left-[25px] top-1.5 h-3 w-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">{event.newStatus.replace('_', ' ')}</span>
                          <p className="text-sm font-semibold text-slate-900">{event.remarks || 'Shipment update'}</p>
                          <p className="text-xs text-slate-500">by {event.actorName} ({event.actorRole})</p>
                        </div>
                        <p className="text-xs text-slate-400 whitespace-nowrap">{new Date(event.eventTimestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && order && (
        <RazorpayCheckoutModal
          orderId={order.id}
          onSuccess={() => { setShowPaymentModal(false); fetchTrackingDetails(order.trackingNumber); refetchLive(); }}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};
