import React, { useState } from 'react';
import { Mail, KeyRound, User, AlertCircle, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { signUpStudentWithEmail } from '../../lib/authService';

interface RegisterScreenProps {
    onSwitchToLogin: () => void;
    onSuccess: () => void;
}

export function RegisterScreen({ onSwitchToLogin, onSuccess }: RegisterScreenProps) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            await signUpStudentWithEmail(email, password, fullName);
            onSuccess();
        } catch (err: any) {
            setErrorMsg(err.message || 'Registration failed. Check email or network connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-[Inter,sans-serif]">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 smooth-enter-up">
                {/* Header Logo */}
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-md shadow-teal-600/20">
                    R
                </div>
                <h1 className="text-2xl font-black text-slate-800 text-center mb-1">Create Student Account</h1>
                <p className="text-slate-500 text-xs text-center mb-5 font-medium">
                    Register with your institutional <span className="font-bold text-teal-700">@jklu.edu.in</span> email.
                </p>

                {/* Lock Notice: Student Only */}
                <div className="mb-5 p-3 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                            <User size={15} />
                        </div>
                        <div>
                            <p className="text-xs font-extrabold text-teal-900">Account Role: Student</p>
                            <p className="text-[10px] text-teal-700 font-medium">Standard grievance reporting & upvoting access</p>
                        </div>
                    </div>
                    <Lock size={15} className="text-teal-600 shrink-0" />
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-3.5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter name"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">University Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="youremail@jklu.edu.in"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <CheckCircle2 size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-teal-600/20 mt-3"
                    >
                        {loading ? 'Creating Account...' : 'Register Account'}
                        <ArrowRight size={16} />
                    </button>
                </form>

                <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                        Already registered?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="text-teal-700 font-bold hover:underline cursor-pointer"
                        >
                            Sign in to your account
                        </button>
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-3">
                        Note: Authority and Admin accounts are assigned via system administrator provisioning.
                    </p>
                </div>
            </div>
        </div>
    );
}