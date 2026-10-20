import { CheckCircle, AlertCircle, Clock, MessageSquare, ArrowUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Issue } from '../../types/issue';

interface IssueCardProps {
    issue: Issue;
    onClick: () => void;
    onUpvote: (e: React.MouseEvent) => void;
}

export function IssueCard({ issue, onClick, onUpvote }: IssueCardProps) {
    return (
        <Card
            onClick={onClick}
            className={`card-hover cursor-pointer group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:border-teal-300 ${issue.statusColor === 'emerald' ? 'card-accent-emerald' :
                    issue.statusColor === 'blue' ? 'card-accent-blue' :
                        issue.statusColor === 'amber' ? 'card-accent-amber' :
                            'card-accent-rose'
                }`}
        >
            <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {issue.imageUrl && (
                        <img src={issue.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-100 hidden sm:block" />
                    )}
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-bold text-slate-800 group-hover:text-teal-700 transition-colors leading-snug mb-2">
                            {issue.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></div>
                                <span className="truncate">{issue.category}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></div>
                                <span className="truncate">{issue.department}</span>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 shrink-0">
                        <Badge variant="outline" className={`shrink-0 self-start gap-1 px-3 py-1 rounded-full text-xs font-bold border ${issue.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                issue.statusColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                    issue.statusColor === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                        'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                            {issue.status === 'Solved' && <CheckCircle size={12} />}
                            {issue.status === 'Seen' && <CheckCircle size={12} className="opacity-70" />}
                            {issue.status === 'Not Started' && <AlertCircle size={12} />}
                            {issue.status}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-1">
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">{issue.description}</p>
                <div className="text-xs font-bold tracking-wide flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={13} /> {issue.time.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-3">
                        {issue.comments && issue.comments.length > 0 && (
                            <span className="flex items-center gap-1 text-slate-400">
                                <MessageSquare size={13} /> {issue.comments.length}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={onUpvote}
                            disabled={issue.status === 'Solved'}
                            title={issue.status === 'Solved' ? 'Issue solved · Upvotes closed' : issue.isLiked ? 'Remove upvote' : 'Upvote problem'}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${issue.status === 'Solved'
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                                    : issue.isLiked
                                        ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs hover:bg-teal-100 cursor-pointer'
                                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 cursor-pointer'
                                }`}
                        >
                            <ArrowUp size={13} className={issue.isLiked ? 'text-teal-600 font-extrabold' : ''} /> {issue.upvotes}
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}