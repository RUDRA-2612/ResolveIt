import { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, PlusCircle, CheckCircle, ArrowUp, Clock, AlertCircle, Loader2, X, User, LogOut, MessageSquare, Camera, ShieldCheck, ThumbsUp, ChevronDown } from 'lucide-react';
import { ISSUE_DATA, DEPARTMENT_BUILDINGS } from './taxonomy';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const CustomSelect = ({ value, onChange, options, placeholder, disabled = false, grouped = false }: any) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={ref}>
      <div 
        onClick={() => setOpen(!open)}
        className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 font-medium cursor-pointer flex justify-between items-center transition-all shadow-sm hover:border-teal-300"
      >
        <span className={!value ? "text-slate-400" : "truncate pr-2"}>{value || placeholder}</span>
        <ChevronDown size={18} className={`text-slate-400 shrink-0 transform transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {grouped ? (
            Object.keys(options).map(group => (
              <div key={group}>
                <div className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10 border-y border-slate-100 first:border-t-0">{group}</div>
                {options[group].map((opt: string) => (
                  <div 
                    key={opt}
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium transition-colors ${value === opt ? 'bg-teal-100 text-teal-800' : 'text-slate-700 hover:bg-teal-100 hover:text-teal-900'}`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            ))
          ) : (
            options.map((opt: string) => (
              <div 
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`px-4 py-3 cursor-pointer text-sm font-medium transition-colors ${value === opt ? 'bg-teal-100 text-teal-800' : 'text-slate-700 hover:bg-teal-100 hover:text-teal-900'}`}
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageUrl);
        setPhotoTaken(true);
        setCameraActive(false);
        stopCamera();
      }
    }
  };
  
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraActive]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [reportBugOpen, setReportBugOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('Top');
  
  const [issues, setIssues] = useState([
    {
      id: 'TKT-142',
      title: 'Mess food quality issue today',
      location: 'Main Mess',
      description: 'The food quality in the main mess was severely degraded today. Several students reported finding insects and the food tasted stale.',
      upvotes: 89,
      status: 'Resolved',
      statusColor: 'emerald',
      time: '1 day ago',
      category: 'Food',
      department: 'Main Mess',
      isLiked: false
    },
    {
      id: 'TKT-134',
      title: 'Wi-Fi completely down in Library',
      location: 'Library',
      description: 'No one is able to connect to the Wi-Fi on the first floor of the library. It has been down since morning and is severely affecting study schedules.',
      upvotes: 45,
      status: 'In Progress',
      statusColor: 'blue',
      time: '4 hours ago',
      category: 'IT',
      department: 'Library',
      isLiked: false
    },
    {
      id: 'TKT-129',
      title: 'AC not working in Room 302',
      location: 'Hostel A',
      description: 'The air conditioner in Room 302 of Hostel A is completely non-functional. Water is leaking from the unit and making the floor wet.',
      upvotes: 12,
      status: 'Pending',
      statusColor: 'rose',
      time: '2 hours ago',
      category: 'Maintenance',
      department: 'Hostel A',
      isLiked: false
    }
  ]);

  const pushModalState = () => {
    window.history.pushState({ view: currentView, modal: true }, '', '');
  };

  // Form states for Report Problem
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [specificIssue, setSpecificIssue] = useState('');
  const [building, setBuilding] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [exactLocation, setExactLocation] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  // Handle Browser Back Button
  useEffect(() => {
    // Set initial state
    if (!window.history.state) {
      window.history.replaceState({ view: 'dashboard' }, '', '/dashboard');
    } else if (window.history.state.view) {
      setCurrentView(window.history.state.view);
    }

    const handlePopState = (e: PopStateEvent) => {
      // Close all modals on back
      setProfileOpen(false);
      setNotificationsOpen(false);
      setUserMenuOpen(false);
      setSidebarOpen(false);
      setSelectedIssue(null);
      setFeedbackOpen(false);
      setReportBugOpen(false);
      setCameraActive(false);
      setSearchOpen(false);

      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
      } else {
        setCurrentView('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: string) => {
    window.history.pushState({ view }, '', `/${view}`);
    setCurrentView(view);
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col">
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setProfileOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setProfileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-teal-800 mb-6 border-b pb-2">Student Profile</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">FULL NAME</p>
                <p className="font-semibold text-slate-700">Rudrapal Singh Shekhawat</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">ROLL NUMBER</p>
                <p className="font-semibold text-slate-700">2025btech105</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">COURSE</p>
                <p className="font-semibold text-slate-700"><span className="text-sm">B.Tech</span> CSE (2nd Year)</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">EMAIL ID</p>
                <p className="font-semibold text-slate-700">rudrapalsinghshekhawat@jklu.edu.in</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setFeedbackOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setFeedbackOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-teal-800 mb-4 border-b pb-2">Submit Feedback</h3>
            <textarea className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 h-32 resize-none mb-4" placeholder="Share your feedback here..."></textarea>
            <button onClick={() => setFeedbackOpen(false)} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-lg transition-colors">Submit</button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportBugOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReportBugOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setReportBugOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-teal-800 mb-2 border-b pb-2">Report</h3>
            <p className="text-sm text-slate-500 mb-4">Are you facing any problems or glitches on the website? Let us know below.</p>
            <textarea className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 h-32 resize-none mb-4" placeholder="Describe the issue you found on the website..."></textarea>
            <button onClick={() => setReportBugOpen(false)} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-lg transition-colors">Submit</button>
          </div>
        </div>
      )}



      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-[#115e59] h-16 flex items-center justify-between px-4 text-white">
          <span className="font-bold text-lg">Menu</span>
          <button onClick={() => setSidebarOpen(false)}><X size={24} /></button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <button onClick={() => { navigateTo('dashboard'); setSidebarOpen(false); }} className={`p-3 font-medium rounded-lg text-left transition-colors ${currentView === 'dashboard' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'}`}>Home</button>
          <div className="h-px bg-teal-100/60 my-1 mx-2"></div>
          <button className="p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-700 font-medium rounded-lg text-left transition-colors">Recent Reported</button>
          <div className="h-px bg-teal-100/60 my-1 mx-2"></div>
          <button className="p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-700 font-medium rounded-lg text-left transition-colors">Admin Panel</button>
          <div className="h-px bg-teal-100/60 my-1 mx-2"></div>
          <button className="p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-700 font-medium rounded-lg text-left transition-colors">Credits</button>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-[#115e59] h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-md">
        
        {/* Dropdown Overlay */}
        {(notificationsOpen || userMenuOpen || searchOpen) && (
          <div className="fixed inset-0 z-20" onClick={() => { setNotificationsOpen(false); setUserMenuOpen(false); setSearchOpen(false); }}></div>
        )}

        <div className="flex items-center gap-4 relative z-30">
          <button onClick={() => { pushModalState(); setSidebarOpen(true); }} className="text-white hover:bg-white/10 p-1.5 rounded-md transition-colors">
            <Menu size={26} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('dashboard')}>
            <div>
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Resolvelt</span>
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
            <button className={`p-2 rounded-full transition-colors flex-shrink-0 ${searchOpen ? 'text-teal-600 hover:text-teal-800' : 'text-white hover:text-teal-200'}`} onClick={() => { if(!searchOpen) { pushModalState(); setSearchOpen(true); setNotificationsOpen(false); setUserMenuOpen(false); } else { setSearchOpen(false); } }}>
              <Search size={20} />
            </button>
          </div>
          
          <button className="hover:text-teal-200 transition-colors relative" onClick={() => { if(!notificationsOpen) pushModalState(); setNotificationsOpen(true); setUserMenuOpen(false); setSearchOpen(false); }}>
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full border border-[#115e59]"></span>
          </button>

          <button onClick={() => { if(!userMenuOpen) pushModalState(); setUserMenuOpen(true); setNotificationsOpen(false); setSearchOpen(false); }} className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center font-bold text-sm border-2 border-teal-600 hover:bg-teal-600 transition-colors">
            RS
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute top-12 right-12 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-2">
              <div className="bg-slate-50 px-4 py-3 border-b font-bold text-slate-700">Notifications</div>
              <div className="max-h-80 overflow-y-auto text-slate-700">
                <div className="p-4 border-b hover:bg-slate-50 cursor-pointer">
                  <p className="font-semibold text-sm">TKT-134 is now In Progress</p>
                  <p className="text-xs text-slate-400 mt-1">10 mins ago</p>
                </div>
                <div className="p-4 hover:bg-slate-50 cursor-pointer">
                  <p className="font-semibold text-sm">New announcement from Warden</p>
                  <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
          )}

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-2">
              <div className="p-4 border-b">
                <p className="font-bold text-slate-800">Rudrapal Singh Shekhawat</p>
              </div>
              <div className="p-2 text-slate-700">
                <button onClick={() => { pushModalState(); setProfileOpen(true); setUserMenuOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-teal-50 hover:text-teal-700 transition-colors rounded-lg text-sm font-medium">
                  <User size={16} /> Profile
                </button>
                <button onClick={() => { pushModalState(); setFeedbackOpen(true); setUserMenuOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-teal-50 hover:text-teal-700 transition-colors rounded-lg text-sm font-medium">
                  <MessageSquare size={16} /> Feedback
                </button>
                <button onClick={() => { pushModalState(); setReportBugOpen(true); setUserMenuOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-teal-50 hover:text-teal-700 transition-colors rounded-lg text-sm font-medium">
                  <AlertCircle size={16} /> Report
                </button>
                <div className="h-px bg-slate-200 my-1"></div>
                <button className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* View Rendering */}
      {currentView === 'dashboard' ? (
        <main className="max-w-4xl mx-auto px-4 pt-10 pb-20 animate-in fade-in duration-300">
          
          <div className="text-center mb-10">
            <p className="text-slate-500 font-medium mb-1">Welcome to</p>
            <h1 className="text-6xl md:text-7xl font-extrabold text-[#0d9488] tracking-tighter mb-2 logo-text">
              Resolvelt
            </h1>
            <p className="text-slate-500 italic">Built by the students, for the students.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-2xl mx-auto mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 relative z-10">Facing an Issue?</h2>
            <p className="text-slate-500 mb-6 relative z-10">
              Report problems across the campus quickly and track them until they are resolved.
            </p>
            <Button 
              size="lg"
              onClick={() => navigateTo('report')} 
              className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-orange-500/30 flex items-center gap-2 mx-auto transition-all transform hover:-translate-y-0.5 relative z-10 text-lg"
            >
              <PlusCircle size={22} />
              Report a Problem
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Recent Campus Issues</h3>
              <div className="bg-slate-200 p-1 rounded-lg flex text-sm font-medium">
                <button onClick={() => setFilterTab('Top')} className={`px-4 py-1.5 rounded-md transition-colors ${filterTab === 'Top' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-teal-50 hover:text-teal-700'}`}>Top</button>
                <button onClick={() => setFilterTab('New')} className={`px-4 py-1.5 rounded-md transition-colors ${filterTab === 'New' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-teal-50 hover:text-teal-700'}`}>New</button>
              </div>
            </div>

            <div className="space-y-4">
              {issues.filter(issue => 
                issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                issue.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                issue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.department.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(issue => (
                <div 
                  key={issue.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedIssue(issue);
                    navigateTo('issue-details');
                  }}
                >
                  <div className="flex items-center mb-3 sm:mb-0">
                    <div className="flex flex-col items-center justify-center min-w-[50px] mr-4 text-slate-400 group-hover:text-orange-500 transition-colors">
                      <ArrowUp size={20} className={issue.isLiked ? 'text-teal-600 group-hover:text-teal-700' : ''} />
                      <span className={`font-bold mt-1 ${issue.isLiked ? 'text-teal-600 group-hover:text-teal-700' : 'text-slate-600 group-hover:text-orange-600'}`}>{issue.upvotes}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-teal-700 transition-colors">{issue.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> {issue.category}</span>
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> {issue.department}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {issue.time}</span>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-4 self-start sm:self-auto">
                    <Badge variant="outline" className={`gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${
                      issue.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                      issue.statusColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                      'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {issue.status === 'Resolved' && <CheckCircle size={14} />}
                      {issue.status === 'In Progress' && <Loader2 size={14} className="animate-spin" />}
                      {issue.status === 'Pending' && <AlertCircle size={14} />}
                      {issue.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      ) : currentView === 'issue-details' && selectedIssue ? (
        <main className="max-w-5xl mx-auto px-4 pt-10 pb-20 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 md:p-10 mb-8">
            <button onClick={() => navigateTo('dashboard')} className="text-teal-600 font-bold mb-6 flex items-center gap-1 hover:text-teal-800 transition-colors">
              &larr; Back to Dashboard
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-slate-500">{selectedIssue.id}</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${selectedIssue.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : selectedIssue.statusColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                  {selectedIssue.status === 'Resolved' && <CheckCircle size={14} />}
                  {selectedIssue.status === 'In Progress' && <Loader2 size={14} className="animate-spin" />}
                  {selectedIssue.status === 'Pending' && <AlertCircle size={14} />}
                  {selectedIssue.status}
                </span>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-slate-500"><Clock size={16} /> Reported {selectedIssue.time}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{selectedIssue.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-8 text-slate-600 font-medium">
              <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-teal-500"></div> Location: {selectedIssue.location}
              </span>
            </div>
            
            <div className="mb-10">
              <p className="text-sm text-slate-400 font-bold tracking-wider mb-3">DESCRIPTION</p>
              <div className="text-slate-700 bg-slate-50 p-5 md:p-8 rounded-2xl border border-slate-100 text-lg leading-relaxed shadow-inner">
                {selectedIssue.description}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-100 pt-8">
              <button 
                onClick={() => {
                  setIssues(prevIssues => prevIssues.map(issue => {
                    if (issue.id === selectedIssue.id) {
                      const newLiked = !issue.isLiked;
                      const newIssue = {
                        ...issue,
                        isLiked: newLiked,
                        upvotes: issue.upvotes + (newLiked ? 1 : -1)
                      };
                      setSelectedIssue(newIssue);
                      return newIssue;
                    }
                    return issue;
                  }));
                }}
                className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all border ${selectedIssue.isLiked ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <ThumbsUp size={20} className={selectedIssue.isLiked ? 'fill-teal-700' : ''} /> {selectedIssue.isLiked ? 'Upvoted' : 'Upvote'} ({selectedIssue.upvotes})
              </button>
              <button className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent px-8 py-3.5 rounded-xl font-bold transition-colors">
                <MessageSquare size={20} /> Add Comment
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* Report a Problem View */
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
            
            {/* Header */}
            <div className="bg-slate-50/80 border-b border-slate-100 p-8 flex items-center gap-4">
              <div className="p-3.5 bg-white rounded-2xl text-orange-500 shadow-sm border border-slate-100">
                <AlertCircle size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Report a Problem</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Submit an official ticket for fast resolution.</p>
              </div>
            </div>
            
            <div className="p-8 space-y-10">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Department</label>
                  <CustomSelect
                    value={department}
                    onChange={(val: string) => {
                      setDepartment(val);
                      setCategory('');
                      setSpecificIssue('');
                      setBuilding('');
                    }}
                    options={Object.keys(ISSUE_DATA)}
                    placeholder="Select department..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Category</label>
                  <CustomSelect
                    value={category}
                    onChange={(val: string) => {
                      setCategory(val);
                      setSpecificIssue('');
                    }}
                    disabled={!department}
                    options={department && ISSUE_DATA[department] ? Object.keys(ISSUE_DATA[department]) : []}
                    placeholder={!department ? 'Select dept first...' : 'Select category...'}
                  />
                </div>

                {/* Specific Issue */}
                {category && department && ISSUE_DATA[department] && ISSUE_DATA[department][category] && (
                  <div className="md:col-span-2 animate-in fade-in zoom-in-95 duration-300">
                    <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Specific Issue</label>
                    <CustomSelect
                      value={specificIssue}
                      onChange={(val: string) => setSpecificIssue(val)}
                      options={ISSUE_DATA[department][category]}
                      placeholder="Select the exact issue..."
                    />
                  </div>
                )}
                
                {/* Issue Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Issue Title</label>
                  <Input 
                    type="text" 
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="Short description"
                    className="w-full h-14 px-4 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-teal-500 text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Details & Location Container */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Building/Facility */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Building / Facility</label>
                    <CustomSelect
                      value={building}
                      onChange={(val: string) => setBuilding(val)}
                      disabled={!department}
                      options={department && DEPARTMENT_BUILDINGS[department] ? DEPARTMENT_BUILDINGS[department] : []}
                      placeholder={!department ? "Select dept first..." : "Select Building..."}
                      grouped={false}
                    />
                  </div>
                  
                  {/* Exact Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Exact Location</label>
                    <Input 
                      type="text" 
                      value={exactLocation}
                      onChange={(e) => setExactLocation(e.target.value)}
                      placeholder="Floor, room, zone, equipment or bus number"
                      className="w-full h-14 px-4 bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-teal-500 text-slate-700 font-medium"
                    />
                  </div>
                  
                  {/* Date */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Date (If specific incident)</label>
                    <input 
                      type="date" 
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 accent-teal-500 outline-none text-slate-700 font-medium transition-all"
                    />
                  </div>
                  
                  {/* Detailed Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Detailed Description</label>
                    <Textarea 
                      value={detailedDescription}
                      onChange={(e) => setDetailedDescription(e.target.value)}
                      placeholder="Context and specifics of the problem..." 
                      className="w-full p-4 bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-teal-500 text-slate-700 font-medium resize-none min-h-[120px]"
                    />
                  </div>
                  
                  {/* Confidentiality Toggle */}
                  <div className="md:col-span-2 flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <input 
                      type="checkbox" 
                      id="confidential"
                      checked={isConfidential}
                      onChange={(e) => setIsConfidential(e.target.checked)}
                      className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                    />
                    <label htmlFor="confidential" className="text-slate-700 font-medium flex items-center gap-2 cursor-pointer flex-1">
                      <ShieldCheck size={18} className="text-teal-600" />
                      Mark as Confidential
                    </label>
                    <span className="text-xs text-slate-500 max-w-[200px] text-right">Provides restricted handling for sensitive complaints.</span>
                  </div>
                </div>
              </div>

              {/* Camera Section - AT THE BOTTOM */}
              <div className="border-t border-slate-100 pt-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Camera className="text-teal-600" size={20} /> Live Evidence</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">Required</span>
                </div>
                
                <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center min-h-[300px]">
                  {!cameraActive && !photoTaken ? (
                    <div className="animate-in fade-in flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                        <Camera size={32} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 text-sm mb-6 max-w-sm">
                        You must take a live photo of the issue. Gallery uploads are not permitted.
                      </p>
                      <button onClick={() => { pushModalState(); setCameraActive(true); }} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-md">
                        <Camera size={18} /> Open Camera
                      </button>
                    </div>
                  ) : cameraActive && !photoTaken ? (
                    <div className="w-full max-w-lg bg-black rounded-xl overflow-hidden relative aspect-video flex items-center justify-center animate-in zoom-in-95">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted></video>
                      <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_red]"></div>
                      <button 
                        onClick={takePhoto}
                        className="absolute bottom-6 w-16 h-16 bg-white/20 border-4 border-white rounded-full z-10 hover:bg-white/40 transition-colors backdrop-blur-sm shadow-lg"
                      ></button>
                      <p className="absolute bottom-4 text-white/50 text-sm font-mono z-10 pointer-events-none">CAMERA ACTIVE</p>
                    </div>
                  ) : (
                    <div className="w-full max-w-lg relative aspect-video animate-in zoom-in-95">
                      <div className="absolute inset-0 bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center border-4 border-slate-200 shadow-inner">
                        {capturedImage ? (
                          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-zinc-500 font-bold italic tracking-wide">Photo Captured</span>
                        )}
                      </div>
                      <button 
                        onClick={() => { setPhotoTaken(false); setCameraActive(true); setCapturedImage(null); }}
                        className="absolute -top-3 -right-3 bg-white text-slate-800 p-2.5 rounded-full hover:bg-slate-100 transition-colors shadow-lg border border-slate-200"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
              </div>

            </div>

            {/* Submit Button Area */}
            <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-end">
              <Button 
                onClick={() => navigateTo('dashboard')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg py-6 px-10 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Submit Ticket
              </Button>
            </div>

          </div>
        </main>

      )}

      {/* Footer (Only on Dashboard) */}
      {currentView === 'dashboard' && (
        <footer className="mt-auto bg-[#f8fafc] flex flex-col items-center pb-8 pt-8">
          <div className="w-full h-px bg-teal-200 mb-8 max-w-4xl mx-auto"></div>
          <div className="mb-4 hover:-rotate-6 transition-transform cursor-pointer">
            <img src="/logo.png" alt="Resolvelt Logo" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-slate-500 text-sm mb-1">Website crafted with <span className="text-rose-500">♥</span> by</p>
          <p className="text-teal-700 font-bold mb-6">Rudrapal Singh Shekhawat <span className="text-slate-500 font-normal">(2nd Year)</span></p>
          <p className="text-xs text-slate-500">© 2026 All rights reserved</p>
        </footer>
      )}
    </div>
  );
}
