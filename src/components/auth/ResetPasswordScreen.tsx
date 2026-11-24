import React, { useState } from 'react';
import { KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { updateUserPassword } from '../../lib/authService';

interface ResetPasswordScreenProps {
    onSuccess: () => void;
}

export function ResetPasswordScreen({ onSuccess }: ResetPasswordScreenProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (newPassword.length < 6) {
            setErrorMsg('New password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await updateUserPassword(newPassword);
            setSuccessMsg('Your password has been reset successfully! Redirecting...');
            setTimeout(() => {
                onSuccess();
            }, 1200);
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to update password. Please request a new recovery link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-[Inter,sans-serif]">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 smooth-enter-up">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-md shadow-teal-600/20">
                    R
                </div>
                <h1 className="text-2xl font-black text-slate-800 text-center mb-1">Set New Password</h1>
                <p className="text-slate-500 text-xs text-center mb-6 font-medium">
                    Enter your new secure password for ResolveIt.
                </p>

                {errorMsg && (
                    <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} className="shrink-0 text-teal-600" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSetPassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                        <div className="relative">
                            <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-teal-600/20 mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save & Sign In'}
                        <ArrowRight size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
