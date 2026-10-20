import { Menu, Search, Bell, RefreshCw, ShieldCheck, User, MessageSquare, AlertCircle, LogOut } from 'lucide-react';
import type { IssueNotification, UserRole } from '../../types/issue';

interface NavbarProps {
    userRole: UserRole | null;
    onToggleRole: () => void;
    currentView: string;
    navigateTo: (view: string) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    searchOpen: boolean;
    setSearchOpen: (open: boolean) => void;
    notifications: IssueNotification[];
    notificationsOpen: boolean;
    setNotificationsOpen: (open: boolean) => void;
    onClearNotifications: () => void;
    userMenuOpen: boolean;
    setUserMenuOpen: (open: boolean) => void;
    onOpenSidebar: () => void;
    onOpenProfile: () => void;
    onOpenFeedback: () => void;
    onOpenReportBug: () => void;
    onLogout: () => void;
}

export function Navbar({
    userRole,
    onToggleRole,
    currentView,
    navigateTo,
    searchQuery,
    setSearchQuery,
    searchOpen,
    setSearchOpen,
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    onClearNotifications,
    userMenuOpen,
    setUserMenuOpen,
    onOpenSidebar,
    onOpenProfile,
    onOpenFeedback,
    onOpenReportBug,
    onLogout,
}: NavbarProps) {
    return (
        <nav className="bg-[#115e59] h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-lg shadow-teal-900/20" style={{ backgroundImage: 'linear-gradient(135deg, #115e59 0%, #0d4f4a 100%)' }}>
            {(notificationsOpen || userMenuOpen || searchOpen) && (
                <div className="fixed inset-0 z-20" onClick={() => { setNotificationsOpen(false); setUserMenuOpen(false); setSearchOpen(false); }}></div>
            )}

            <div className="flex items-center gap-4 relative z-30">
                <button onClick={onOpenSidebar} className="text-white hover:bg-white/10 p-1.5 rounded-md transition-colors">
                    <Menu size={26} />
                </button>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('dashboard')}>
                    <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                    <span className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
                        Resolvelt
                        {userRole && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleRole();
                                }}
                                title="Click to toggle between Student and Authority"
                                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white border border-white/20 uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${userRole === 'authority' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                                {userRole}
                                <RefreshCw size={10} className="opacity-75" />
                            </button>
                        )}
                        {userRole === 'authority' && currentView === 'authority-dashboard' && (
                            <span title="Authority Workspace" className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 shadow-xs ml-1">
                                <ShieldCheck size={14} className="text-amber-300" />
                                Workspace
                            </span>
                        )}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-5 text-white relative z-30">
                <div className={`hidden sm:flex items-center rounded-full transition-all duration-300 border overflow-hidden ${searchOpen ? 'w-64 border-teal-500 bg-white shadow-sm' : 'w-10 border-transparent bg-transparent hover:bg-white/10'}`}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`bg-white text-teal-800 placeholder-teal-600/50 text-sm outline-none transition-all duration-300 ${searchOpen ? 'w-full px-4 py-1.5 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
                    />
                    <button className={`p-2 rounded-full transition-colors flex-shrink-0 ${searchOpen ? 'text-teal-600 hover:text-teal-800' : 'text-white hover:text-teal-200'}`} onClick={() => { setSearchOpen(!searchOpen); setNotificationsOpen(false); setUserMenuOpen(false); }}>
                        <Search size={20} />
                    </button>
                </div>

                <button className="hover:text-teal-200 transition-colors relative" onClick={() => { setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false); setSearchOpen(false); }}>
                    <Bell size={22} />
                    {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#115e59] pulse-ring"></span>}
                </button>

                <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); setSearchOpen(false); }} className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center font-bold text-sm border-2 border-teal-500/50 hover:from-teal-400 hover:to-teal-600 transition-all shadow-md shadow-teal-900/30">
                    {userRole === 'authority' ? 'RS' : 'HV'}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                    <div className="absolute top-12 right-12 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden smooth-enter-up">
                        <div className="bg-slate-50 px-4 py-3 border-b font-bold text-slate-700 flex justify-between items-center">
                            Notifications
                            {notifications.length > 0 && <span className="text-xs font-normal text-teal-600 cursor-pointer hover:underline" onClick={onClearNotifications}>Clear All</span>}
                        </div>
                        <div className="max-h-80 overflow-y-auto text-slate-700">
                            {notifications.length > 0 ? notifications.map(notif => (
                                <div key={notif.id} className="p-4 border-b hover:bg-slate-50 cursor-pointer">
                                    <p className="font-semibold text-sm">{notif.title}</p>
                                    <p className="text-xs text-slate-500 mt-1 leading-snug">{notif.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">{notif.time}</p>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-500">
                                    <Bell size={32} className="mx-auto text-slate-300 mb-3 opacity-50" />
                                    <p className="text-sm font-medium">No new notifications</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                    <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden smooth-enter-up">
                        <div className="p-4 border-b">
                            <p className="font-bold text-slate-800">{userRole === 'authority' ? 'Rohit Sir' : 'Hritvika Vashistha'}</p>
                            <p className="text-xs text-slate-500">{userRole === 'authority' ? 'rohit@jklu.edu.in' : 'hritvikavashistha@jklu.edu.in'}</p>
                        </div>
                        <div className="p-2 text-slate-700">
                            <button
                                onClick={() => {
                                    onToggleRole();
                                    setUserMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-teal-50 hover:text-teal-700 transition-colors rounded-lg text-sm font-medium"
                            >
                                <span className="flex items-center gap-2.5">
                                    <RefreshCw size={15} /> Switch Role
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                                    {userRole === 'authority' ? 'To Student' : 'To Authority'}
                                </span>
                            </button>
                            <div className="h-px bg-slate-200 my-1"></div>
                            <button onClick={() => { onOpenProfile(); setUserMenuOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-teal-50 hover:text-teal-700 transition-colors rounded-lg text-sm font-medium">
                                <User size={16} /> Profile
                            </button>
                            <button onClick={() => { onOpenFeedback(); setUserMenuOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-teal-50 hover:text-teal-700 transition-colors rounded-lg text-sm font-medium">
                                <MessageSquare size={16} /> Feedback
                            </button>
                            <button onClick={() => { onOpenReportBug(); setUserMenuOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-teal-50 hover:text-teal-700 transition-colors rounded-lg text-sm font-medium">
                                <AlertCircle size={16} /> Report
                            </button>
                            <div className="h-px bg-slate-200 my-1"></div>
                            <button onClick={onLogout} className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                                <LogOut size={16} /> Log Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}