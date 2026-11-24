import React, { useState } from 'react';
import { Mail, KeyRound, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { signInWithEmail, directAdminLogin } from '../../lib/authService';

interface LoginScreenProps {
    onSwitchToRegister: () => void;
    onSwitchToForgotPassword: () => void;
    onSuccess: () => void;
}

export function LoginScreen({ onSwitchToRegister, onSwitchToForgotPassword, onSuccess }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [directLoading, setDirectLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        try {
            await signInWithEmail(email, password);
            onSuccess();
        } catch (err: any) {
            setErrorMsg(err.message || 'Invalid credentials or network failure.');
        } finally {
            setLoading(false);
        }
    };

    const handleDirectEntry = async () => {
        setErrorMsg(null);
        setDirectLoading(true);
        try {
            await directAdminLogin();
            onSuccess();
        } catch (err: any) {
            setErrorMsg(err.message || 'Direct entry failed. Please try again.');
        } finally {
            setDirectLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-[Inter,sans-serif]">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 smooth-enter-up">
                {/* Header Logo */}
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-md shadow-teal-600/20">
                    R
                </div>
                <h1 className="text-2xl font-black text-slate-800 text-center mb-1">Welcome Back</h1>
                <p className="text-slate-500 text-xs text-center mb-5 font-medium">
                    Sign in with your university <span className="font-bold text-teal-700">@jklu.edu.in</span> account.
                </p>

                {/* 1-Click Direct Entry for Rudrapal Singh Shekhawat */}
                <div className="mb-5">
                    <button
                        type="button"
                        disabled={loading || directLoading}
                        onClick={handleDirectEntry}
                        className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 hover:from-slate-900 hover:to-teal-900 text-white p-3.5 rounded-2xl border border-teal-500/30 hover:border-teal-400/60 shadow-lg hover:shadow-teal-500/20 transition-all cursor-pointer flex items-center justify-between group disabled:opacity-50"
                    >
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                                <Zap size={18} className="text-teal-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="font-extrabold text-xs text-white">Direct Entry (Rudrapal)</p>
                                    <ShieldCheck size={13} className="text-teal-400" />
                                </div>
                                <p className="text-[10px] text-teal-300/80 font-medium truncate max-w-[190px]">
                                    rudrapalsinghshekhawat@jklu.edu.in
                                </p>
                            </div>
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-wider bg-teal-600 text-white px-2.5 py-1 rounded-lg group-hover:bg-teal-500 transition-colors shrink-0">
                            {directLoading ? 'Entering...' : '1-Click Enter →'}
                        </span>
                    </button>

                    <div className="relative my-4 flex items-center justify-center">
                        <div className="border-t border-slate-200 w-full" />
                        <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Or enter password
                        </span>
                        <div className="border-t border-slate-200 w-full" />
                    </div>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
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

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700">Password</label>
                            <button
                                type="button"
                                onClick={onSwitchToForgotPassword}
                                className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-teal-600/20 mt-2"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                        <ArrowRight size={16} />
                    </button>
                </form>

                <div className="mt-6 border-t border-slate-100 pt-5 text-center flex flex-col gap-3">
                    <p className="text-xs text-slate-500 font-medium">
                        Don't have a student account?{' '}
                        <button
                            onClick={onSwitchToRegister}
                            className="text-teal-700 font-bold hover:underline cursor-pointer"
                        >
                            Register here
                        </button>
                    </p>

                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
                        <ShieldCheck size={14} className="text-amber-600 shrink-0" />
                        <span>Authority login uses the same portal credentials</span>
                    </div>
                </div>
            </div>
        </div>
    );
}