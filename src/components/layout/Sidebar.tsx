import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Ticket, PlusCircle, ShieldCheck, X } from 'lucide-react'
import type { UserRole } from '../../types/issue'

interface SidebarProps {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    userRole: UserRole
}

export function Sidebar({ sidebarOpen, setSidebarOpen, userRole }: SidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()

    const navItems = [
        { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'recent-reported', path: '/recent-reported', label: 'My Tickets', icon: Ticket },
        { id: 'report', path: '/report', label: 'Report Issue', icon: PlusCircle },
    ]

    if (userRole === 'authority') {
        navItems.push({ id: 'authority-dashboard', path: '/authority-dashboard', label: 'Authority Workspace', icon: ShieldCheck })
    }

    const handleNavigate = (path: string) => {
        setSidebarOpen(false)
        navigate(path)
    }

    if (!sidebarOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer */}
            <div className="relative flex-1 max-w-xs w-full bg-white p-6 flex flex-col justify-between shadow-2xl">
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                            Resolve<span className="text-teal-600">It</span>
                        </span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${isActive
                                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-teal-600' : 'text-slate-400'} />
                                    {item.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </div>
    )
}