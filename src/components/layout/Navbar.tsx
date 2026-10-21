import { useNavigate, useLocation } from 'react-router-dom';
import {
    Search,
    Bell,
    Menu,
    User,
    ShieldCheck,
    LogOut,
    X,
    MessageSquarePlus,
    Bug,
    Trash2,
} from 'lucide-react';
import type { UserRole, IssueNotification } from '../../types/issue';

interface NavbarProps {
    userRole: UserRole;
    onToggleRole: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchOpen: boolean;
    setSearchOpen: (open: boolean) => void;
    notifications: IssueNotification[];
    notificationsOpen: boolean;
    setNotificationsOpen: (open: boolean) => void;
    onClearNotifications: () => void;
    userMenuOpen: boolean;
    setUserMenuOpen: (open: boolean) => void;
    userName: string;
    userEmail: string;
    userInitials: string;
    onOpenSidebar: () => void;
    onOpenProfile: () => void;
    onOpenFeedback: () => void;
    onOpenReportBug: () => void;
    onLogout: () => void;
}

export function Navbar({
    userRole,
    onToggleRole,
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
    userName,
    userEmail,
    userInitials,
    onOpenSidebar,
    onOpenProfile,
    onOpenFeedback,
    onOpenReportBug,
    onLogout,
}: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const unreadCount = notifications.filter((n) => !(n.isRead ?? !n.unread)).length;

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

                {/* Left: Mobile Drawer Button & Brand */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenSidebar}
                        className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Open Sidebar"
                    >
                        <Menu size={20} />
                    </button>

                    <div
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                    >
                        <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-teal-600/20">
                            R
                        </div>
                        <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                            Resolve<span className="text-teal-600">It</span>
                        </span>
                    </div>
                </div>

                {/* Center: Search Bar (Shows on Dashboard) */}
                {location.pathname === '/dashboard' && (
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
                        <div className="relative w-full">
                            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search complaints, categories, or locations..."
                                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-teal-500/30 rounded-2xl pl-10 pr-9 py-2 text-xs font-semibold placeholder:text-slate-400 outline-none transition-all focus:ring-4 focus:ring-teal-500/10"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Right Action Icons & User Dropdown */}
                <div className="flex items-center gap-2 sm:gap-3 ml-auto">

                    {/* Mobile Search Toggle */}
                    {location.pathname === '/dashboard' && (
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            <Search size={19} />
                        </button>
                    )}

                    {/* Notifications Dropdown Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setNotificationsOpen(!notificationsOpen);
                                setUserMenuOpen(false);
                            }}
                            className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors relative cursor-pointer"
                        >
                            <Bell size={19} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                            )}
                        </button>

                        {/* Notifications Modal Popover */}
                        {notificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 smooth-enter-up">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-extrabold text-slate-800">Notifications</h4>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 text-[10px] font-black bg-teal-50 text-teal-700 rounded-full">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={onClearNotifications}
                                            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <Trash2 size={12} /> Clear all
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-3 rounded-xl border transition-all text-xs ${n.isRead ?? !n.unread ? 'bg-slate-50/60 border-slate-100' : 'bg-teal-50/40 border-teal-100'
                                                    }`}
                                            >
                                                <p className="font-bold text-slate-800 mb-0.5">{n.title}</p>
                                                <p className="text-slate-500 font-medium leading-relaxed">{n.message}</p>
                                                <span className="text-[10px] text-slate-400 font-bold block mt-1.5">{n.timestamp ?? n.time}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 text-xs font-medium">
                                            No notifications right now
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile Menu Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setUserMenuOpen(!userMenuOpen);
                                setNotificationsOpen(false);
                            }}
                            className="flex items-center gap-2.5 p-1 pl-2.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                            <div className="text-left hidden sm:block">
                                <p className="text-xs font-extrabold text-slate-800 leading-none">{userName}</p>
                                <p className="text-[10px] font-bold text-teal-700 mt-0.5">
                                    {userRole === 'authority' ? 'Authority' : 'Student'}
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                {userInitials}
                            </div>
                        </button>

                        {/* Profile Dropdown Items */}
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2.5 smooth-enter-up">
                                <div className="px-3 py-2.5 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                                    <p className="text-xs font-extrabold text-slate-800 truncate">{userName}</p>
                                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{userEmail}</p>
                                </div>

                                <button
                                    onClick={() => { setUserMenuOpen(false); onOpenProfile(); }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer mb-0.5"
                                >
                                    <User size={15} className="text-slate-400" /> View Profile
                                </button>

                                <button
                                    onClick={() => { setUserMenuOpen(false); onToggleRole(); }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-teal-700 hover:bg-teal-50 flex items-center gap-2.5 transition-colors cursor-pointer mb-0.5"
                                >
                                    <ShieldCheck size={15} className="text-teal-600" /> Switch to {userRole === 'authority' ? 'Student' : 'Authority'}
                                </button>

                                <button
                                    onClick={() => { setUserMenuOpen(false); onOpenFeedback(); }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer mb-0.5"
                                >
                                    <MessageSquarePlus size={15} className="text-slate-400" /> Give Feedback
                                </button>

                                <button
                                    onClick={() => { setUserMenuOpen(false); onOpenReportBug(); }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer mb-1"
                                >
                                    <Bug size={15} className="text-slate-400" /> Report a Bug
                                </button>

                                <div className="border-t border-slate-100 pt-1">
                                    <button
                                        onClick={() => { setUserMenuOpen(false); onLogout(); }}
                                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                        <LogOut size={15} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Mobile Search Input Expansion */}
            {searchOpen && location.pathname === '/dashboard' && (
                <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100 bg-white">
                    <div className="relative w-full">
                        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search complaints..."
                            className="w-full bg-slate-100 border border-transparent rounded-2xl pl-10 pr-9 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-teal-500/30"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-2.5 text-slate-400"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}