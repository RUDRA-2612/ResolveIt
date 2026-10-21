import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Check, ThumbsUp, MessageSquare, ShieldCheck, Zap, CheckCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Issue, UserRole, IssueSourceView } from '../../types/issue';
import { DEPARTMENT_LEVELS } from '../../taxonomy';

interface IssueDetailsProps {
    issue: Issue;
    userRole: UserRole | null;
    issueSourceView: IssueSourceView;
    onBack: () => void;
    onToggleUpvote: (issueId: string) => void;
    onAddComment: (commentText: string) => void;
    onAcknowledge: (issueId: string) => void;
    onOpenPostUpdate: (issue: Issue) => void;
    onOpenEscalate: (issue: Issue) => void;
    onSolve: (issueId: string) => void;
    onSwitchToWorkspaceView: () => void;
}

export function IssueDetails({
    issue,
    userRole,
    issueSourceView,
    onBack,
    onToggleUpvote,
    onAddComment,
    onAcknowledge,
    onOpenPostUpdate,
    onOpenEscalate,
    onSolve,
    onSwitchToWorkspaceView,
}: IssueDetailsProps) {
    const [isCommenting, setIsCommenting] = useState(false);
    const [newComment, setNewComment] = useState('');

    const getAuthorityTitle = (dept: string, level: number = 1): string => {
        if (DEPARTMENT_LEVELS && DEPARTMENT_LEVELS[dept] && DEPARTMENT_LEVELS[dept][level]) {
            return DEPARTMENT_LEVELS[dept][level];
        }
        if (level === 4) return "VC (Vice-Chancellor)";
        if (level === 3) return "Department Head / Dean";
        if (level === 2) return "Assistant In-Charge";
        return "Department Representative";
    };

    const handleCommentSubmit = () => {
        if (!newComment.trim()) return;
        onAddComment(newComment.trim());
        setNewComment('');
        setIsCommenting(false);
    };

    return (
        <main className="max-w-5xl mx-auto px-4 pt-10 pb-20 view-slide-in">
            <div className="bg-white border border-slate-200 shadow-md shadow-slate-100/60 rounded-2xl p-6 md:p-10 mb-8">
                <button
                    onClick={onBack}
                    className="text-teal-600 font-bold mb-6 flex items-center gap-1 hover:text-teal-800 transition-colors cursor-pointer"
                >
                    <ArrowLeft size={16} /> Back to {issueSourceView === 'authority-dashboard' ? 'Authority Workspace' : issueSourceView === 'recent-reported' ? 'My Tickets' : 'Home'}
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-slate-500">{issue.id}</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${issue.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            issue.statusColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                issue.statusColor === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                    'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                            {issue.status === 'Solved' && <CheckCircle size={14} />}
                            {issue.status === 'Seen' && <CheckCircle size={14} className="opacity-70" />}
                            {issue.status === 'Not Started' && <AlertCircle size={14} />}
                            {issue.status}
                        </span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-slate-500"><Clock size={16} /> Reported {issue.time}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">{issue.title}</h1>

                {/* 4-Level Pipeline Visualizer */}
                <div className="mb-8 p-6 bg-slate-50/90 border border-slate-200 rounded-3xl shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Hierarchy Escalation Pipeline</span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">{issue.department}</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800 mt-1">
                                {issue.status === 'Solved' ? 'Resolved by Authority: ' : 'Current Assigned Authority: '}
                                <strong className="text-teal-700 font-extrabold text-base">
                                    {issue.assignedAuthority || getAuthorityTitle(issue.department, issue.currentLevel || 1)}
                                </strong>
                                <span className="text-xs font-bold text-slate-500 ml-2">
                                    ({issue.status === 'Solved' ? `Resolved at Level ${issue.currentLevel || 1}` : `Level ${issue.currentLevel || 1}`})
                                </span>
                            </p>
                        </div>
                        {issue.isEscalated && (
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-100/80 text-amber-900 border border-amber-300 text-xs font-bold shadow-sm self-start sm:self-auto">
                                <Zap size={14} className="text-amber-600 fill-amber-500" />
                                <span>Escalated from {issue.escalatedFrom} • {issue.escalationReason}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-2 sm:gap-4 relative pt-2">
                        {[1, 2, 3, 4].map((lvl) => {
                            const levelTitle = getAuthorityTitle(issue.department, lvl);
                            const curLvl = issue.currentLevel || 1;
                            const isPast = lvl < curLvl;
                            const isCurrent = lvl === curLvl;
                            const isSolved = issue.status === 'Solved';

                            return (
                                <div key={lvl} className="flex flex-col items-center text-center relative group">
                                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-extrabold text-xs sm:text-sm mb-2 transition-all ${isCurrent
                                        ? isSolved
                                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-md scale-105'
                                            : 'bg-teal-600 text-white ring-4 ring-teal-200 shadow-md scale-105'
                                        : isPast
                                            ? 'bg-emerald-500 text-white shadow-sm'
                                            : 'bg-white text-slate-400 border border-slate-200'
                                        }`}>
                                        {isPast || (isCurrent && isSolved) ? <Check size={18} strokeWidth={2.5} /> : `L${lvl}`}
                                    </div>
                                    <span className={`text-[11px] sm:text-xs font-bold leading-tight max-w-[120px] ${isCurrent
                                        ? (isSolved ? 'text-emerald-900 font-extrabold' : 'text-teal-900 font-extrabold')
                                        : isPast
                                            ? 'text-slate-700'
                                            : 'text-slate-400'
                                        }`}>
                                        {levelTitle}
                                    </span>
                                    <span className={`text-[10px] mt-1 font-semibold ${isCurrent
                                        ? (isSolved ? 'text-emerald-600 font-bold uppercase tracking-wider' : 'text-teal-600 uppercase tracking-wider')
                                        : 'text-slate-400'
                                        }`}>
                                        {isCurrent ? (isSolved ? 'Resolved Here' : 'Active Now') : lvl === 4 ? 'Supreme' : `Level ${lvl}`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Panel for Authority in Workspace Mode */}
                {userRole === 'authority' && issueSourceView === 'authority-dashboard' && (
                    <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                        <ShieldCheck className="text-teal-600" size={20} /> Authority Actions
                                    </h3>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                                        Workspace Action Mode
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm mt-0.5">Take immediate official action on this ticket in your department queue.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onAcknowledge(issue.id)}
                                    disabled={issue.status === 'In Progress' || issue.status === 'Solved'}
                                    className={`rounded-xl text-xs font-bold gap-1.5 ${issue.status === 'In Progress' || issue.status === 'Solved'
                                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                                        : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50 shadow-sm'
                                        }`}
                                >
                                    <CheckCircle size={14} />
                                    {issue.status === 'In Progress' ? 'Acknowledged' : 'Acknowledge'}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onOpenPostUpdate(issue)}
                                    className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200 rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                                >
                                    <MessageSquare size={14} /> Post Update
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onOpenEscalate(issue)}
                                    disabled={(issue.currentLevel || 1) >= 4 || issue.status === 'Solved'}
                                    className={`rounded-xl text-xs font-bold gap-1.5 ${(issue.currentLevel || 1) >= 4 || issue.status === 'Solved'
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                                        : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
                                        }`}
                                >
                                    <Zap size={14} className="text-amber-600" /> Escalate Level
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={() => onSolve(issue.id)}
                                    disabled={issue.status === 'Solved'}
                                    className={`rounded-xl text-xs font-extrabold gap-1.5 shadow-sm ${issue.status === 'Solved'
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 cursor-default border border-emerald-200'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        }`}
                                >
                                    <CheckCheck size={15} />
                                    {issue.status === 'Solved' ? 'Resolved' : 'Mark Solved'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {userRole === 'authority' && issueSourceView !== 'authority-dashboard' && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-teal-50/90 via-emerald-50/50 to-teal-50/90 border border-teal-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                                <ShieldCheck size={22} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-800">Public Campus Issue View</p>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full">
                                        Read-Only (Student View)
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                    You are viewing this grievance as students see it. Switch to your Authority Workspace to manage this ticket.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={onSwitchToWorkspaceView}
                            className="bg-[#115e59] hover:bg-[#0f524e] text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                        >
                            <ShieldCheck size={14} /> Take Official Action on Ticket &rarr;
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">Department</p>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{issue.department}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">Category</p>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{issue.category}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">Specific Issue</p>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{issue.specificIssue}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">Location</p>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{issue.location}</p>
                    </div>
                </div>

                <div className="mb-10">
                    <p className="text-sm text-slate-400 font-bold tracking-wider mb-3">DESCRIPTION</p>
                    <div className="text-slate-700 bg-slate-50 p-5 md:p-8 rounded-2xl border border-slate-100 text-lg leading-relaxed shadow-inner">
                        {issue.description}
                    </div>
                </div>

                {issue.imageUrl && (
                    <div className="mb-10">
                        <p className="text-sm text-slate-400 font-bold tracking-wider mb-3">ATTACHED EVIDENCE</p>
                        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm inline-block w-full sm:w-auto sm:max-w-xl group bg-slate-50">
                            <img src={issue.imageUrl} alt={`Evidence for ${issue.title}`} loading="lazy" className="w-full max-h-[400px] object-contain" />
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-100 pt-8">
                    {issue.status !== 'Solved' ? (
                        <button
                            onClick={() => onToggleUpvote(issue.id)}
                            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all border cursor-pointer ${issue.isLiked
                                ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
                                }`}
                        >
                            <ThumbsUp size={20} className={issue.isLiked ? 'fill-teal-700 text-teal-700' : ''} />
                            {issue.isLiked ? 'Upvoted' : 'Upvote'} ({issue.upvotes})
                        </button>
                    ) : (
                        <div className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <CheckCircle size={18} className="text-emerald-600" /> Solved • Upvotes Closed ({issue.upvotes})
                        </div>
                    )}
                    <button
                        onClick={() => setIsCommenting(true)}
                        className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent px-8 py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
                    >
                        <MessageSquare size={20} /> Add Comment
                    </button>
                </div>

                {/* Comments Thread */}
                <div className="mt-10 border-t border-slate-100 pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-slate-400 font-bold tracking-wider uppercase">Comments & Official Updates</p>
                        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-teal-200/80">
                            <MessageSquare size={13} /> Public Campus Thread
                        </span>
                    </div>

                    <div className="space-y-3 mb-6">
                        {issue.comments && issue.comments.map((c, i) => (
                            <div key={i} className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">{c.author[0]}</div>
                                    <p className="text-sm font-bold text-slate-800">{c.author}</p>
                                    <span className="text-slate-400 font-medium text-xs ml-auto">{c.time}</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed pl-9">{c.text}</p>
                            </div>
                        ))}
                        {(!issue.comments || issue.comments.length === 0) && (
                            <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                <MessageSquare size={28} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 font-semibold">No messages yet.</p>
                            </div>
                        )}
                    </div>

                    {isCommenting && (
                        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Type your comment or update here..."
                                className="w-full mb-4 resize-none h-24"
                            />
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setIsCommenting(false)} className="px-5 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <Button onClick={handleCommentSubmit} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2 rounded-lg">Post Comment</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}