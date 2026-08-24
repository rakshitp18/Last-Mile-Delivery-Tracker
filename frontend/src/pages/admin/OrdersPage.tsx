import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders, useOrderMutations } from '../../hooks/useOrders';
import { useAgents } from '../../hooks/useAgents';
import { SmoothTab } from '../../components/common/SmoothTab';
import {
  Package,
  Search,
  Filter,
  Truck,
  Car,
  Bike,
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  RefreshCw,
  Clock,
  ArrowRight,
  User,
  ShieldCheck,
  CreditCard,
  Banknote,
  Send,
  Plus,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { AdminCreateOrderModal } from '../../components/orders/AdminCreateOrderModal';

export const AdminOrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: orders = [], isLoading, refetch } = useOrders();
  const { data: agents = [] } = useAgents();
  const { autoAssign, manualAssign } = useOrderMutations();

  const [selectedOrderForManual, setSelectedOrderForManual] = useState<Order | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number | ''>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const getVehicleMeta = (weightKg: number = 0) => {
    if (weightKg <= 5) {
      return {
        label: 'Two-Wheeler Express',
        capacity: '≤ 5 kg',
        Icon: Zap,
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        iconColor: 'text-emerald-600',
      };
    } else if (weightKg <= 25) {
      return {
        label: 'Four-Wheeler Van',
        capacity: '5 – 25 kg',
        Icon: Car,
        badge: 'bg-blue-50 text-blue-800 border-blue-200',
        iconColor: 'text-blue-600',
      };
    } else {
      return {
        label: 'Heavy Cargo Freight',
        capacity: '> 25 kg',
        Icon: Truck,
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        iconColor: 'text-amber-600',
      };
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return {
          label: 'Delivered',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'OUT_FOR_DELIVERY':
        return {
          label: 'Out for Delivery',
          classes: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-500 animate-pulse',
        };
      case 'IN_TRANSIT':
        return {
          label: 'In Transit',
          classes: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'PICKED_UP':
        return {
          label: 'Picked Up',
          classes: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          dot: 'bg-cyan-500',
        };
      case 'ASSIGNED':
        return {
          label: 'Driver Assigned',
          classes: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
        };
      case 'CREATED':
        return {
          label: 'Pending Dispatch',
          classes: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'FAILED':
      case 'CANCELLED':
        return {
          label: status === 'FAILED' ? 'Delivery Failed' : 'Cancelled',
          classes: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'RESCHEDULED':
        return {
          label: 'Rescheduled',
          classes: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
        };
      default:
        return {
          label: status,
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const getRouteBadge = (routeType?: string) => {
    switch (routeType) {
      case 'INTER_STATE':
        return { label: 'Inter-State', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'INTER_ZONE':
      case 'INTER_CITY':
        return { label: 'Inter-City', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'INTRA_ZONE':
      case 'INTRA_CITY':
      default:
        return { label: 'Intra-City', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.dropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.pickupPincode.includes(searchTerm) ||
      o.dropPincode.includes(searchTerm);

    const matchesStatus =
      statusTab === 'ALL' ||
      (statusTab === 'PENDING' && o.status === 'CREATED') ||
      (statusTab === 'IN_TRANSIT' && (o.status === 'IN_TRANSIT' || o.status === 'OUT_FOR_DELIVERY' || o.status === 'PICKED_UP' || o.status === 'ASSIGNED')) ||
      (statusTab === 'DELIVERED' && o.status === 'DELIVERED') ||
      (statusTab === 'EXCEPTIONS' && (o.status === 'FAILED' || o.status === 'RESCHEDULED' || o.status === 'CANCELLED'));

    const matchesRoute =
      routeFilter === 'ALL' ||
      (routeFilter === 'INTRA_ZONE' && (o.routeType === 'INTRA_ZONE' || o.routeType === 'INTRA_CITY')) ||
      (routeFilter === 'INTER_ZONE' && (o.routeType === 'INTER_ZONE' || o.routeType === 'INTER_CITY')) ||
      (routeFilter === 'INTER_STATE' && o.routeType === 'INTER_STATE');

    return matchesSearch && matchesStatus && matchesRoute;
  });

  const pendingCount = orders.filter((o) => o.status === 'CREATED').length;
  const inTransitCount = orders.filter((o) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'ASSIGNED'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const exceptionsCount = orders.filter((o) => ['FAILED', 'RESCHEDULED', 'CANCELLED'].includes(o.status)).length;

  const handleAutoAssign = async (orderId: number) => {
    try {
      await autoAssign.mutateAsync(orderId);
      setSuccessToast(`Auto-assigned order #${orderId} to nearest eligible driver.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Auto-assignment failed');
    }
  };

  const handleManualAssignConfirm = async () => {
    if (!selectedOrderForManual || !selectedAgentId) return;
    try {
      await manualAssign.mutateAsync({
        id: selectedOrderForManual.id,
        agentId: Number(selectedAgentId),
      });
      setSuccessToast(`Dispatched order #${selectedOrderForManual.id} manually.`);
      setSelectedOrderForManual(null);
      setSelectedAgentId('');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Manual assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Telemetry Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Package className="h-6 w-6 text-orange-600" />
            Dispatch & Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Intelligent vehicle matching, multi-tier routing (Local, Inter-Zone, Inter-State), and live driver assignment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-orange-700 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Book Customer Dispatch
          </button>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-orange-600" /> Refresh Dispatches
          </button>
        </div>
      </div>

      {successToast && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800 text-xs font-semibold shadow-2xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2. Fast Status Tabs + Search + Route Filter */}
      <div className="space-y-3">
        {/* Status Stage Tabs with SmoothTab spring red theme */}
        <div className="border-b border-slate-200/80 pb-2 overflow-x-auto">
          <SmoothTab
            selectedTabId={statusTab}
            onChange={(tabId) => setStatusTab(tabId)}
            activeColor="bg-gradient-to-r from-red-600 via-rose-600 to-brand-600 shadow-md shadow-brand-600/30"
            className="w-full sm:w-auto inline-flex bg-white/90"
            items={[
              { id: 'ALL', title: 'All Orders', count: orders.length },
              { id: 'PENDING', title: 'Pending Dispatch', count: pendingCount },
              { id: 'IN_TRANSIT', title: 'In Transit', count: inTransitCount },
              { id: 'DELIVERED', title: 'Delivered', count: deliveredCount },
              { id: 'EXCEPTIONS', title: 'Exceptions', count: exceptionsCount },
            ]}
          />
        </div>

        {/* Search & Route Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tracking #, customer, recipient, or PIN..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-orange-600 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Routes (Local & Regional)</option>
              <option value="INTRA_ZONE">Intra-City (Local)</option>
              <option value="INTER_ZONE">Inter-City (Same State)</option>
              <option value="INTER_STATE">Inter-State (Cross-Boundary)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Orders Dispatch Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs font-semibold text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-orange-600 mb-2" />
            Loading parcel dispatches...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white">
            <Package className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No orders match criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try selecting a different filter tab or search keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Tracking #</th>
                  <th className="px-5 py-3.5">Customer & Billing</th>
                  <th className="px-5 py-3.5">Route & Hub</th>
                  <th className="px-5 py-3.5">Weight & Tier</th>
                  <th className="px-5 py-3.5">Assigned Partner</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const vehicleReq = getVehicleMeta(order.billableWeightKg);
                  const { Icon: VehicleIcon } = vehicleReq;
                  const routeBadge = getRouteBadge(order.routeType);
                  const statusBadge = getStatusBadge(order.status);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      {/* Tracking # */}
                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-orange-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                        >
                          {order.trackingNumber}
                        </Link>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-medium">{order.customerType || 'B2C'}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                            {order.paymentType === 'COD' ? <Banknote className="h-3 w-3 text-emerald-600" /> : <CreditCard className="h-3 w-3 text-orange-600" />}
                            ₹{Number(order.totalCharge).toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Route & Hub */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${routeBadge.bg}`}>
                            {routeBadge.label}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-600">
                          {order.pickupPincode} <span className="text-slate-400">→</span> {order.dropPincode}
                        </div>
                      </td>

                      {/* Weight & Required Vehicle Tier */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{order.billableWeightKg} kg</div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${vehicleReq.badge}`}>
                            <VehicleIcon className={`h-3 w-3 ${vehicleReq.iconColor}`} />
                            <span>{vehicleReq.label}</span>
                          </span>
                        </div>
                      </td>

                      {/* Driver Partner */}
                      <td className="px-5 py-4">
                        {order.assignedAgentName ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 border border-orange-100 text-[10px] font-bold text-orange-700 uppercase">
                              {order.assignedAgentName.slice(0, 2)}
                            </div>
                            <span className="font-bold text-slate-800">{order.assignedAgentName}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            <Clock className="h-3 w-3" /> Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${statusBadge.classes}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === 'CREATED' && (
                            <>
                              <button
                                onClick={() => handleAutoAssign(order.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-orange-500 transition cursor-pointer"
                                title="Smart GPS Proximity Auto-Dispatch"
                              >
                                <Zap className="h-3 w-3" /> Auto
                              </button>
                              <button
                                onClick={() => setSelectedOrderForManual(order)}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                              >
                                Assign
                              </button>
                            </>
                          )}
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            title="Inspect Order Details & Timeline"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="h-3 w-3 text-slate-400" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Manual Dispatch Modal with Vehicle Matching */}
      {selectedOrderForManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Dispatch Parcel #{selectedOrderForManual.trackingNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Weight: <strong className="text-slate-800">{selectedOrderForManual.billableWeightKg} kg</strong> · Vehicle Tier: <strong className="text-orange-600">{getVehicleMeta(selectedOrderForManual.billableWeightKg).label}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForManual(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Select an active driver partner registered in{' '}
                <strong className="text-slate-900">{selectedOrderForManual.pickupZoneName || 'Delhi NCR Hub'}</strong> ({selectedOrderForManual.pickupPincode}).
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Available Fleet Drivers
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-orange-600 focus:bg-white focus:outline-none"
                >
                  <option value="">-- Choose active delivery driver --</option>
                  {agents.map((agent) => {
                    const vehicleLabel = agent.vehicleType === 'TEMPO' || agent.vehicleType === 'TRUCK'
                      ? 'Heavy Freight Cargo'
                      : agent.vehicleType === 'CAR' || agent.vehicleType === 'VAN'
                      ? 'Four-Wheeler Van'
                      : 'Two-Wheeler Express';

                    return (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({vehicleLabel} · {agent.vehicleNumber}) — {agent.currentActiveOrders}/{agent.maxActiveOrders} Active
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setSelectedOrderForManual(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleManualAssignConfirm}
                disabled={!selectedAgentId}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 font-bold text-white shadow-sm hover:bg-orange-500 disabled:opacity-50 transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Admin Create Dispatch On Behalf of Customer Modal */}
      <AdminCreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onOrderCreated={(trackingNum) => {
          setSuccessToast(`Dispatch #${trackingNum} successfully booked & auto-assigned on behalf of customer!`);
          refetch();
          setTimeout(() => setSuccessToast(null), 5000);
        }}
      />
    </div>
  );
};
