import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Search,
    Trash2,
    TrendingUp,
    RefreshCw,
    ExternalLink,
    ArrowUpRight,
    Users,
    X,
    Eye,
    MessageSquare,
    Flame,
    Layers,
    Building2,
    Sparkles,
} from 'lucide-react';

import type { Issue } from '../../types/issue';
import { DEPARTMENT_LEVELS } from '../../taxonomy';
import { isUserAdmin } from '../../lib/adminAuth';
import { canonicalizeDepartmentName } from '../../lib/supabaseService';

interface AdminDashboardProps {
    issues: Issue[];
    loading: boolean;
    error: string | null;
    currentUserEmail?: string | null;
    currentUserName?: string | null;
    onRefresh: () => void;
    onSolveTicket: (ticketId: string) => Promise<void>;
    onStatusChange: (ticketId: string, status: 'Not Started' | 'Seen' | 'In Progress' | 'Solved') => Promise<void>;
    onEscalateTicket: (
        ticketId: string,
        nextLevel: number,
        nextTitle: string,
        reason: string,
        note?: string
    ) => Promise<void>;
    onDeleteTicket: (ticketId: string) => Promise<void>;
}

type AdminViewTab = 'master' | 'student-mod' | 'authority-sla';

export function AdminDashboard({
    issues,
    loading,
    error,
    currentUserEmail,
    currentUserName,
    onRefresh,
    onSolveTicket,
    onStatusChange,
    onEscalateTicket,
    onDeleteTicket,
}: AdminDashboardProps) {
    const navigate = useNavigate();
    const authorized = isUserAdmin(currentUserEmail, currentUserName);

    // Active View Tab
    const [activeTab, setActiveTab] = useState<AdminViewTab>('master');

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');
    const [selectedLevel, setSelectedLevel] = useState('All Levels');
    const [onlyOverdue, setOnlyOverdue] = useState(false);

    // Modals
    const [detailIssue, setDetailIssue] = useState<Issue | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [deleteModalIssue, setDeleteModalIssue] = useState<Issue | null>(null);
    const [escalateModalIssue, setEscalateModalIssue] = useState<Issue | null>(null);

    // Escalation Modal Form
    const [targetLevel, setTargetLevel] = useState<number>(2);
    const [escalateReason, setEscalateReason] = useState('Administrative Priority');
    const [escalateNote, setEscalateNote] = useState('');
    const [actionSubmitting, setActionSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Calculate High-Level Metrics
    const stats = useMemo(() => {
        const total = issues.length;
        const inProgress = issues.filter((i) => i.status === 'In Progress').length;
        const seen = issues.filter((i) => i.status === 'Seen').length;
        const notStarted = issues.filter((i) => i.status === 'Not Started').length;
        const solved = issues.filter((i) => i.status === 'Solved').length;
        const overdue = issues.filter((i) => i.isOverdue && i.status !== 'Solved').length;
        const escalated = issues.filter((i) => (i.currentLevel > 1 || i.isEscalated) && i.status !== 'Solved').length;
        const totalUpvotes = issues.reduce((acc, curr) => acc + (curr.upvotes || 0), 0);

        return { total, inProgress, seen, notStarted, solved, overdue, escalated, totalUpvotes };
    }, [issues]);

    // Department Performance Breakdown (Grouped into canonical campus taxonomy)
    const departmentStats = useMemo(() => {
        const canonicalDepts = [
            'Hostel, Mess & Laundry',
            'Campus Infrastructure & IT',
            'Academics & Library',
            'Student Life & Sports',
            'Health, Well-being & Safety',
            'Administration & Support',
        ];

        const map: Record<string, { total: number; pending: number; overdue: number; solved: number }> = {};
        for (const d of canonicalDepts) {
            map[d] = { total: 0, pending: 0, overdue: 0, solved: 0 };
        }

        for (const issue of issues) {
            const dept = canonicalizeDepartmentName(issue.department);
            if (!map[dept]) {
                map[dept] = { total: 0, pending: 0, overdue: 0, solved: 0 };
            }
            map[dept].total += 1;
            if (issue.status === 'Solved') {
                map[dept].solved += 1;
            } else {
                map[dept].pending += 1;
                if (issue.isOverdue) map[dept].overdue += 1;
            }
        }
        return map;
    }, [issues]);

    // Filtered Issues list with normalized department and taxonomy matching
    const filteredIssues = useMemo(() => {
        return issues.filter((issue) => {
            if (selectedDepartment !== 'All Departments') {
                const targetDept = canonicalizeDepartmentName(selectedDepartment);
                const issueDept = canonicalizeDepartmentName(issue.department);
                if (issueDept !== targetDept) {
                    return false;
                }
            }
            if (selectedStatus !== 'All Statuses' && issue.status !== selectedStatus) {
                return false;
            }
            if (selectedLevel !== 'All Levels') {
                const targetLvl = parseInt(selectedLevel.replace('Level ', ''), 10);
                if (issue.currentLevel !== targetLvl) return false;
            }
            if (onlyOverdue && (!issue.isOverdue || issue.status === 'Solved')) {
                return false;
            }
            if (searchQuery.trim().length > 0) {
                const q = searchQuery.toLowerCase();
                const titleMatch = issue.title.toLowerCase().includes(q);
                const descMatch = issue.description.toLowerCase().includes(q);
                const locMatch = issue.location.toLowerCase().includes(q);
                const idMatch = issue.id.toLowerCase().includes(q);
                const repNameMatch = issue.reporterName?.toLowerCase().includes(q) ?? false;
                const repEmailMatch = issue.reporterEmail?.toLowerCase().includes(q) ?? false;
                const categoryMatch = issue.category?.toLowerCase().includes(q) ?? false;
                if (!titleMatch && !descMatch && !locMatch && !idMatch && !repNameMatch && !repEmailMatch && !categoryMatch) {
                    return false;
                }
            }
            return true;
        });
    }, [issues, selectedDepartment, selectedStatus, selectedLevel, onlyOverdue, searchQuery]);

    // Handle Quick Status Change
    const handleStatusDropdownChange = async (issue: Issue, newStatus: 'Not Started' | 'Seen' | 'In Progress' | 'Solved') => {
        try {
            await onStatusChange(issue.id, newStatus);
            showToast(`Updated #${issue.id} status to "${newStatus}"`);
        } catch (e) {
            showToast(e instanceof Error ? e.message : 'Could not update status');
        }
    };

    // Handle Confirm Escalation
    const handleConfirmEscalate = async () => {
        if (!escalateModalIssue) return;
        setActionSubmitting(true);
        try {
            const dept = escalateModalIssue.department;
            const titlesForDept = DEPARTMENT_LEVELS[dept] || DEPARTMENT_LEVELS['Hostel, Mess & Laundry'];
            const targetTitle = titlesForDept[targetLevel] || `Level ${targetLevel} Officer`;

            await onEscalateTicket(
                escalateModalIssue.id,
                targetLevel,
                targetTitle,
                escalateReason,
                escalateNote.trim() || undefined
            );
            showToast(`Ticket #${escalateModalIssue.id} force-escalated to Level ${targetLevel} (${targetTitle})`);
            setEscalateModalIssue(null);
            setEscalateNote('');
        } catch (e) {
            showToast(e instanceof Error ? e.message : 'Escalation failed');
        } finally {
            setActionSubmitting(false);
        }
    };

    // Handle Confirm Delete
    const handleConfirmDelete = async () => {
        if (!deleteModalIssue) return;
        setActionSubmitting(true);
        try {
            await onDeleteTicket(deleteModalIssue.id);
            showToast(`Complaint #${deleteModalIssue.id} deleted from system`);
            setDeleteModalIssue(null);
        } catch (e) {
            showToast(e instanceof Error ? e.message : 'Deletion failed');
        } finally {
            setActionSubmitting(false);
        }
    };

    // Security Gate check
    if (!authorized) {
        return (
            <main className="max-w-2xl mx-auto px-4 py-24 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-sm border border-rose-200">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                    Restricted Administrative Zone
                </h1>
                <p className="text-slate-600 text-sm max-w-md mx-auto mb-2">
                    This control console is strictly restricted to authorized university administrators (<code>rudrapalsinghshekhawat@jklu.edu.in</code> & <code>tanishqdaiya@jklu.edu.in</code>).
                </p>
                <p className="text-xs text-slate-500 mb-6">
                    Currently signed in as: <strong className="text-rose-600 font-bold">{currentUserEmail || 'Unauthenticated'}</strong>
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                    Return to Safe Dashboard
                </button>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 view-slide-in">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <CheckCircle2 size={18} className="text-teal-400 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Top Admin Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg mb-8 border border-slate-700/60">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-13 h-13 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-inner">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                    Admin Command Center
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                                    Master Console
                                </span>
                            </div>
                            <p className="text-slate-300 text-xs sm:text-sm mt-1">
                                Authoritative access logged in as{' '}
                                <span className="font-bold text-teal-200 underline decoration-teal-400/50">
                                    {currentUserEmail}
                                </span>{' '}
                                • Full override controls across Student & Authority domains.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Refreshing...' : 'Sync Database'}
                        </button>
                        <button
                            onClick={() => navigate('/authority-dashboard')}
                            className="flex items-center gap-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                            Authority View <ArrowUpRight size={14} />
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-1.5 text-xs font-bold bg-slate-700/80 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                            Student Feed <ExternalLink size={13} />
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                    <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Reports</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
                        <Layers size={11} className="text-teal-600" /> Across 6 Depts
                    </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-amber-200/80 bg-amber-50/20 shadow-2xs">
                    <p className="text-[11px] font-bold uppercase text-amber-700 tracking-wider">In Progress</p>
                    <p className="text-2xl font-black text-amber-700 mt-1">{stats.inProgress}</p>
                    <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
                        <Clock size={11} /> Being Resolved
                    </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-rose-200/80 bg-rose-50/20 shadow-2xs">
                    <p className="text-[11px] font-bold uppercase text-rose-700 tracking-wider">SLA Overdue</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{stats.overdue}</p>
                    <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle size={11} /> Needs Escalation
                    </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-indigo-200/80 bg-indigo-50/20 shadow-2xs">
                    <p className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider">Escalated</p>
                    <p className="text-2xl font-black text-indigo-700 mt-1">{stats.escalated}</p>
                    <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 mt-1">
                        <TrendingUp size={11} /> L2 to VC Level
                    </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
                    <p className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">Resolved</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{stats.solved}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                        <CheckCircle2 size={11} /> Verified Fixed
                    </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-orange-200/80 bg-orange-50/20 shadow-2xs">
                    <p className="text-[11px] font-bold uppercase text-orange-700 tracking-wider">Community Votes</p>
                    <p className="text-2xl font-black text-orange-600 mt-1">{stats.totalUpvotes}</p>
                    <span className="text-[10px] text-orange-600 font-semibold flex items-center gap-1 mt-1">
                        <Flame size={11} /> Student Upvotes
                    </span>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 mb-6 max-w-xl">
                <button
                    onClick={() => setActiveTab('master')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'master'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Sparkles size={15} className="text-teal-600" />
                    <span>Master God-View</span>
                </button>
                <button
                    onClick={() => setActiveTab('student-mod')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'student-mod'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Users size={15} className="text-teal-600" />
                    <span>Student Moderation</span>
                </button>
                <button
                    onClick={() => setActiveTab('authority-sla')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'authority-sla'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Building2 size={15} className="text-teal-600" />
                    <span>Authority & SLAs</span>
                </button>
            </div>

            {/* Contextual Banner for Selected Tab */}
            {activeTab === 'student-mod' && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 text-xs sm:text-sm text-blue-900 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Users size={20} className="text-blue-600 shrink-0" />
                        <div>
                            <span className="font-bold">Student Feed Moderation:</span> Audit student submissions, inspect attached photographic evidence, remove offensive/spam tickets, and analyze top community upvoted complaints.
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'authority-sla' && (
                <div className="mb-6 space-y-4">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 flex items-center gap-3">
                        <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                        <div>
                            <span className="font-bold">Authority SLA & Escalation Control:</span> Monitor department turnaround times, force-escalate delayed issues up to Level 4 (Vice-Chancellor), and resolve administrative bottlenecks.
                        </div>
                    </div>

                    {/* Department Performance Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Object.entries(departmentStats).map(([dept, data]) => {
                            const isSelected = selectedDepartment === dept;
                            return (
                                <div
                                    key={dept}
                                    onClick={() => setSelectedDepartment(isSelected ? 'All Departments' : dept)}
                                    className={`rounded-xl p-3 border transition-all cursor-pointer shadow-2xs ${
                                        isSelected
                                            ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/30'
                                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-extrabold text-slate-700 truncate" title={dept}>
                                            {dept}
                                        </p>
                                        <span className="text-[10px] text-teal-800 font-extrabold bg-teal-100/70 px-1.5 py-0.5 rounded">
                                            {data.total}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-baseline justify-between">
                                        <span className="text-lg font-black text-slate-900">{data.pending}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">pending</span>
                                    </div>
                                    {data.overdue > 0 && (
                                        <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                            ⚠️ {data.overdue} overdue
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by ticket code, student name, email, location, or issue description..."
                            className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm font-medium outline-none focus:bg-white transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Department Filter with Dynamic Counts */}
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl outline-none hover:bg-slate-100 cursor-pointer"
                        >
                            {[
                                'All Departments',
                                'Hostel, Mess & Laundry',
                                'Campus Infrastructure & IT',
                                'Academics & Library',
                                'Student Life & Sports',
                                'Health, Well-being & Safety',
                                'Administration & Support',
                            ].map((dept) => {
                                const count =
                                    dept === 'All Departments'
                                        ? issues.length
                                        : issues.filter(
                                              (i) => canonicalizeDepartmentName(i.department) === dept
                                          ).length;
                                return (
                                    <option key={dept} value={dept}>
                                        {dept} ({count})
                                    </option>
                                );
                            })}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl outline-none hover:bg-slate-100 cursor-pointer"
                        >
                            <option value="All Statuses">All Statuses</option>
                            <option value="Not Started">Not Started</option>
                            <option value="Seen">Seen</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Solved">Solved</option>
                        </select>

                        {/* Level Filter */}
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl outline-none hover:bg-slate-100 cursor-pointer"
                        >
                            <option value="All Levels">All Levels</option>
                            <option value="Level 1">Level 1 (Supervisor/Warden)</option>
                            <option value="Level 2">Level 2 (Head/Officer)</option>
                            <option value="Level 3">Level 3 (Dean/Proctor)</option>
                            <option value="Level 4">Level 4 (Vice-Chancellor)</option>
                        </select>

                        {/* Only Overdue Toggle */}
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={onlyOverdue}
                                onChange={(e) => setOnlyOverdue(e.target.checked)}
                                className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            <span>⚠️ Overdue Only</span>
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-1">
                    <span>
                        Showing <strong className="text-slate-700">{filteredIssues.length}</strong> of{' '}
                        {issues.length} tickets
                    </span>
                    {(selectedDepartment !== 'All Departments' ||
                        selectedStatus !== 'All Statuses' ||
                        selectedLevel !== 'All Levels' ||
                        onlyOverdue ||
                        searchQuery) && (
                            <button
                                onClick={() => {
                                    setSelectedDepartment('All Departments');
                                    setSelectedStatus('All Statuses');
                                    setSelectedLevel('All Levels');
                                    setOnlyOverdue(false);
                                    setSearchQuery('');
                                }}
                                className="text-teal-700 hover:text-teal-900 font-bold hover:underline"
                            >
                                Reset all filters
                            </button>
                        )}
                </div>
            </div>

            {/* Error or Loading State */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl mb-6 text-xs sm:text-sm font-semibold flex items-center justify-between">
                    <span>Error loading tickets: {error}</span>
                    <button onClick={onRefresh} className="underline font-bold">
                        Retry
                    </button>
                </div>
            )}

            {/* Main Unified Data Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                                <th className="py-3.5 px-4">Ticket</th>
                                <th className="py-3.5 px-4">Student / Reporter</th>
                                <th className="py-3.5 px-4">Issue & Location</th>
                                <th className="py-3.5 px-4">Votes / Updates</th>
                                <th className="py-3.5 px-4">Authority & Level</th>
                                <th className="py-3.5 px-4">SLA / Status</th>
                                <th className="py-3.5 px-4 text-right">Admin Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredIssues.map((issue) => {
                                const isOverdue = issue.isOverdue && issue.status !== 'Solved';
                                return (
                                    <tr
                                        key={issue.id}
                                        className={`hover:bg-slate-50/70 transition-colors ${isOverdue ? 'bg-rose-50/20' : ''
                                            }`}
                                    >
                                        {/* Ticket ID & Time */}
                                        <td className="py-3.5 px-4 align-top">
                                            <span className="font-extrabold text-slate-900 block">
                                                #{issue.id}
                                            </span>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                                {issue.time}
                                            </span>
                                            {issue.imageUrl && (
                                                <button
                                                    onClick={() => setImagePreviewUrl(issue.imageUrl || null)}
                                                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-1.5 py-0.5 rounded border border-teal-200 cursor-pointer"
                                                >
                                                    <Eye size={10} /> Photo
                                                </button>
                                            )}
                                        </td>

                                        {/* Student Info */}
                                        <td className="py-3.5 px-4 align-top max-w-[180px]">
                                            <p className="font-bold text-slate-800 truncate" title={issue.reporterName || 'Student'}>
                                                {issue.reporterName || 'JKLU Student'}
                                            </p>
                                            <p className="text-[11px] text-slate-400 truncate" title={issue.reporterEmail || 'jklu.edu.in'}>
                                                {issue.reporterEmail || 'Anonymous submission'}
                                            </p>
                                        </td>

                                        {/* Issue Details & Location */}
                                        <td className="py-3.5 px-4 align-top max-w-xs">
                                            <p className="font-bold text-slate-900 leading-snug line-clamp-1" title={issue.title}>
                                                {issue.title}
                                            </p>
                                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                {issue.department} • <span className="text-slate-600 font-medium">{issue.specificIssue}</span>
                                            </p>
                                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                                📍 {issue.location}
                                            </p>
                                        </td>

                                        {/* Community Upvotes & Comments */}
                                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 font-bold text-xs ${issue.upvotes > 0 ? 'text-orange-600' : 'text-slate-400'
                                                        }`}
                                                >
                                                    <Flame size={13} className={issue.upvotes > 0 ? 'fill-orange-500' : ''} />
                                                    {issue.upvotes}
                                                </span>
                                                <span className="inline-flex items-center gap-1 font-semibold text-xs text-slate-400">
                                                    <MessageSquare size={12} />
                                                    {issue.comments?.length || 0}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Authority & Escalation Level */}
                                        <td className="py-3.5 px-4 align-top">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${issue.currentLevel === 4
                                                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                                                : issue.currentLevel >= 2
                                                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                                                    : 'bg-slate-100 text-slate-700'
                                                            }`}
                                                    >
                                                        Level {issue.currentLevel}
                                                        {issue.currentLevel === 4 && ' (VC)'}
                                                    </span>
                                                    {issue.isEscalated && (
                                                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">
                                                            Escalated
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-medium text-slate-600 truncate max-w-[150px]">
                                                    {issue.assignedAuthority}
                                                </p>
                                            </div>
                                        </td>

                                        {/* SLA & Status */}
                                        <td className="py-3.5 px-4 align-top">
                                            <div className="space-y-1.5">
                                                {isOverdue ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full border border-rose-200">
                                                        <AlertTriangle size={10} /> SLA Overdue
                                                    </span>
                                                ) : issue.status === 'Solved' ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        <CheckCircle2 size={10} /> Closed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                        <Clock size={10} /> In Window
                                                    </span>
                                                )}

                                                {/* Status Selector Dropdown */}
                                                <div>
                                                    <select
                                                        value={issue.status}
                                                        onChange={(e) =>
                                                            handleStatusDropdownChange(
                                                                issue,
                                                                e.target.value as 'Not Started' | 'Seen' | 'In Progress' | 'Solved'
                                                            )
                                                        }
                                                        className={`text-[11px] font-black rounded-lg px-2 py-1 border outline-none cursor-pointer ${issue.status === 'Solved'
                                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                                : issue.status === 'In Progress'
                                                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                                    : issue.status === 'Seen'
                                                                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                                                                        : 'bg-rose-50 text-rose-800 border-rose-300'
                                                            }`}
                                                    >
                                                        <option value="Not Started">Not Started</option>
                                                        <option value="Seen">Seen</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Solved">Solved</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Admin Actions */}
                                        <td className="py-3.5 px-4 align-top text-right">
                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                {/* Inspect Detail */}
                                                <button
                                                    onClick={() => setDetailIssue(issue)}
                                                    title="View Full Details"
                                                    className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Eye size={15} />
                                                </button>

                                                {/* Force Escalate */}
                                                <button
                                                    onClick={() => {
                                                        setEscalateModalIssue(issue);
                                                        setTargetLevel(Math.min(4, (issue.currentLevel || 1) + 1));
                                                    }}
                                                    title="Force Escalate"
                                                    className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <TrendingUp size={15} />
                                                </button>

                                                {/* Quick Solve */}
                                                {issue.status !== 'Solved' && (
                                                    <button
                                                        onClick={() => onSolveTicket(issue.id)}
                                                        title="Mark as Solved"
                                                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <CheckCircle2 size={15} />
                                                    </button>
                                                )}

                                                {/* Delete Spam */}
                                                <button
                                                    onClick={() => setDeleteModalIssue(issue)}
                                                    title="Delete Ticket (Spam / Fake)"
                                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredIssues.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                                        No tickets match the selected filters or search query.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL 1: Force Escalation Dialog */}
            {escalateModalIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                    <TrendingUp size={18} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-base">
                                        Force Escalate Ticket #{escalateModalIssue.id}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Department: {escalateModalIssue.department}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEscalateModalIssue(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">
                                Target Escalation Tier
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[2, 3, 4].map((lvl) => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setTargetLevel(lvl)}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${targetLevel === lvl
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        Level {lvl}
                                        {lvl === 4 && ' (VC)'}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1.5">
                                Current authority:{' '}
                                <strong className="text-slate-700">
                                    {DEPARTMENT_LEVELS[escalateModalIssue.department]?.[targetLevel] ||
                                        `Level ${targetLevel} Officer`}
                                </strong>
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">
                                Reason for Escalation
                            </label>
                            <select
                                value={escalateReason}
                                onChange={(e) => setEscalateReason(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                            >
                                <option value="SLA Breached / Unresolved">SLA Breached / Unresolved</option>
                                <option value="Critical Safety Hazard">Critical Safety Hazard</option>
                                <option value="Campus-wide Impact">Campus-wide Impact</option>
                                <option value="Administrative Priority (VC Override)">
                                    Administrative Priority (VC Override)
                                </option>
                                <option value="Student Body Representation / High Upvotes">
                                    Student Body Representation / High Upvotes
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">
                                Admin Directive / Note (Optional)
                            </label>
                            <textarea
                                value={escalateNote}
                                onChange={(e) => setEscalateNote(e.target.value)}
                                rows={3}
                                placeholder="Add specific administrative context or instruction for the receiving officer..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:bg-white"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setEscalateModalIssue(null)}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionSubmitting}
                                onClick={handleConfirmEscalate}
                                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                {actionSubmitting ? 'Escalating...' : 'Confirm Escalation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: Delete Confirmation Dialog */}
            {deleteModalIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2 border border-rose-200">
                            <Trash2 size={24} />
                        </div>

                        <div className="text-center">
                            <h3 className="font-extrabold text-slate-900 text-lg">
                                Delete Ticket #{deleteModalIssue.id}?
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Are you sure you want to permanently remove this ticket? This action is designed for spam, abusive language, or fake submissions.
                            </p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                            <p>
                                <strong>Title:</strong> {deleteModalIssue.title}
                            </p>
                            <p>
                                <strong>Reported by:</strong>{' '}
                                {deleteModalIssue.reporterEmail || deleteModalIssue.reporterName || 'Unknown'}
                            </p>
                            <p>
                                <strong>Location:</strong> {deleteModalIssue.location}
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalIssue(null)}
                                className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionSubmitting}
                                onClick={handleConfirmDelete}
                                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                {actionSubmitting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: Image Preview */}
            {imagePreviewUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                    onClick={() => setImagePreviewUrl(null)}
                >
                    <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
                        <button
                            onClick={() => setImagePreviewUrl(null)}
                            className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white p-1.5 rounded-full z-10 cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                        <img
                            src={imagePreviewUrl}
                            alt="Evidence Attachment"
                            className="max-h-[80vh] w-auto rounded-xl object-contain"
                        />
                    </div>
                </div>
            )}

            {/* MODAL 4: Full Issue Detail Drawer */}
            {detailIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <span className="text-[11px] font-black uppercase text-teal-700 tracking-wider">
                                    Ticket Audit #{detailIssue.id}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                                    {detailIssue.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setDetailIssue(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Reporter</p>
                                    <p className="font-bold text-slate-800 mt-0.5">
                                        {detailIssue.reporterName || 'JKLU Student'}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        {detailIssue.reporterEmail || 'No email attached'}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Status & Tier</p>
                                    <p className="font-bold text-slate-800 mt-0.5">
                                        {detailIssue.status} • Level {detailIssue.currentLevel}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        {detailIssue.assignedAuthority}
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Category & Location</p>
                                <p className="font-semibold text-slate-800 mt-0.5">
                                    {detailIssue.department} &gt; {detailIssue.category} &gt; {detailIssue.specificIssue}
                                </p>
                                <p className="text-slate-600 mt-0.5 font-medium">📍 {detailIssue.location}</p>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Issue Description</p>
                                <p className="text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                                    {detailIssue.description}
                                </p>
                            </div>

                            {detailIssue.imageUrl && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Photographic Evidence</p>
                                    <img
                                        src={detailIssue.imageUrl}
                                        alt="Evidence"
                                        onClick={() => setImagePreviewUrl(detailIssue.imageUrl || null)}
                                        className="h-44 w-auto rounded-lg object-cover cursor-pointer hover:opacity-90 border border-slate-200"
                                    />
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-bold text-slate-800 mb-2">
                                    Lifecycle Updates ({detailIssue.comments?.length || 0})
                                </p>
                                <div className="space-y-2">
                                    {detailIssue.comments?.map((c, i) => (
                                        <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-slate-800">{c.author}</span>
                                                <span className="text-[10px] text-slate-400">{c.time}</span>
                                            </div>
                                            <p className="text-slate-600 text-[11px]">{c.text}</p>
                                        </div>
                                    ))}
                                    {(!detailIssue.comments || detailIssue.comments.length === 0) && (
                                        <p className="text-slate-400 text-xs italic">No updates logged yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                                onClick={() => navigate(`/issue/${detailIssue.id}`)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900"
                            >
                                Open Public Card <ExternalLink size={12} />
                            </button>
                            <button
                                onClick={() => setDetailIssue(null)}
                                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                            >
                                Close Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
