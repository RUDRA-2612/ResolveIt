import { X, ArrowUp, Clock, ShieldCheck } from 'lucide-react';
import type { UserRole } from '../../types/issue';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    currentView: string;
    navigateTo: (view: string) => void;
    userRole: UserRole | null;
}

export function Sidebar({ sidebarOpen, setSidebarOpen, currentView, navigateTo, userRole }: SidebarProps) {
    return (
        <>
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 smooth-overlay" onClick={() => setSidebarOpen(false)}></div>
            )}

            <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="bg-gradient-to-b from-[#115e59] to-[#0f4f4a] h-16 flex items-center justify-between px-5 text-white">
                    <div className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
                        <span className="font-extrabold text-lg tracking-tight">Resolvelt</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 pt-2 pb-1">Navigation</p>
                    <button onClick={() => { navigateTo('dashboard'); setSidebarOpen(false); }} className={`p-3 font-semibold rounded-xl text-left transition-all flex items-center gap-3 ${currentView === 'dashboard' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentView === 'dashboard' ? 'bg-teal-100' : 'bg-slate-100'}`}><ArrowUp size={16} className="rotate-90" /></div>
                        Home
                    </button>
                    <button onClick={() => { navigateTo('recent-reported'); setSidebarOpen(false); }} className={`p-3 font-semibold rounded-xl text-left transition-all flex items-center gap-3 ${currentView === 'recent-reported' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentView === 'recent-reported' ? 'bg-teal-100' : 'bg-slate-100'}`}><Clock size={16} /></div>
                        My Tickets
                    </button>
                    {userRole === 'authority' && (
                        <>
                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                            <button onClick={() => { navigateTo('authority-dashboard'); setSidebarOpen(false); }} className={`p-3 font-semibold rounded-xl text-left transition-all flex items-center gap-3 ${currentView === 'authority-dashboard' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentView === 'authority-dashboard' ? 'bg-teal-100' : 'bg-slate-100'}`}><ShieldCheck size={16} /></div>
                                Authority Workspace
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}