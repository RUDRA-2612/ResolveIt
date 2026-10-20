import { X, Zap, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Issue } from '../../types/issue';
import { DEPARTMENT_LEVELS } from '../../taxonomy';

interface EscalationModalProps {
    open: boolean;
    onClose: () => void;
    actionTicket: Issue | null;
    escalateReason: string;
    setEscalateReason: (reason: string) => void;
    escalateNote: string;
    setEscalateNote: (note: string) => void;
    onSubmit: () => void;
}

export function EscalationModal({
    open,
    onClose,
    actionTicket,
    escalateReason,
    setEscalateReason,
    escalateNote,
    setEscalateNote,
    onSubmit,
}: EscalationModalProps) {
    if (!open || !actionTicket) return null;

    const getAuthorityTitle = (dept: string, level: number = 1): string => {
        if (DEPARTMENT_LEVELS && DEPARTMENT_LEVELS[dept] && DEPARTMENT_LEVELS[dept][level]) {
            return DEPARTMENT_LEVELS[dept][level];
        }
        if (level === 4) return "VC (Vice-Chancellor)";
        if (level === 3) return "Department Head / Dean";
        if (level === 2) return "Assistant In-Charge";
        return "Department Representative";
    };

    const currentLvl = actionTicket.currentLevel || 1;
    const nextLvl = Math.min(4, currentLvl + 1);
    const prevTitle = getAuthorityTitle(actionTicket.department, currentLvl);
    const nextTitle = getAuthorityTitle(actionTicket.department, nextLvl);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 smooth-overlay" onClick={onClose}>
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200/80 relative smooth-enter" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Zap size={20} className="fill-amber-500" />
                    </div>
                    <div className="min-w-0 pr-6">
                        <h3 className="text-lg font-bold text-slate-900">Escalate Ticket</h3>
                        <p className="text-xs text-slate-500 font-medium truncate">{actionTicket.id} • {actionTicket.title}</p>
                    </div>
                </div>

                <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 mb-5 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-8 h-8 rounded-xl bg-slate-200/80 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                            L{currentLvl}
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current</p>
                            <p className="text-xs font-semibold text-slate-700 truncate">{prevTitle}</p>
                        </div>
                    </div>

                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <ArrowRight size={13} className="stroke-[2.5]" />
                    </div>

                    <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                        <div className="min-w-0 text-right">
                            <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Escalate To</p>
                            <p className="text-xs font-bold text-slate-900 truncate">{nextTitle}</p>
                        </div>
                        <span className="w-8 h-8 rounded-xl bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            L{nextLvl}
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Reason for Escalation</label>
                    <Input
                        type="text"
                        value={escalateReason}
                        onChange={(e) => setEscalateReason(e.target.value)}
                        placeholder="Type reason for escalation..."
                        className="w-full h-10 rounded-xl text-sm text-slate-800 border-slate-200 focus-visible:ring-amber-500"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {['SLA Breached', 'Budget Approval Required', 'Staff Shortage', 'Campus Emergency'].map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setEscalateReason(tag)}
                                className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 border border-slate-200/60 transition-colors"
                            >
                                + {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Note (Optional)</label>
                    <Input
                        type="text"
                        value={escalateNote}
                        onChange={(e) => setEscalateNote(e.target.value)}
                        placeholder="Add brief remarks or context..."
                        className="w-full h-10 rounded-xl text-sm text-slate-800 border-slate-200 focus-visible:ring-amber-500"
                    />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                    <Button variant="outline" onClick={onClose} className="rounded-xl font-semibold h-10 px-4 text-slate-600">
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold h-10 px-4 gap-2 shadow-sm shadow-amber-600/20">
                        <Zap size={14} className="fill-white" />
                        Escalate to L{nextLvl}
                    </Button>
                </div>
            </div>
        </div>
    );
}