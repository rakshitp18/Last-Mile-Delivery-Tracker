import React, { useState } from 'react';
import { useAgents } from '../../hooks/useAgents';
import {
  Truck,
  Car,
  Bike,
  Zap,
  ShieldCheck,
  Phone,
  MapPin,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  RefreshCw,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminAgentsPage: React.FC = () => {
  const { data: agents = [], isLoading, refetch } = useAgents();
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const getVehicleMeta = (type: string) => {
    switch (type) {
      case 'TEMPO':
      case 'TRUCK':
        return {
          label: type === 'TEMPO' ? 'Commercial Tempo' : 'Heavy Cargo Truck',
          tier: 'HEAVY',
          capacity: '150 – 500 kg',
          Icon: Truck,
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          iconColor: 'text-amber-600',
        };
      case 'CAR':
      case 'VAN':
        return {
          label: type === 'CAR' ? 'Four-Wheeler Van' : 'Cargo Van',
          tier: 'MID',
          capacity: 'Up to 25 kg',
          Icon: Car,
          badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
          iconColor: 'text-blue-600',
        };
      case 'EV_SCOOTER':
      default:
        return {
          label: type === 'EV_SCOOTER' ? 'Electric Two-Wheeler' : 'Motorbike Express',
          tier: 'LIGHT',
          capacity: 'Up to 5 kg',
          Icon: type === 'EV_SCOOTER' ? Zap : Bike,
          badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          iconColor: 'text-emerald-600',
        };
    }
  };

  const filteredAgents = agents.filter((a) => {
    const meta = getVehicleMeta(a.vehicleType);
    const matchesVehicle =
      vehicleFilter === 'ALL' ||
      (vehicleFilter === 'LIGHT' && meta.tier === 'LIGHT') ||
      (vehicleFilter === 'MID' && meta.tier === 'MID') ||
      (vehicleFilter === 'HEAVY' && meta.tier === 'HEAVY');

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ONLINE' && a.isAvailable) ||
      (statusFilter === 'OFFLINE' && !a.isAvailable);

    const matchesSearch =
      searchQuery.trim() === '' ||
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedZoneName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesVehicle && matchesStatus && matchesSearch;
  });

  const totalDrivers = agents.length;
  const onlineDrivers = agents.filter((a) => a.isAvailable).length;
  const totalActiveTasks = agents.reduce((acc, a) => acc + (a.currentActiveOrders || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Truck className="h-6 w-6 text-orange-600" />
            Fleet & Driver Partners
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-tier dispatch network, vehicle telemetry, payload capacity, and load quotas
          </p>
        </div>

        {/* Quick Fleet KPI Badges */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-2xs text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Fleet</span>
              <span className="font-bold text-slate-900">{totalDrivers} Drivers</span>
            </div>
            <div className="h-7 w-[1px] bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">On Duty</span>
              <span className="font-bold text-emerald-600">{onlineDrivers} Active</span>
            </div>
            <div className="h-7 w-[1px] bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Load</span>
              <span className="font-bold text-orange-600">{totalActiveTasks} Tasks</span>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-orange-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Refresh Fleet Status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Professional Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by driver, plate #, or hub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Tier Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Fleet' },
            { id: 'LIGHT', label: 'Two-Wheeler (≤5kg)' },
            { id: 'MID', label: 'Car / Van (≤25kg)' },
            { id: 'HEAVY', label: 'Tempo / Truck (>25kg)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVehicleFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                vehicleFilter === tab.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown & Grid/List Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-orange-600 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ONLINE">Active Online</option>
            <option value="OFFLINE">Offline</option>
          </select>

          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Fleet Cards / Table Rendering */}
      {isLoading ? (
        <div className="p-16 text-center text-xs font-semibold text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-orange-600 mb-2" />
          Synchronizing fleet telematics...
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Truck className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No driver partners match the criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the vehicle tier or status filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => {
            const meta = getVehicleMeta(agent.vehicleType);
            const { Icon } = meta;
            const currentActive = agent.currentActiveOrders || 0;
            const maxOrders = agent.maxActiveOrders || 5;
            const loadPercent = Math.min(100, Math.round((currentActive / maxOrders) * 100));

            return (
              <div
                key={agent.id}
                className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 space-y-4"
              >
                {/* Driver Top Banner */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-sm font-bold text-white shadow-xs">
                        {agent.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          agent.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">{agent.name}</h3>
                      <p className="text-[11px] text-slate-500 font-mono lowercase">
                        {agent.email ? agent.email.toLowerCase() : 'agent@shipit.in'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                      agent.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${agent.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {agent.isAvailable ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>

                {/* Specs Box */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2.5 text-xs">
                  {/* Vehicle Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Icon className={`h-3.5 w-3.5 ${meta.iconColor}`} />
                      <span>{meta.label}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                      {agent.vehicleNumber || 'DL-01-XX-0000'}
                    </span>
                  </div>

                  {/* Hub Zone Row */}
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>Primary Hub</span>
                    </div>
                    <span className="font-semibold text-slate-800">
                      {agent.assignedZoneName || 'Delhi NCR'}
                    </span>
                  </div>

                  {/* Payload Row */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Payload Capacity</span>
                    <span className="font-semibold text-slate-800">{meta.capacity}</span>
                  </div>
                </div>

                {/* Live Capacity Bar */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">Active Load Quota</span>
                    <span className="font-bold text-slate-900">
                      {currentActive} <span className="text-slate-400 font-normal">/ {maxOrders} Orders</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        loadPercent >= 80
                          ? 'bg-rose-500'
                          : loadPercent >= 50
                          ? 'bg-amber-500'
                          : 'bg-orange-600'
                      }`}
                      style={{ width: `${Math.max(6, loadPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400">
                    {currentActive > 0 ? `${currentActive} parcel(s) en route` : 'Idle & ready for dispatch'}
                  </span>
                  <Link
                    to="/admin/orders"
                    className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 transition"
                  >
                    View Runsheet <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Delivery Partner</th>
                  <th className="px-6 py-3.5">Vehicle Type</th>
                  <th className="px-6 py-3.5">Plate Number</th>
                  <th className="px-6 py-3.5">Operating Hub</th>
                  <th className="px-6 py-3.5">Active Quota</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgents.map((agent) => {
                  const meta = getVehicleMeta(agent.vehicleType);
                  const { Icon } = meta;
                  const currentActive = agent.currentActiveOrders || 0;
                  const maxOrders = agent.maxActiveOrders || 5;

                  return (
                    <tr key={agent.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-orange-700 font-bold uppercase">
                            {agent.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{agent.name}</div>
                            <div className="text-slate-500 font-mono text-[11px] lowercase">
                              {agent.email ? agent.email.toLowerCase() : 'agent@shipit.in'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Icon className={`h-3.5 w-3.5 ${meta.iconColor}`} />
                          <span>{meta.label}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {agent.vehicleNumber || 'DL-01-XX-0000'}
                      </td>

                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {agent.assignedZoneName || 'Delhi NCR'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Package className="h-3 w-3 text-slate-500" />
                          <span>
                            {currentActive} / {maxOrders}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            agent.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${agent.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {agent.isAvailable ? 'On Duty' : 'Off Duty'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
