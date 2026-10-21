import { ShieldCheck, AlertTriangle, Clock, Zap, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Issue } from '../../types/issue';
import { DEPARTMENT_LEVELS } from '../../taxonomy';

interface AuthorityDashboardProps {
    issues: Issue[];
    selectedDepartment: string;
    setSelectedDepartment: (dept: string) => void;
    selectedLevel: 'All' | '1' | '2' | '3' | '4';
    setSelectedLevel: (lvl: 'All' | '1' | '2' | '3' | '4') => void;
    selectedKpiFilter: 'all' | 'overdue' | 'open' | 'escalated' | 'solved';
    setSelectedKpiFilter: (filter: 'all' | 'overdue' | 'open' | 'escalated' | 'solved') => void;
    onOpenIssueDetails: (issue: Issue) => void;
    onBackToHome: () => void;
}

export function AuthorityDashboard({
    issues,
    selectedDepartment,
    setSelectedDepartment,
    selectedLevel,
    setSelectedLevel,
    selectedKpiFilter,
    setSelectedKpiFilter,
    onOpenIssueDetails,
    onBackToHome,
}: AuthorityDashboardProps) {
    const getAuthorityTitle = (dept: string, level: number = 1): string => {
        if (DEPARTMENT_LEVELS && DEPARTMENT_LEVELS[dept] && DEPARTMENT_LEVELS[dept][level]) {
            return DEPARTMENT_LEVELS[dept][level];
        }
        if (level === 4) return "VC (Vice-Chancellor)";
        if (level === 3) return "Department Head / Dean";
        if (level === 2) return "Assistant In-Charge";
        return "Department Representative";
    };

    const filteredIssues = issues
        .filter(i => selectedDepartment === 'All Departments' || i.department === selectedDepartment)
        .filter(i => selectedLevel === 'All' || (i.currentLevel || 1) === parseInt(selectedLevel))
        .filter(i => {
            if (selectedKpiFilter === 'overdue') return i.isOverdue && i.status !== 'Solved';
            if (selectedKpiFilter === 'open') return i.status !== 'Solved';
            if (selectedKpiFilter === 'escalated') return i.isEscalated && i.status !== 'Solved';
            if (selectedKpiFilter === 'solved') return i.status === 'Solved';
            return true;
        });

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 view-slide-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={onBackToHome} className="text-teal-700 hover:text-teal-900 p-2 rounded-full hover:bg-teal-50 transition-colors border border-slate-200 bg-white shadow-sm">
                        &larr; Back
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Authority Workspace</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Department Grievance Queue, 4-Level Escalations & Resolution</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <ShieldCheck size={14} /> Official Officer View
                    </span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <label className="flex flex-col text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Department
                    <select
                        value={selectedDepartment}
                        onChange={(event) => setSelectedDepartment(event.target.value)}
                        className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-teal-500 focus:outline-none"
                    >
                        {['All Departments', ...Object.keys(DEPARTMENT_LEVELS)].map((department) => (
                            <option key={department} value={department}>{department}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Escalation Level
                    <select
                        value={selectedLevel}
                        onChange={(event) => setSelectedLevel(event.target.value as 'All' | '1' | '2' | '3' | '4')}
                        className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-teal-500 focus:outline-none"
                    >
                        {['All', '1', '2', '3', '4'].map((level) => (
                            <option key={level} value={level}>{level === 'All' ? 'All levels' : `Level ${level}`}</option>
                        ))}
                    </select>
                </label>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
                <div
                    onClick={() => setSelectedKpiFilter(selectedKpiFilter === 'overdue' ? 'all' : 'overdue')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${selectedKpiFilter === 'overdue'
                            ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/50 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-xs'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Overdue SLA</p>
                            <p className="text-2xl font-black text-rose-700 mt-0.5">
                                {issues.filter(i => i.isOverdue && i.status !== 'Solved').length}
                            </p>
                            <p className="text-[10px] text-rose-500 mt-0.5">Requires Immediate Action</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-rose-100/70 flex items-center justify-center text-rose-600 shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setSelectedKpiFilter(selectedKpiFilter === 'open' ? 'all' : 'open')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${selectedKpiFilter === 'open'
                            ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/50 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Open / In Progress</p>
                            <p className="text-2xl font-black text-slate-800 mt-0.5">
                                {issues.filter(i => i.status !== 'Solved').length}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Active department tickets</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-100/70 flex items-center justify-center text-blue-600 shrink-0">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setSelectedKpiFilter(selectedKpiFilter === 'escalated' ? 'all' : 'escalated')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${selectedKpiFilter === 'escalated'
                            ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/50 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Escalated In</p>
                            <p className="text-2xl font-black text-amber-700 mt-0.5">
                                {issues.filter(i => i.isEscalated && i.status !== 'Solved').length}
                            </p>
                            <p className="text-[10px] text-amber-600 mt-0.5">Handled at L2, L3 or L4</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-600 shrink-0">
                            <Zap size={20} />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setSelectedKpiFilter(selectedKpiFilter === 'solved' ? 'all' : 'solved')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${selectedKpiFilter === 'solved'
                            ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/50 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Solved Tickets</p>
                            <p className="text-2xl font-black text-emerald-700 mt-0.5">
                                {issues.filter(i => i.status === 'Solved').length}
                            </p>
                            <p className="text-[10px] text-emerald-600 mt-0.5">Resolution verified</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-100/70 flex items-center justify-center text-emerald-600 shrink-0">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket List Queue */}
            <div className="space-y-4">
                {filteredIssues.map((issue) => {
                    const handlerTitle = issue.assignedAuthority || getAuthorityTitle(issue.department, issue.currentLevel || 1);
                    return (
                        <Card
                            key={issue.id}
                            onClick={() => onOpenIssueDetails(issue)}
                            className={`card-hover cursor-pointer group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:border-teal-300 ${issue.statusColor === 'emerald' ? 'card-accent-emerald' :
                                    issue.statusColor === 'blue' ? 'card-accent-blue' :
                                        issue.statusColor === 'amber' ? 'card-accent-amber' :
                                            'card-accent-rose'
                                }`}
                        >
                            <CardHeader className="pb-3 pt-5 px-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{issue.id}</span>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold border ${(issue.currentLevel || 1) === 4 ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                    (issue.currentLevel || 1) === 3 ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                                        (issue.currentLevel || 1) === 2 ? 'bg-sky-100 text-sky-800 border-sky-200' :
                                                            'bg-teal-50 text-teal-800 border-teal-200'
                                                }`}>
                                                <span>L{issue.currentLevel || 1}: {handlerTitle}</span>
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                                            {issue.title}
                                        </CardTitle>
                                    </div>
                                    <Badge variant="outline" className={`gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${issue.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            issue.statusColor === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                issue.statusColor === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                        {issue.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-5 pt-0">
                                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">{issue.description}</p>
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                                    <span className="text-slate-500 font-medium">Reported {issue.time}</span>
                                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-teal-700 bg-teal-50 border border-teal-200/80 group-hover:bg-teal-600 group-hover:text-white transition-all">
                                        Manage Ticket &rarr;
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {filteredIssues.length === 0 && (
                    <div className="text-center p-14 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <ShieldCheck size={36} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-700 font-bold text-base">No tickets match active filters</p>
                    </div>
                )}
            </div>
        </main>
    );
}