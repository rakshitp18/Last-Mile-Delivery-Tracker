import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  emailApi,
  EmailLogItem,
  EmailStats,
  EmailEventType,
  EmailStatus,
} from '../../api/emailApi';
import {
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Search,
  ExternalLink,
  Eye,
  Filter,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X,
  Code,
  Radio,
  Check,
  Copy,
  Server,
  FileText,
  UserCheck,
  PackageCheck,
  Truck,
  MapPin,
  Calendar,
  AlertTriangle,
  Smartphone,
  Monitor,
  Maximize2,
} from 'lucide-react';

const EVENT_TYPE_CONFIG: Record<
  EmailEventType,
  { label: string; badgeColor: string; Icon: React.ElementType; iconColor: string; category: string }
> = {
  ORDER_CREATED: { label: 'Order Created', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200', Icon: FileText, iconColor: 'text-orange-600', category: 'Booking' },
  ORDER_CONFIRMED: { label: 'Order Confirmed', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2, iconColor: 'text-emerald-600', category: 'Booking' },
  AGENT_ASSIGNED: { label: 'Partner Assigned', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200', Icon: UserCheck, iconColor: 'text-blue-600', category: 'Booking' },
  ORDER_PREPARING: { label: 'Preparing', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200', Icon: PackageCheck, iconColor: 'text-amber-600', category: 'Booking' },
  ORDER_READY: { label: 'Ready for Pickup', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200', Icon: PackageCheck, iconColor: 'text-amber-600', category: 'Booking' },
  PICKED_UP: { label: 'Picked Up', badgeColor: 'bg-violet-50 text-violet-700 border-violet-200', Icon: PackageCheck, iconColor: 'text-violet-600', category: 'In Transit' },
  ON_THE_WAY: { label: 'Out for Delivery', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200', Icon: Truck, iconColor: 'text-orange-600', category: 'In Transit' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200', Icon: Truck, iconColor: 'text-orange-600', category: 'In Transit' },
  NEAR_DESTINATION: { label: 'Near Destination', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200', Icon: MapPin, iconColor: 'text-purple-600', category: 'In Transit' },
  DELIVERED: { label: 'Delivered', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2, iconColor: 'text-emerald-600', category: 'In Transit' },
  DELIVERY_CANCELLED: { label: 'Cancelled', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200', Icon: X, iconColor: 'text-slate-600', category: 'Exceptions' },
  DELIVERY_DELAYED: { label: 'Delayed', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200', Icon: Clock, iconColor: 'text-orange-600', category: 'Exceptions' },
  DELIVERY_FAILED: { label: 'Attempt Failed', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', Icon: AlertTriangle, iconColor: 'text-rose-600', category: 'Exceptions' },
  RESCHEDULE_APPROVED: { label: 'Rescheduled', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200', Icon: Calendar, iconColor: 'text-teal-600', category: 'Exceptions' },
  RESCHEDULE_REJECTED: { label: 'Reschedule Rejected', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', Icon: AlertTriangle, iconColor: 'text-rose-600', category: 'Exceptions' },
};

const TEMPLATE_CATEGORIES = [
  {
    title: 'Booking & Dispatch',
    types: ['ORDER_CREATED', 'ORDER_CONFIRMED', 'AGENT_ASSIGNED', 'ORDER_PREPARING', 'ORDER_READY'] as EmailEventType[],
  },
  {
    title: 'Transit & Delivery',
    types: ['PICKED_UP', 'ON_THE_WAY', 'NEAR_DESTINATION', 'DELIVERED'] as EmailEventType[],
  },
  {
    title: 'Exceptions & Reschedule',
    types: ['DELIVERY_DELAYED', 'DELIVERY_FAILED', 'DELIVERY_CANCELLED', 'RESCHEDULE_APPROVED', 'RESCHEDULE_REJECTED'] as EmailEventType[],
  },
];

const ALL_EVENT_TYPES: EmailEventType[] = [
  'ORDER_CREATED',
  'ORDER_CONFIRMED',
  'AGENT_ASSIGNED',
  'ORDER_PREPARING',
  'ORDER_READY',
  'PICKED_UP',
  'ON_THE_WAY',
  'NEAR_DESTINATION',
  'DELIVERED',
  'DELIVERY_DELAYED',
  'DELIVERY_FAILED',
  'DELIVERY_CANCELLED',
  'RESCHEDULE_APPROVED',
  'RESCHEDULE_REJECTED',
];

export const EmailMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'gallery' | 'test'>('logs');
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Preview Modal state
  const [previewLog, setPreviewLog] = useState<EmailLogItem | null>(null);

  // Gallery state
  const [galleryEventType, setGalleryEventType] = useState<EmailEventType>('PICKED_UP');
  const [galleryHtml, setGalleryHtml] = useState<string>('');
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'code'>('desktop');

  // Test send form
  const [testEmail, setTestEmail] = useState('anshverma24112005@gmail.com');
  const [testEventType, setTestEventType] = useState<EmailEventType>('PICKED_UP');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const fetchStats = async () => {
    try {
      const data = await emailApi.getEmailStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load email stats', e);
    }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, size: 15 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (eventTypeFilter !== 'ALL') params.eventType = eventTypeFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await emailApi.getEmailLogs(params);
      const items = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
      setLogs(items);
      setTotalPages(data?.totalPages || (items.length > 0 ? 1 : 0));
    } catch (e) {
      console.error('Failed to load email logs', e);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    loadGalleryTemplate('PICKED_UP');
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter, eventTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  };

  const handleRetry = async (logId: number) => {
    try {
      await emailApi.retryEmail(logId);
      fetchLogs();
      fetchStats();
    } catch (e) {
      console.error('Failed to retry email', e);
    }
  };

  const loadGalleryTemplate = async (type: EmailEventType) => {
    setGalleryEventType(type);
    setGalleryLoading(true);
    try {
      const html = await emailApi.previewEmailTemplate(type);
      setGalleryHtml(html);
    } catch (e) {
      console.error('Failed to preview template', e);
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const msg = await emailApi.sendTestEmail({
        toEmail: testEmail,
        eventType: testEventType,
      });
      setTestResult({ success: true, msg });
      fetchStats();
      fetchLogs();
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: err.response?.data?.message || 'Failed to dispatch test email',
      });
    } finally {
      setTestSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Mail className="h-6 w-6 text-orange-600" />
            Email Notification Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated milestone email transmissions, delivery telemetry dispatches, and template inspector
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchStats();
              fetchLogs();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-orange-600" /> Refresh
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-orange-500 transition cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" /> Dispatch Test Email
          </button>
        </div>
      </div>

      {/* 2. Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transmissions</span>
            <Mail className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats ? stats.totalEmails : '...'}</span>
            <span className="text-[11px] text-slate-500 font-medium">Logged</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Across all order milestones</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Delivery Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{stats ? `${stats.successRate}%` : '...'}</span>
            <span className="text-[11px] text-emerald-700 font-bold">({stats ? stats.sentCount : '...'} sent)</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">Inbox delivery healthy</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Failed / Retrying</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats ? stats.failedCount : '0'}</span>
            <span className="text-[11px] text-slate-500">Errors</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {stats && stats.retryingCount > 0 ? `${stats.retryingCount} auto-retrying` : 'Zero pending exceptions'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-orange-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Relay</span>
            <Server className="h-4 w-4 text-orange-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black text-orange-700">Gmail / Brevo</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SMTP &amp; Resend Operational
          </p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Radio className="h-4 w-4" /> Live Audit Trail
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="h-4 w-4" /> Template Gallery
        </button>

        <button
          onClick={() => setActiveTab('test')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === 'test'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Send className="h-4 w-4" /> Test Console
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════
          TAB 1: LIVE DISPATCH AUDIT LOGS
      ═════════════════════════════════════════════════════════ */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tracking #, recipient email, or subject..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:bg-white focus:outline-none transition"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={eventTypeFilter}
                  onChange={(e) => {
                    setEventTypeFilter(e.target.value);
                    setPage(0);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-orange-600 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Event Milestones</option>
                  {ALL_EVENT_TYPES.map((et) => (
                    <option key={et} value={et}>
                      {EVENT_TYPE_CONFIG[et]?.label || et}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                {['ALL', 'SENT', 'PENDING', 'FAILED', 'RETRYING'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setPage(0);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white text-orange-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            {isLoading ? (
              <div className="p-16 text-center text-xs font-semibold text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-orange-600 mb-2" />
                Querying email transmission audit logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center bg-white space-y-2">
                <Mail className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">No email logs match the criteria</p>
                <p className="text-xs text-slate-500">
                  {searchTerm || statusFilter !== 'ALL'
                    ? 'Try adjusting your search query or status filter.'
                    : 'Milestone emails will appear here in real-time as parcels are dispatched.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Event Milestone</th>
                      <th className="px-5 py-3.5">Order Tracking #</th>
                      <th className="px-5 py-3.5">Recipient</th>
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5">Delivered At</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((logItem) => {
                      const eventCfg = EVENT_TYPE_CONFIG[logItem.eventType] || {
                        label: logItem.eventType,
                        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
                        Icon: Mail,
                        iconColor: 'text-slate-600',
                        category: 'System',
                      };
                      const { Icon: EventIcon } = eventCfg;

                      return (
                        <tr key={logItem.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                                logItem.status === 'SENT'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : logItem.status === 'FAILED'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : logItem.status === 'RETRYING'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  logItem.status === 'SENT'
                                    ? 'bg-emerald-500'
                                    : logItem.status === 'FAILED'
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                                }`}
                              />
                              {logItem.status === 'SENT' ? 'Delivered' : logItem.status}
                            </span>
                            {logItem.retryCount > 0 && (
                              <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                                Retry #{logItem.retryCount}
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold border ${eventCfg.badgeColor}`}
                            >
                              <EventIcon className={`h-3.5 w-3.5 ${eventCfg.iconColor}`} />
                              <span>{eventCfg.label}</span>
                            </span>
                          </td>

                          <td className="px-5 py-4 font-mono font-bold text-orange-600">
                            <Link to={`/track/${logItem.trackingNumber}`} target="_blank" className="hover:underline inline-flex items-center gap-1">
                              {logItem.trackingNumber}
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </Link>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{logItem.recipientName || 'Customer'}</div>
                            <div className="text-slate-500 font-mono text-[11px] lowercase">{logItem.recipientEmail}</div>
                          </td>

                          <td className="px-5 py-4 max-w-[220px] truncate text-slate-700 font-medium">
                            {logItem.subject}
                            {logItem.failureReason && (
                              <div className="text-rose-600 text-[10px] truncate mt-0.5" title={logItem.failureReason}>
                                Err: {logItem.failureReason}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {logItem.sentAt ? new Date(logItem.sentAt).toLocaleString() : 'Pending'}
                          </td>

                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {logItem.status === 'FAILED' && (
                                <button
                                  onClick={() => handleRetry(logItem.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                                >
                                  <RotateCw className="h-3 w-3" /> Retry
                                </button>
                              )}
                              <button
                                onClick={() => setPreviewLog(logItem)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 transition cursor-pointer shadow-2xs"
                              >
                                <Eye className="h-3 w-3" /> Inspect HTML
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/70 text-xs">
                <span className="text-slate-500 font-medium">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 2: TEMPLATE GALLERY & LIVE INSPECTOR
      ═════════════════════════════════════════════════════════ */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left: Categorized Template Selector */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Milestone Email Templates</h3>
              <p className="text-[11px] text-slate-500">Select an automated event template to inspect</p>
            </div>

            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <div key={cat.title} className="space-y-1.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    {cat.title}
                  </span>
                  <div className="space-y-1">
                    {cat.types.map((type) => {
                      const cfg = EVENT_TYPE_CONFIG[type];
                      const { Icon: CfgIcon } = cfg;
                      const active = galleryEventType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => loadGalleryTemplate(type)}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer text-left ${
                            active
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-slate-50/70 text-slate-700 hover:bg-slate-100 border border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CfgIcon className={`h-3.5 w-3.5 ${active ? 'text-white' : cfg.iconColor}`} />
                            <span>{cfg.label}</span>
                          </div>
                          <ChevronRight className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Preview Device Frame */}
          <div className="lg:col-span-8 space-y-3">
            {/* Action Bar & Device Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-slate-900">
                  {EVENT_TYPE_CONFIG[galleryEventType]?.label}
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Responsive Template
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Viewport switcher */}
                <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'desktop' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Desktop Preview (640px)"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'mobile' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Mobile View (375px)"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'code' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="HTML Source Code"
                  >
                    <Code className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => copyToClipboard(galleryHtml)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  {copiedHtml ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedHtml ? 'Copied' : 'Copy HTML'}
                </button>
                <button
                  onClick={() => {
                    setTestEventType(galleryEventType);
                    setActiveTab('test');
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-orange-500 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> Test Send
                </button>
              </div>
            </div>

            {/* Email Header Metadata Bar */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>From: <strong className="text-slate-800">Ship It Operations &lt;notifications@shipit.in&gt;</strong></span>
                <span className="text-slate-400">Order #GTM-20260820-875171</span>
              </div>
              <div className="text-slate-700 font-sans font-semibold text-xs truncate">
                Subject: <span className="text-orange-700 font-bold">{EVENT_TYPE_CONFIG[galleryEventType]?.label} — Ship It Delivery Update</span>
              </div>
            </div>

            {/* Preview Frame Canvas */}
            <div className="rounded-2xl border border-slate-200 bg-slate-100/90 p-5 shadow-2xs flex justify-center min-h-[500px]">
              {galleryLoading ? (
                <div className="h-96 flex flex-col items-center justify-center text-xs text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin text-orange-600 mb-2" />
                  Rendering email template...
                </div>
              ) : viewMode === 'code' ? (
                <div className="w-full bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-[11px] overflow-auto max-h-[650px] shadow-md">
                  <pre className="whitespace-pre-wrap">{galleryHtml}</pre>
                </div>
              ) : (
                <div
                  className={`transition-all duration-300 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden ${
                    viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-[620px]'
                  }`}
                >
                  <iframe
                    title="Live Email Template Preview"
                    srcDoc={galleryHtml || '<html><body><div style="padding:40px;text-align:center;font-family:sans-serif;color:#64748b;">Loading template preview...</div></body></html>'}
                    className="w-full h-[650px] border-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 3: DISPATCH TEST CONSOLE
      ═════════════════════════════════════════════════════════ */}
      {activeTab === 'test' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Send className="h-5 w-5 text-orange-600" />
              Dispatch Test Milestone Email
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Send a test delivery milestone notification to any target inbox using live rendered order telemetry.
            </p>
          </div>

          <form onSubmit={handleSendTest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="e.g. anshverma24112005@gmail.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Milestone Event Type
              </label>
              <select
                value={testEventType}
                onChange={(e) => setTestEventType(e.target.value as EmailEventType)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none font-bold"
              >
                {ALL_EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPE_CONFIG[type]?.label} ({type})
                  </option>
                ))}
              </select>
            </div>

            {testResult && (
              <div
                className={`rounded-xl border p-4 text-xs font-semibold flex items-start gap-2 ${
                  testResult.success
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testResult.success ? 'Dispatch Success' : 'Dispatch Error'}</p>
                  <p className="mt-0.5 font-normal">{testResult.msg}</p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={testSending}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-orange-500 transition disabled:opacity-50 cursor-pointer"
              >
                {testSending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          PREVIEW MODAL (FOR AUDIT LOG ROWS)
      ═════════════════════════════════════════════════════════ */}
      {previewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{previewLog.subject}</span>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {previewLog.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  To: <strong className="text-slate-700">{previewLog.recipientEmail}</strong> · Order #{previewLog.trackingNumber}
                </p>
              </div>
              <button
                onClick={() => setPreviewLog(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 p-4 bg-slate-100 overflow-y-auto flex justify-center">
              <iframe
                title="Rendered Email Log"
                srcDoc={previewLog.htmlContent || '<p>No content</p>'}
                className="w-full max-w-[600px] h-[600px] rounded-xl border border-slate-200 shadow-md bg-white"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-white text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Log ID: #{previewLog.id} · Idempotency: {previewLog.idempotencyKey}
              </span>
              <div className="flex gap-2">
                {previewLog.status === 'FAILED' && (
                  <button
                    onClick={() => {
                      handleRetry(previewLog.id);
                      setPreviewLog(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> Retry Dispatch
                  </button>
                )}
                <button
                  onClick={() => setPreviewLog(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
