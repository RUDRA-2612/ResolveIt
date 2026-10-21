import { X, ShieldCheck, User, MessageSquare, Send, AlertTriangle, ThumbsUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Issue, UserRole } from '../../types/issue';

export function RoleSelectionOverlay({
    open,
    onSelectRole,
}: {
    open: boolean;
    onSelectRole: (role: UserRole) => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md smooth-enter">
            <div className="bg-white/95 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/60 text-center relative overflow-hidden smooth-enter-up">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600"></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/25">
                        <ShieldCheck size={28} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-1.5 tracking-tight">Welcome to Resolvelt</h2>
                    <p className="text-slate-500 mb-8 font-medium text-sm">Select your account type to continue.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onSelectRole('student')}
                            className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-teal-400 hover:bg-teal-50/80 transition-all duration-200 group"
                        >
                            <div className="w-13 h-13 bg-slate-100 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center mb-3.5 transition-all duration-200">
                                <User size={26} className="text-slate-500 group-hover:text-teal-700" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-teal-800 text-sm">Student</span>
                        </button>

                        <button
                            onClick={() => onSelectRole('authority')}
                            className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-orange-400 hover:bg-orange-50/80 transition-all duration-200 group"
                        >
                            <div className="w-13 h-13 bg-slate-100 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center mb-3.5 transition-all duration-200">
                                <ShieldCheck size={26} className="text-slate-500 group-hover:text-orange-600" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-orange-800 text-sm">Authority</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
    userRole: UserRole | null;
    userName?: string;
    userEmail?: string;
    userInitials?: string;
}

export function ProfileModal({
    open,
    onClose,
    userRole,
    userName = 'User',
    userEmail = '',
    userInitials = 'U',
}: ProfileModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 smooth-overlay" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative smooth-enter" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
                <h3 className="text-xl font-bold text-teal-800 mb-6 border-b pb-2">
                    {userRole === 'authority' ? 'Authority Profile' : 'Student Profile'}
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 font-black text-white">
                            {userInitials}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">FULL NAME</p>
                        <p className="font-semibold text-slate-700">{userName}</p>
                    </div>
                    <div style={{ display: 'none' }}>
                        <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">{userRole === 'authority' ? 'DEPARTMENT' : 'ROLL NUMBER'}</p>
                        <p className="font-semibold text-slate-700">{userRole === 'authority' ? 'Campus Administration' : '2025BTECH259'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">EMAIL ID</p>
                        <p className="font-semibold text-slate-700">{userEmail || (userRole === 'authority' ? 'authority@jklu.edu.in' : 'hritvikavashistha@jklu.edu.in')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 smooth-overlay" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative smooth-enter" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                <h3 className="text-xl font-bold text-teal-800 mb-4 border-b pb-2">Submit Feedback</h3>
                <textarea className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 h-32 resize-none mb-4" placeholder="Share your feedback here..."></textarea>
                <button onClick={onClose} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-lg transition-colors">Submit</button>
            </div>
        </div>
    );
}

export function ReportBugModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 smooth-overlay" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative smooth-enter" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                <h3 className="text-xl font-bold text-teal-800 mb-2 border-b pb-2">Report Bug</h3>
                <textarea className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 h-32 resize-none mb-4" placeholder="Describe the bug..."></textarea>
                <button onClick={onClose} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-lg transition-colors">Submit</button>
            </div>
        </div>
    );
}

export function PostUpdateModal({
    open,
    onClose,
    actionTicket,
    postUpdateText,
    setPostUpdateText,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    actionTicket: Issue | null;
    postUpdateText: string;
    setPostUpdateText: (val: string) => void;
    onSubmit: () => void;
}) {
    if (!open || !actionTicket) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 smooth-overlay" onClick={onClose}>
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative smooth-enter" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"><X size={20} /></button>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><MessageSquare size={20} /></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Post Official Update</h3>
                        <p className="text-xs text-slate-500 font-mono font-medium">{actionTicket.id} • {actionTicket.title}</p>
                    </div>
                </div>

                <Textarea
                    value={postUpdateText}
                    onChange={(e) => setPostUpdateText(e.target.value)}
                    placeholder="e.g. Technician dispatched with replacement parts..."
                    className="w-full mb-6 min-h-[120px] rounded-xl border-slate-200 text-slate-700 font-medium"
                />

                <div className="flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
                    <Button onClick={onSubmit} disabled={!postUpdateText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold gap-2">
                        <Send size={15} /> Publish Update
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function DuplicateModal({
    open,
    onClose,
    matchedDuplicate,
    onSubmitAnyway,
    onUpvoteDuplicate,
    submitError,
    isSubmitting = false,
}: {
    open: boolean;
    onClose: () => void;
    matchedDuplicate: Issue | null;
    onSubmitAnyway: () => void | Promise<void>;
    onUpvoteDuplicate: () => void;
    submitError?: string | null;
    isSubmitting?: boolean;
}) {
    if (!open || !matchedDuplicate) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 smooth-overlay" onClick={onClose}>
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative smooth-enter" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"><X size={20} /></button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-900">Similar Active Issue Detected!</h3>
                        <p className="text-xs text-orange-700 font-semibold">Help prevent duplicate tickets in the queue</p>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{matchedDuplicate.id}</span>
                        <Badge variant="outline" className="text-xs font-bold bg-white text-teal-700 border-teal-200">{matchedDuplicate.status}</Badge>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{matchedDuplicate.title}</h4>
                    <p className="text-xs text-slate-500 mb-2 font-medium">{matchedDuplicate.location} • {matchedDuplicate.category}</p>
                </div>

                {submitError && <p role="alert" className="mb-4 text-sm font-semibold text-rose-700">{submitError}</p>}

                <div className="flex flex-col sm:flex-row items-center gap-3 justify-end">
                    <Button variant="outline" onClick={() => void onSubmitAnyway()} disabled={isSubmitting} className="w-full sm:w-auto rounded-xl font-bold text-slate-600">
                        {isSubmitting ? 'Submitting…' : 'Submit New Ticket Anyway'}
                    </Button>
                    <Button onClick={onUpvoteDuplicate} disabled={isSubmitting} className="w-full sm:w-auto bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold rounded-xl gap-2">
                        <ThumbsUp size={16} /> Upvote Existing Ticket ({matchedDuplicate.upvotes + 1})
                    </Button>
                </div>
            </div>
        </div>
    );
}