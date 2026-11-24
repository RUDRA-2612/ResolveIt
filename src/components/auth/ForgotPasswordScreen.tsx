import React, { useState } from 'react';
import { Mail, KeyRound, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Hash } from 'lucide-react';
import { sendPasswordResetEmail, verifyPasswordResetOtp, updateUserPassword } from '../../lib/authService';

interface ForgotPasswordScreenProps {
    onBackToLogin: () => void;
    onSuccess: () => void;
}

export function ForgotPasswordScreen({ onBackToLogin, onSuccess }: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [resetting, setResetting] = useState(false);

    // Step 1: Send reset email
    const handleSendResetEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        setSending(true);

        try {
            await sendPasswordResetEmail(email.trim());
            setEmailSent(true);
            setSuccessMsg(`Reset instructions sent to ${email.trim()}. Check your inbox or enter the verification code below.`);
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to send password reset email. Please verify the email address.');
        } finally {
            setSending(false);
        }
    };

    // Step 2: Verify OTP and reset password directly
    const handleVerifyAndReset = async (e: React.FormEvent) => {
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

        if (!otpCode.trim()) {
            setErrorMsg('Please enter the verification code / token from your email.');
            return;
        }

        setResetting(true);

        try {
            await verifyPasswordResetOtp(email.trim(), otpCode.trim());
            await updateUserPassword(newPassword);
            setSuccessMsg('Password updated successfully! Logging you in...');
            setTimeout(() => {
                onSuccess();
            }, 1200);
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to reset password. Please check the OTP code and try again.');
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-[Inter,sans-serif]">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 smooth-enter-up">
                {/* Header Logo */}
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-md shadow-teal-600/20">
                    R
                </div>
                <h1 className="text-2xl font-black text-slate-800 text-center mb-1">Reset Password</h1>
                <p className="text-slate-500 text-xs text-center mb-6 font-medium">
                    Recover your institutional <span className="font-bold text-teal-700">@jklu.edu.in</span> account.
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

                {!emailSent ? (
                    /* Step 1: Enter email to receive reset instructions */
                    <form onSubmit={handleSendResetEmail} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">University Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="student@jklu.edu.in"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-teal-600/20 mt-2 disabled:opacity-50"
                        >
                            {sending ? 'Sending Instructions...' : 'Send Reset Link / Code'}
                            <ArrowRight size={16} />
                        </button>
                    </form>
                ) : (
                    /* Step 2: Enter OTP code and new password */
                    <form onSubmit={handleVerifyAndReset} className="space-y-3.5">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-2">
                            <p className="text-[11px] text-slate-600 font-medium">
                                Email: <span className="font-bold text-slate-900">{email}</span>
                            </p>
                            <button
                                type="button"
                                onClick={() => setEmailSent(false)}
                                className="text-[11px] font-bold text-teal-700 hover:underline mt-0.5"
                            >
                                Change email
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Verification Code / OTP</label>
                            <div className="relative">
                                <Hash size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="Enter 6-digit code from email"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all tracking-wider"
                                />
                            </div>
                        </div>

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
                            disabled={resetting}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-teal-600/20 mt-2 disabled:opacity-50"
                        >
                            {resetting ? 'Updating Password...' : 'Set New Password'}
                            <ShieldCheck size={16} />
                        </button>
                    </form>
                )}

                {/* Back to Login */}
                <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                    <button
                        onClick={onBackToLogin}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                        <ArrowLeft size={14} /> Back to Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}
