import { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, PlusCircle, CheckCircle, ArrowUp, Clock, AlertCircle, X, User, LogOut, MessageSquare, Camera, ShieldCheck, ThumbsUp, ChevronDown, Filter, Check, AlertTriangle, ArrowRight, Zap, RefreshCw, Send, CheckCheck, Heart } from 'lucide-react';
import { ISSUE_DATA, DEPARTMENT_BUILDINGS, DEPARTMENT_LEVELS } from './taxonomy';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto smooth-enter-up">
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
  const [issueSourceView, setIssueSourceView] = useState<'dashboard' | 'authority-dashboard' | 'recent-reported'>('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
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
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('Top');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All Departments');
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('resolveit_role'));
  const [hasSelectedRole, setHasSelectedRole] = useState(!!localStorage.getItem('resolveit_role'));
  const [selectedAuthorityDepartment, setSelectedAuthorityDepartment] = useState('All Departments');
  const [selectedAuthorityLevel, setSelectedAuthorityLevel] = useState<'All' | '1' | '2' | '3' | '4'>('All');
  const [selectedKpiFilter, setSelectedKpiFilter] = useState<'all' | 'overdue' | 'open' | 'escalated' | 'solved'>('all');
  const [myTicketsTab, setMyTicketsTab] = useState<'reported' | 'upvoted' | 'resolved'>('reported');

  // Authority & Modal Action States
  const [postUpdateModalOpen, setPostUpdateModalOpen] = useState(false);
  const [actionTicket, setActionTicket] = useState<any>(null);
  const [postUpdateText, setPostUpdateText] = useState('');

  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateTargetLevel, setEscalateTargetLevel] = useState<number>(2);
  const [escalateReason, setEscalateReason] = useState('SLA Breached / Unresolved');
  const [escalateNote, setEscalateNote] = useState('');

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [matchedDuplicate, setMatchedDuplicate] = useState<any>(null);

  const [issues, setIssues] = useState<any[]>([
    {
      id: 'TKT-142',
      title: 'Mess food quality issue today',
      location: 'Mess Building',
      description: 'The food quality in the main mess was severely degraded today. Several students reported finding insects and the food tasted stale.',
      upvotes: 89,
      status: 'Solved',
      statusColor: 'emerald',
      time: '1 day ago',
      department: 'Hostel, Mess & Laundry',
      category: 'Mess Food & Menu',
      specificIssue: 'Poor Food Hygiene',
      imageUrl: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&q=80&w=800',
      isLiked: false,
      isMine: true,
      currentLevel: 2,
      assignedAuthority: 'Head Warden',
      isEscalated: true,
      escalatedFrom: 'L1: Warden',
      escalationReason: 'Recurring quality complaints',
      slaTimer: 'Solved in 18h',
      isOverdue: false,
      resolvedAt: 'Yesterday, 4:00 PM',
      comments: [
        { author: 'Head Warden (Official Update)', time: '1 day ago', text: 'Mess supervisor inspected the kitchen and food vendor was issued a penalty warning. New hygienic batch prepared.' }
      ]
    },
    {
      id: 'TKT-134',
      title: 'Wi-Fi completely down in Library',
      location: 'LRC / Library',
      description: 'No one is able to connect to the Wi-Fi on the first floor of the library. It has been down since morning and is severely affecting study schedules.',
      upvotes: 45,
      status: 'In Progress',
      statusColor: 'blue',
      time: '4 hours ago',
      department: 'Campus Infrastructure & IT',
      category: 'IT, Internet & Digital Services',
      specificIssue: 'Campus Wi-Fi Not Working',
      imageUrl: 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80&w=800',
      isLiked: true,
      isMine: false,
      currentLevel: 1,
      assignedAuthority: 'Maintenance Supervisor',
      isEscalated: false,
      slaTimer: '2h remaining',
      isOverdue: false,
      comments: [
        { author: 'Maintenance Supervisor', time: '2 hours ago', text: 'Network technician dispatched to inspect the LRC Floor 1 access points.' }
      ]
    },
    {
      id: 'TKT-129',
      title: 'AC not working in Room 302',
      location: 'BH1 (Boys Hostel 1)',
      description: 'The air conditioner in Room 302 of Hostel A is completely non-functional. Water is leaking from the unit and making the floor wet.',
      upvotes: 12,
      status: 'Not Started',
      statusColor: 'rose',
      time: '2 hours ago',
      department: 'Hostel, Mess & Laundry',
      category: 'Electrical & Utilities',
      specificIssue: 'AC / Cooler Issue',
      imageUrl: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&q=80&w=800',
      isLiked: false,
      isMine: true,
      currentLevel: 1,
      assignedAuthority: 'Warden',
      isEscalated: false,
      slaTimer: 'Overdue by 14h',
      isOverdue: true,
      comments: []
    },
    {
      id: 'TKT-128',
      title: 'Broken projector in EB1 Classroom 4',
      location: 'EB1 Academic Building',
      description: 'The projector is not turning on and the HDMI cable seems to be physically damaged.',
      upvotes: 8,
      status: 'Seen',
      statusColor: 'amber',
      time: '1 hour ago',
      department: 'Campus Infrastructure & IT',
      category: 'Academic Buildings & Classrooms',
      specificIssue: 'Projector Not Working',
      imageUrl: 'https://images.unsplash.com/photo-1585507851613-2df79612ba8a?auto=format&fit=crop&q=80&w=800',
      isLiked: false,
      isMine: true,
      currentLevel: 1,
      assignedAuthority: 'Maintenance Supervisor',
      isEscalated: false,
      slaTimer: '5h remaining',
      isOverdue: false,
      comments: []
    }
  ]);

  const issuesRef = useRef(issues);
  useEffect(() => {
    issuesRef.current = issues;
  }, [issues]);

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

  const openIssueDetails = (issue: any, fromView: 'dashboard' | 'authority-dashboard' | 'recent-reported' = 'dashboard') => {
    setIssueSourceView(fromView);
    setSelectedIssue(issue);
    setIsCommenting(false);
    setNewComment('');
    const query = fromView === 'authority-dashboard' ? `?id=${issue.id}&from=workspace` : `?id=${issue.id}`;
    window.history.pushState({ view: 'issue-details', issueId: issue.id, from: fromView }, '', `/issue-details${query}`);
    setCurrentView('issue-details');
    window.scrollTo(0, 0);
  };

  const navigateTo = (view: string) => {
    window.history.pushState({ view }, '', `/${view}`);
    setCurrentView(view);
    if (view === 'authority-dashboard') {
      setUserRole('authority');
      localStorage.setItem('resolveit_role', 'authority');
      setSelectedAuthorityDepartment('All Departments');
      setSelectedAuthorityLevel('All');
      setSelectedKpiFilter('all');
    }
    if (view !== 'issue-details') {
      setSelectedIssue(null);
    }
    window.scrollTo(0, 0);
  };

  // Handle Browser Back and Forward / Redo Navigation
  useEffect(() => {
    const resolveView = (stateView?: string, stateIssueId?: string, stateFrom?: string) => {
      const params = new URLSearchParams(window.location.search);
      const idFromUrl = params.get('id');
      const fromParam = params.get('from');
      const path = window.location.pathname.replace(/^\//, '');

      let targetView = stateView;
      if (!targetView) {
        if (path === 'report') targetView = 'report';
        else if (path === 'authority-dashboard') {
          targetView = 'authority-dashboard';
          setUserRole('authority');
          localStorage.setItem('resolveit_role', 'authority');
        }
        else if (path === 'recent-reported') targetView = 'recent-reported';
        else if (path.startsWith('issue') || idFromUrl) targetView = 'issue-details';
        else targetView = 'dashboard';
      }

      if (targetView === 'authority-dashboard') {
        setUserRole('authority');
        localStorage.setItem('resolveit_role', 'authority');
      }

      if (targetView === 'issue-details') {
        const issueId = stateIssueId || idFromUrl;
        const currentList = issuesRef.current;
        const found = currentList.find(i => i.id === issueId) || currentList[0];
        setSelectedIssue(found);
        const origin = (stateFrom || (fromParam === 'workspace' ? 'authority-dashboard' : 'dashboard')) as 'dashboard' | 'authority-dashboard' | 'recent-reported';
        setIssueSourceView(origin);
      } else {
        setSelectedIssue(null);
      }
      setCurrentView(targetView);
    };

    if (!localStorage.getItem('resolveit_role')) {
      window.history.replaceState({ view: 'dashboard' }, '', '/dashboard');
      resolveView('dashboard');
    } else if (!window.history.state) {
      const params = new URLSearchParams(window.location.search);
      const idFromUrl = params.get('id');
      const fromParam = params.get('from');
      const path = window.location.pathname.replace(/^\//, '') || 'dashboard';
      window.history.replaceState({ view: path, issueId: idFromUrl || undefined, from: fromParam === 'workspace' ? 'authority-dashboard' : 'dashboard' }, '', window.location.pathname + window.location.search);
      resolveView(path, idFromUrl || undefined, fromParam === 'workspace' ? 'authority-dashboard' : 'dashboard');
    } else {
      resolveView(window.history.state.view, window.history.state.issueId, window.history.state.from);
    }

    const handlePopState = (e: PopStateEvent) => {
      // Close all modals on navigation
      setProfileOpen(false);
      setNotificationsOpen(false);
      setUserMenuOpen(false);
      setSidebarOpen(false);
      setFeedbackOpen(false);
      setReportBugOpen(false);
      setCameraActive(false);
      setSearchOpen(false);
      setPostUpdateModalOpen(false);
      setEscalateModalOpen(false);
      setDuplicateModalOpen(false);

      const stateView = e.state?.view;
      const stateIssueId = e.state?.issueId || new URLSearchParams(window.location.search).get('id');
      const stateFrom = e.state?.from;
      resolveView(stateView, stateIssueId, stateFrom);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync role automatically if currently on Authority Dashboard
  useEffect(() => {
    if (currentView === 'authority-dashboard' && userRole !== 'authority') {
      setUserRole('authority');
      localStorage.setItem('resolveit_role', 'authority');
    }
  }, [currentView, userRole]);

  const handleLogout = () => {
    localStorage.removeItem('resolveit_role');
    setUserRole(null);
    setHasSelectedRole(false);
    setUserMenuOpen(false);
    setSelectedIssue(null);
    navigateTo('dashboard');
  };

  const getAuthorityTitle = (dept: string, level: number = 1): string => {
    if (DEPARTMENT_LEVELS && DEPARTMENT_LEVELS[dept] && DEPARTMENT_LEVELS[dept][level]) {
      return DEPARTMENT_LEVELS[dept][level];
    }
    if (level === 4) return "VC (Vice-Chancellor)";
    if (level === 3) return "Department Head / Dean";
    if (level === 2) return "Assistant In-Charge";
    return "Department Representative";
  };

  const submitComment = () => {
    if (!newComment.trim()) return;
    const commentObj = {
      author: userRole === 'authority' ? 'Authority Representative' : 'Hritvika (You)',
      time: 'Just now',
      text: newComment
    };

    setIssues(prevIssues => prevIssues.map(issue => {
      if (issue.id === selectedIssue.id) {
        const updatedIssue = {
          ...issue,
          comments: [...(issue.comments || []), commentObj]
        };
        setSelectedIssue(updatedIssue);

        // Notify student if authority comments
        if (userRole === 'authority') {
          const newNotification = {
            id: Date.now(),
            title: `New Comment: ${updatedIssue.title}`,
            message: `The authority left a message on your ticket.`,
            time: 'Just now',
            unread: true
          };
          setNotifications(prev => [newNotification, ...prev]);
        }

        return updatedIssue;
      }
      return issue;
    }));

    setNewComment('');
    setIsCommenting(false);
  };

  // Authority Action 1: Acknowledge Ticket
  const handleAcknowledge = (ticketId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIssues(prevIssues => prevIssues.map(issue => {
      if (issue.id === ticketId) {
        const handlerTitle = getAuthorityTitle(issue.department, issue.currentLevel || 1);
        const updateNote = {
          author: handlerTitle,
          time: 'Just now',
          text: `Ticket acknowledged by ${handlerTitle}. Investigation and remediation have commenced.`
        };
        const updated = {
          ...issue,
          status: 'In Progress',
          statusColor: 'blue',
          comments: [...(issue.comments || []), updateNote]
        };
        if (selectedIssue && selectedIssue.id === ticketId) {
          setSelectedIssue(updated);
        }
        return updated;
      }
      return issue;
    }));

    const notif = {
      id: Date.now(),
      title: `Ticket Acknowledged`,
      message: `Ticket #${ticketId} was acknowledged and moved to In Progress.`,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Authority Action 2: Open Post Update Modal
  const handleOpenPostUpdate = (ticket: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionTicket(ticket);
    setPostUpdateText('');
    setPostUpdateModalOpen(true);
    pushModalState();
  };

  const handlePostUpdateSubmit = () => {
    if (!actionTicket || !postUpdateText.trim()) return;
    const handlerTitle = getAuthorityTitle(actionTicket.department, actionTicket.currentLevel || 1);
    const updateNote = {
      author: `${handlerTitle} (Official Update)`,
      time: 'Just now',
      text: postUpdateText.trim()
    };

    setIssues(prevIssues => prevIssues.map(issue => {
      if (issue.id === actionTicket.id) {
        const updated = {
          ...issue,
          comments: [...(issue.comments || []), updateNote]
        };
        if (selectedIssue && selectedIssue.id === actionTicket.id) {
          setSelectedIssue(updated);
        }
        return updated;
      }
      return issue;
    }));

    const notif = {
      id: Date.now(),
      title: `Update Posted`,
      message: `Progress update posted for ticket #${actionTicket.id}.`,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [notif, ...prev]);

    setPostUpdateModalOpen(false);
    setActionTicket(null);
    setPostUpdateText('');
  };

  // Authority Action 3: Open Escalate Modal
  const handleOpenEscalate = (ticket: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionTicket(ticket);
    const current = ticket.currentLevel || 1;
    const nextLvl = Math.min(4, current + 1);
    setEscalateTargetLevel(nextLvl);
    setEscalateReason('');
    setEscalateNote('');
    setEscalateModalOpen(true);
    pushModalState();
  };

  const handleEscalateSubmit = () => {
    if (!actionTicket) return;
    const prevLvl = actionTicket.currentLevel || 1;
    const prevTitle = getAuthorityTitle(actionTicket.department, prevLvl);
    const newTitle = getAuthorityTitle(actionTicket.department, escalateTargetLevel);
    const finalReason = escalateReason.trim() || 'SLA Breached / Administrative Escalation';

    const escalateLog = {
      author: 'Hierarchy Escalation Engine',
      time: 'Just now',
      text: `Level ${prevLvl} (${prevTitle}) was unable to resolve this issue within the SLA timeframe and escalated it to Level ${escalateTargetLevel} (${newTitle}). Reason: ${finalReason}${escalateNote ? ` - Note: "${escalateNote}"` : ''}. Responsibility is now actively transferred to ${newTitle}.`
    };

    setIssues(prevIssues => prevIssues.map(issue => {
      if (issue.id === actionTicket.id) {
        const updated = {
          ...issue,
          currentLevel: escalateTargetLevel,
          assignedAuthority: newTitle,
          isEscalated: true,
          escalatedFrom: `L${prevLvl}: ${prevTitle}`,
          escalationReason: finalReason,
          comments: [...(issue.comments || []), escalateLog]
        };
        if (selectedIssue && selectedIssue.id === actionTicket.id) {
          setSelectedIssue(updated);
        }
        return updated;
      }
      return issue;
    }));

    const notif = {
      id: Date.now(),
      title: `Ticket Escalated to Level ${escalateTargetLevel}`,
      message: `Ticket #${actionTicket.id} escalated to Level ${escalateTargetLevel} (${newTitle}).`,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [notif, ...prev]);

    setEscalateModalOpen(false);
    setActionTicket(null);
  };

  // Authority Action 4: One-Click Solve
  const handleOneClickSolve = (ticketId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIssues(prevIssues => prevIssues.map(issue => {
      if (issue.id === ticketId) {
        const handlerTitle = getAuthorityTitle(issue.department, issue.currentLevel || 1);
        const resolvedLog = {
          author: `${handlerTitle} (Resolution)`,
          time: 'Just now',
          text: `Ticket marked as Solved and verified by ${handlerTitle}.`
        };
        const updated = {
          ...issue,
          status: 'Solved',
          statusColor: 'emerald',
          isOverdue: false,
          slaTimer: 'Solved',
          resolvedAt: 'Just now',
          comments: [...(issue.comments || []), resolvedLog]
        };
        if (selectedIssue && selectedIssue.id === ticketId) {
          setSelectedIssue(updated);
        }
        return updated;
      }
      return issue;
    }));

    const notif = {
      id: Date.now(),
      title: `Ticket Solved`,
      message: `Ticket #${ticketId} was resolved successfully.`,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Duplicate Check and Submission Engine
  const handleCheckDuplicateAndSubmit = () => {
    const effectiveDept = department || 'Campus Infrastructure & IT';

    // Duplicate detection criteria:
    // Any existing issue in same department matching specificIssue OR category & building OR matching title
    const duplicate = issues.find(i =>
      i.department === effectiveDept &&
      (
        (specificIssue && i.specificIssue === specificIssue) ||
        (category && i.category === category && building && i.location.toLowerCase().includes(building.toLowerCase())) ||
        (issueTitle.trim().length > 3 && i.title.toLowerCase().includes(issueTitle.trim().toLowerCase()))
      )
    );

    if (duplicate) {
      setMatchedDuplicate(duplicate);
      setDuplicateModalOpen(true);
      pushModalState();
    } else {
      executeSubmitTicket();
    }
  };

  const handleUpvoteDuplicateAndOpen = () => {
    if (!matchedDuplicate) return;
    const dupId = matchedDuplicate.id;
    setIssues(prevIssues => prevIssues.map(issue => {
      if (issue.id === dupId) {
        return {
          ...issue,
          upvotes: issue.isLiked ? issue.upvotes : issue.upvotes + 1,
          isLiked: true
        };
      }
      return issue;
    }));

    setDuplicateModalOpen(false);
    const target = issues.find(i => i.id === dupId) || matchedDuplicate;
    openIssueDetails({ ...target, isLiked: true, upvotes: target.isLiked ? target.upvotes : target.upvotes + 1 }, 'dashboard');
  };

  const executeSubmitTicket = () => {
    const effectiveDept = department || 'Campus Infrastructure & IT';
    const effectiveTitle = issueTitle.trim() || specificIssue || 'Campus grievance report';
    const effectiveLocation = building ? (exactLocation ? `${building} - ${exactLocation}` : building) : (exactLocation || 'Campus premises');
    const newId = `TKT-${143 + issues.length}`;

    const newTicket = {
      id: newId,
      title: effectiveTitle,
      location: effectiveLocation,
      description: detailedDescription.trim() || `Reported issue regarding ${specificIssue || category || 'campus facilities'}.`,
      upvotes: 1,
      status: 'Not Started',
      statusColor: 'rose',
      time: 'Just now',
      department: effectiveDept,
      category: category || 'General / Other Issues',
      specificIssue: specificIssue || 'General Issue',
      imageUrl: capturedImage || undefined,
      isLiked: true,
      isMine: true,
      currentLevel: 1,
      assignedAuthority: getAuthorityTitle(effectiveDept, 1),
      isEscalated: false,
      slaTimer: '24h remaining',
      isOverdue: false,
      comments: []
    };

    setIssues(prev => [newTicket, ...prev]);

    // reset form
    setDepartment('');
    setCategory('');
    setSpecificIssue('');
    setBuilding('');
    setIssueTitle('');
    setExactLocation('');
    setDetailedDescription('');
    setIncidentDate('');
    setIsConfidential(false);
    setCapturedImage(null);
    setPhotoTaken(false);
    setDuplicateModalOpen(false);

    // Notify authority of new ticket
    const newNotif = {
      id: Date.now(),
      title: `New Ticket Submitted: #${newId}`,
      message: `"${effectiveTitle}" in ${effectiveDept} is now queued for Level 1 action.`,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);

    navigateTo('dashboard');
  };

  return (
    <div className={`min-h-screen bg-[#f8fafc] font-[Inter,system-ui,sans-serif] text-slate-800 flex flex-col ${!hasSelectedRole ? 'overflow-hidden h-screen' : ''}`}>

      {/* Role Selection Overlay (Post-Login) */}
      {!hasSelectedRole && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md smooth-enter">
          <div className="bg-white/95 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/60 text-center relative overflow-hidden smooth-enter-up">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600"></div>
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/25">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1.5 tracking-tight">Welcome to Resolvelt</h2>
              <p className="text-slate-500 mb-8 font-medium text-sm">Select your account type to continue.</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    localStorage.setItem('resolveit_role', 'student');
                    setUserRole('student');
                    setHasSelectedRole(true);
                    setSelectedAuthorityDepartment('All Departments');
                    setSelectedAuthorityLevel('All');
                    setSelectedKpiFilter('all');
                    navigateTo('dashboard');
                  }}
                  className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-teal-400 hover:bg-teal-50/80 hover:shadow-md hover:shadow-teal-100 transition-all duration-200 group"
                >
                  <div className="w-13 h-13 bg-slate-100 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center mb-3.5 transition-all duration-200 group-hover:scale-110">
                    <User size={26} className="text-slate-500 group-hover:text-teal-700" />
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-teal-800 text-sm">Student</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Report &amp; track issues</span>
                </button>

                <button
                  onClick={() => {
                    localStorage.setItem('resolveit_role', 'authority');
                    setUserRole('authority');
                    setHasSelectedRole(true);
                    setSelectedAuthorityDepartment('All Departments');
                    setSelectedAuthorityLevel('All');
                    setSelectedKpiFilter('all');
                    navigateTo('dashboard');

                    // Notify authority of new unsolved problems
                    const newIssues = issues.filter(i => i.status === 'Not Started');
                    if (newIssues.length > 0) {
                      const newNotifs = newIssues.map(issue => ({
                        id: Date.now() + Math.random(),
                        title: `New Ticket Alert`,
                        message: `"${issue.title}" needs attention in ${issue.department}.`,
                        time: issue.time,
                        unread: true
                      }));
                      setNotifications(prev => [...newNotifs, ...prev]);
                    }
                  }}
                  className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-orange-400 hover:bg-orange-50/80 hover:shadow-md hover:shadow-orange-100 transition-all duration-200 group"
                >
                  <div className="w-13 h-13 bg-slate-100 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center mb-3.5 transition-all duration-200 group-hover:scale-110">
                    <ShieldCheck size={26} className="text-slate-500 group-hover:text-orange-600" />
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-orange-800 text-sm">Authority</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Manage &amp; resolve</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 smooth-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 smooth-overlay" onClick={() => setProfileOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative smooth-enter" onClick={e => e.stopPropagation()}>
            <button onClick={() => setProfileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-teal-800 mb-6 border-b pb-2">
              {userRole === 'authority' ? 'Authority Profile' : 'Student Profile'}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">FULL NAME</p>
                <p className="font-semibold text-slate-700">
                  {userRole === 'authority' ? 'Authority Representative' : 'Hritvika Vashistha'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">
                  {userRole === 'authority' ? 'DEPARTMENT' : 'ROLL NUMBER'}
                </p>
                <p className="font-semibold text-slate-700">
                  {userRole === 'authority' ? 'Campus Administration' : '2025BTECH259'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">
                  {userRole === 'authority' ? 'AUTHORITY LEVEL' : 'COURSE'}
                </p>
                <p className="font-semibold text-slate-700">
                  {userRole === 'authority' ? 'Designated Authority (Multi-Level)' : 'B.Tech CSE Core'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">EMAIL ID / LOGIN ID</p>
                <p className="font-semibold text-slate-700">
                  {userRole === 'authority' ? 'authority@jklu.edu.in' : 'hritvikavashistha@jklu.edu.in'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 smooth-overlay" onClick={() => setFeedbackOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative smooth-enter" onClick={e => e.stopPropagation()}>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 smooth-overlay" onClick={() => setReportBugOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative smooth-enter" onClick={e => e.stopPropagation()}>
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
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-gradient-to-b from-[#115e59] to-[#0f4f4a] h-16 flex items-center justify-between px-5 text-white">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
            <span className="font-extrabold text-lg tracking-tight">Resolvelt</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"><X size={20} /></button>
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

      {/* Navbar */}
      <nav className="bg-[#115e59] h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-lg shadow-teal-900/20" style={{ backgroundImage: 'linear-gradient(135deg, #115e59 0%, #0d4f4a 100%)' }}>

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
            <span className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
              Resolvelt
              {userRole && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextRole = userRole === 'authority' ? 'student' : 'authority';
                    setUserRole(nextRole);
                    localStorage.setItem('resolveit_role', nextRole);
                    if (nextRole === 'authority') {
                      navigateTo('authority-dashboard');
                    } else {
                      navigateTo('dashboard');
                    }
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
                <span
                  title="Authority Workspace"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 shadow-xs ml-1"
                >
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
            <button className={`p-2 rounded-full transition-colors flex-shrink-0 ${searchOpen ? 'text-teal-600 hover:text-teal-800' : 'text-white hover:text-teal-200'}`} onClick={() => { if (!searchOpen) { pushModalState(); setSearchOpen(true); setNotificationsOpen(false); setUserMenuOpen(false); } else { setSearchOpen(false); } }}>
              <Search size={20} />
            </button>
          </div>

          <button className="hover:text-teal-200 transition-colors relative" onClick={() => { if (!notificationsOpen) pushModalState(); setNotificationsOpen(true); setUserMenuOpen(false); setSearchOpen(false); }}>
            <Bell size={22} />
            {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#115e59] pulse-ring"></span>}
          </button>

          <button onClick={() => { if (!userMenuOpen) pushModalState(); setUserMenuOpen(true); setNotificationsOpen(false); setSearchOpen(false); }} className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center font-bold text-sm border-2 border-teal-500/50 hover:from-teal-400 hover:to-teal-600 transition-all shadow-md shadow-teal-900/30">
            {userRole === 'authority' ? 'RS' : 'HV'}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute top-12 right-12 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden smooth-enter-up">
              <div className="bg-slate-50 px-4 py-3 border-b font-bold text-slate-700 flex justify-between items-center">
                Notifications
                {notifications.length > 0 && <span className="text-xs font-normal text-teal-600 cursor-pointer hover:underline" onClick={() => setNotifications([])}>Clear All</span>}
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
                    const nextRole = userRole === 'authority' ? 'student' : 'authority';
                    setUserRole(nextRole);
                    localStorage.setItem('resolveit_role', nextRole);
                    setUserMenuOpen(false);
                    if (nextRole === 'authority') {
                      navigateTo('authority-dashboard');
                    } else {
                      navigateTo('dashboard');
                    }
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
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* View Rendering */}
      {currentView === 'dashboard' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 view-slide-in">

          {/* Welcome Greeting Card */}
          <div className="w-full bg-gradient-to-r from-teal-50/70 via-emerald-50/30 to-teal-50/40 border border-teal-200/90 rounded-3xl p-6 sm:p-7 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-xl shadow-sm shrink-0">
                {userRole === 'authority' ? 'RS' : 'HV'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 text-teal-800 border border-teal-200/80">
                    {userRole === 'authority' ? 'Authority Portal' : 'Student Portal'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-semibold bg-white/80 px-2.5 py-0.5 rounded-full border border-teal-200/80">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                    Campus Live
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
                  {userRole === 'authority' ? 'Good to see you, Rohit Sir.' : 'Welcome back, Hritvika'}
                </h2>
                <p className="text-slate-500 text-sm mt-0.5 font-medium">
                  {userRole === 'authority'
                    ? 'Review queues, manage escalations, and meet SLAs.'
                    : 'Track your reported complaints or submit a new grievance below.'}
                </p>
              </div>
            </div>

            {userRole === 'authority' && (
              <div className="flex flex-wrap gap-2.5 md:shrink-0">
                <div className="bg-white/90 border border-teal-100 rounded-2xl px-4 py-2 text-center min-w-[76px] shadow-xs">
                  <p className="text-xl font-black text-teal-800">{issues.filter(i => i.status !== 'Solved').length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600/80">Active</p>
                </div>
                <div className="bg-white/90 border border-teal-100 rounded-2xl px-4 py-2 text-center min-w-[76px] shadow-xs">
                  <p className="text-xl font-black text-teal-800">{issues.filter(i => i.status === 'Solved').length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600/80">Solved</p>
                </div>
                <div className="bg-white/90 border border-teal-100 rounded-2xl px-4 py-2 text-center min-w-[76px] shadow-xs">
                  <p className="text-xl font-black text-teal-800">{issues.filter(i => i.isEscalated).length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600/80">Escalated</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Authority Workspace Card (Visible on Home Page for Authority) ── */}
          {userRole === 'authority' && (
            <div className="mb-8 smooth-enter-up">
              <div
                onClick={() => navigateTo('authority-dashboard')}
                className="card-hover bg-gradient-to-r from-teal-50/90 via-emerald-50/40 to-teal-50/70 border border-teal-300/80 hover:border-teal-400 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-teal-100/50 via-emerald-50/30 to-transparent pointer-events-none"></div>
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-teal-300/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-700/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-teal-700 transition-all">
                    <ShieldCheck size={26} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-700 text-white">
                        Official Officer Workspace
                      </span>
                      <span className="text-xs font-bold text-teal-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-teal-200">
                        {issues.filter(i => i.status !== 'Solved').length} Active Tickets
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight group-hover:text-teal-700 transition-colors">
                      Authority Workspace
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5 leading-relaxed">
                      Review department queues, manage 4-level escalations, acknowledge tickets, and resolve student complaints.
                    </p>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-teal-700/20 hover:shadow-teal-700/30 hover:scale-[1.02] active:scale-[0.98] transition-all ml-auto shrink-0 relative z-10 flex items-center gap-2 cursor-pointer border-0"
                >
                  <ShieldCheck size={17} /> Go to Workspace &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* ── CTA Section: Facing a Campus Issue? ──────────────── */}
          <div className="mb-8">
            <div
              onClick={() => navigateTo('report')}
              className="card-hover bg-white border border-orange-200/90 hover:border-orange-300 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-orange-50/80 via-amber-50/30 to-transparent pointer-events-none"></div>
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-orange-200/25 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/70 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-orange-100 transition-all shadow-xs">
                  <PlusCircle size={26} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors">
                    Facing a Campus Issue?
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5 leading-relaxed">
                    Report it now — your ticket will be routed to the right authority automatically.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-orange-600/20 hover:shadow-orange-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all ml-auto shrink-0 relative z-10 flex items-center gap-2 cursor-pointer border-0"
              >
                <PlusCircle size={17} /> Report a Problem
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar: Categories */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-20">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Filter size={14} className="text-teal-500" /> Filter by Dept.
                </h3>
                <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1.5">
                  {['All Departments', ...Object.keys(ISSUE_DATA)].map(dept => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDepartmentFilter(dept)}
                      className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 shrink-0 ${selectedDepartmentFilter === dept
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${selectedDepartmentFilter === dept ? 'bg-white' :
                        dept === 'All Departments' ? 'bg-slate-400' :
                          dept.includes('Hostel') ? 'bg-teal-400' :
                            dept.includes('Infrastructure') ? 'bg-blue-400' :
                              dept.includes('Academics') ? 'bg-violet-400' :
                                dept.includes('Sports') || dept.includes('Student Life') ? 'bg-amber-400' :
                                  dept.includes('Health') ? 'bg-rose-400' :
                                    'bg-emerald-400'
                        }`}></span>
                      <span className="truncate">{dept}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content: Issues Feed */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {selectedDepartmentFilter === 'All Departments' ? 'Recent Campus Issues' : selectedDepartmentFilter}
                  </h3>
                </div>
                <div className="bg-slate-200 p-1 rounded-lg flex text-sm font-bold w-fit">
                  <button onClick={() => setFilterTab('Top')} className={`px-5 py-1.5 rounded-md transition-all ${filterTab === 'Top' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Trending</button>
                  <button onClick={() => setFilterTab('New')} className={`px-5 py-1.5 rounded-md transition-all ${filterTab === 'New' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Newest</button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[...issues]
                  .filter(issue => selectedDepartmentFilter === 'All Departments' || issue.department === selectedDepartmentFilter || (selectedDepartmentFilter.includes('Health') && issue.department?.includes('Health')))
                  .filter(issue =>
                    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    issue.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .sort((a, b) => {
                    if (filterTab === 'Top') {
                      return b.upvotes - a.upvotes;
                    } else {
                      const getTimeVal = (timeStr: string) => {
                        if (timeStr.includes('min')) return parseInt(timeStr);
                        if (timeStr.includes('hour')) return parseInt(timeStr) * 60;
                        if (timeStr.includes('day')) return parseInt(timeStr) * 60 * 24;
                        return 9999;
                      };
                      return getTimeVal(a.time) - getTimeVal(b.time);
                    }
                  })
                  .map(issue => (
                    <Card key={issue.id} onClick={() => openIssueDetails(issue, 'dashboard')}
                      className={`card-hover cursor-pointer group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:border-teal-300 ${issue.statusColor === 'emerald' ? 'card-accent-emerald' :
                        issue.statusColor === 'blue' ? 'card-accent-blue' :
                          issue.statusColor === 'amber' ? 'card-accent-amber' :
                            'card-accent-rose'
                        }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          {issue.imageUrl && <img src={issue.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-100 hidden sm:block" />}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-bold text-slate-800 group-hover:text-teal-700 transition-colors leading-snug mb-2">
                              {issue.title}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></div>
                                <span className="truncate">{issue.category}</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></div>
                                <span className="truncate">{issue.department}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 shrink-0">
                            <Badge variant="outline" className={`shrink-0 self-start gap-1 px-3 py-1 rounded-full text-xs font-bold border ${issue.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              issue.statusColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                issue.statusColor === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                  'bg-rose-50 text-rose-600 border-rose-200'
                              }`}>
                              {issue.status === 'Solved' && <CheckCircle size={12} />}
                              {issue.status === 'Seen' && <CheckCircle size={12} className="opacity-70" />}
                              {issue.status === 'Not Started' && <AlertCircle size={12} />}
                              {issue.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-1">
                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">{issue.description}</p>
                        <div className="text-xs font-bold tracking-wide flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Clock size={13} /> {issue.time.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-3">
                            {issue.comments && issue.comments.length > 0 && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <MessageSquare size={13} /> {issue.comments.length}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (issue.status === 'Solved') return;
                                setIssues(prev => prev.map(item => {
                                  if (item.id === issue.id) {
                                    const nextLiked = !item.isLiked;
                                    return {
                                      ...item,
                                      isLiked: nextLiked,
                                      upvotes: item.upvotes + (nextLiked ? 1 : -1)
                                    };
                                  }
                                  return item;
                                }));
                              }}
                              disabled={issue.status === 'Solved'}
                              title={issue.status === 'Solved' ? 'Issue solved · Upvotes closed' : issue.isLiked ? 'Remove upvote' : 'Upvote problem'}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${issue.status === 'Solved'
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                                : issue.isLiked
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs hover:bg-teal-100 cursor-pointer'
                                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 cursor-pointer'
                                }`}
                            >
                              <ArrowUp size={13} className={issue.isLiked ? 'text-teal-600 font-extrabold' : ''} /> {issue.upvotes}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              {issues.filter(issue => selectedDepartmentFilter === 'All Departments' || issue.department === selectedDepartmentFilter || (selectedDepartmentFilter.includes('Health') && issue.department?.includes('Health'))).length === 0 && (
                <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed mt-4">
                  <p className="text-slate-500 font-medium">No issues found for {selectedDepartmentFilter}.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : currentView === 'authority-dashboard' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 view-slide-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button onClick={() => { if (window.history.length > 1) window.history.back(); else navigateTo('dashboard'); }} className="text-teal-700 hover:text-teal-900 p-2 rounded-full hover:bg-teal-50 transition-colors border border-slate-200 bg-white shadow-sm">
                &larr; Back
              </button>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Authority Workspace</h1>
                <p className="text-slate-500 text-sm mt-0.5">Department Grievance Queue, 4-Level Escalations & Resolution</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                <ShieldCheck size={14} /> Official Officer View
              </span>
            </div>
          </div>

          {/* Interactive KPI Quick-Filter Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            {/* 1. Overdue SLA */}
            <div
              onClick={() => setSelectedKpiFilter(prev => prev === 'overdue' ? 'all' : 'overdue')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${selectedKpiFilter === 'overdue'
                ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/50 shadow-sm'
                : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-xs'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Overdue SLA</p>
                  <p className="text-2xl font-black text-rose-700 mt-0.5">
                    {issues.filter(i => i.isOverdue && i.status !== 'Solved').length}
                  </p>
                  <p className="text-[10px] text-rose-500 mt-0.5">Requires Immediate Action</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-100/70 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle size={20} />
                </div>
              </div>
              {selectedKpiFilter === 'overdue' && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                  Active Filter
                </span>
              )}
            </div>

            {/* 2. Open / In Progress */}
            <div
              onClick={() => setSelectedKpiFilter(prev => prev === 'open' ? 'all' : 'open')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${selectedKpiFilter === 'open'
                ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/50 shadow-sm'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Open / In Progress</p>
                  <p className="text-2xl font-black text-slate-800 mt-0.5">
                    {issues.filter(i => i.status !== 'Solved').length}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Active department tickets</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 flex items-center justify-center text-blue-600 shrink-0">
                  <Clock size={20} />
                </div>
              </div>
              {selectedKpiFilter === 'open' && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                  Active Filter
                </span>
              )}
            </div>

            {/* 3. Escalated In */}
            <div
              onClick={() => setSelectedKpiFilter(prev => prev === 'escalated' ? 'all' : 'escalated')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${selectedKpiFilter === 'escalated'
                ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/50 shadow-sm'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Escalated In</p>
                  <p className="text-2xl font-black text-amber-700 mt-0.5">
                    {issues.filter(i => i.isEscalated && i.status !== 'Solved').length}
                  </p>
                  <p className="text-[10px] text-amber-600 mt-0.5">Handled at L2, L3 or L4</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-600 shrink-0">
                  <Zap size={20} />
                </div>
              </div>
              {selectedKpiFilter === 'escalated' && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                  Active Filter
                </span>
              )}
            </div>

            {/* 4. Solved Tickets */}
            <div
              onClick={() => setSelectedKpiFilter(prev => prev === 'solved' ? 'all' : 'solved')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${selectedKpiFilter === 'solved'
                ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/50 shadow-sm'
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Solved Tickets</p>
                  <p className="text-2xl font-black text-emerald-700 mt-0.5">
                    {issues.filter(i => i.status === 'Solved').length}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Resolution verified</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100/70 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle size={20} />
                </div>
              </div>
              {selectedKpiFilter === 'solved' && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                  Active Filter
                </span>
              )}
            </div>
          </div>

          {/* Unified Compact Filter Bar (Minimalist & De-cluttered) */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              {/* Department Selector */}
              <div className="w-full sm:w-64 shrink-0">
                <CustomSelect
                  value={selectedAuthorityDepartment}
                  onChange={(val: string) => setSelectedAuthorityDepartment(val)}
                  options={['All Departments', 'Hostel, Mess & Laundry', 'Campus Infrastructure & IT', 'Academics & Library', 'Student Life & Sports', 'Health, Well-being & Safety', 'Administration & Support']}
                  placeholder="Select Department..."
                />
              </div>

              {/* Hierarchy Level Pills */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                {[
                  { key: 'All', label: 'All Levels' },
                  { key: '1', label: 'L1: Frontline' },
                  { key: '2', label: 'L2: Mid-Level' },
                  { key: '3', label: 'L3: Senior' },
                  { key: '4', label: 'L4: VC' }
                ].map(lvl => {
                  const deptScoped = issues.filter(i => selectedAuthorityDepartment === 'All Departments' || i.department === selectedAuthorityDepartment);
                  const count = lvl.key === 'All' ? deptScoped.length : deptScoped.filter(i => (i.currentLevel || 1) === parseInt(lvl.key)).length;
                  const isSelected = selectedAuthorityLevel === lvl.key;
                  return (
                    <button
                      key={lvl.key}
                      onClick={() => setSelectedAuthorityLevel(lvl.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                      {lvl.label}
                      <span className="ml-1 text-[10px] opacity-75 font-semibold">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Reset & Counter */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              {(selectedAuthorityDepartment !== 'All Departments' || selectedAuthorityLevel !== 'All' || selectedKpiFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedAuthorityDepartment('All Departments');
                    setSelectedAuthorityLevel('All');
                    setSelectedKpiFilter('all');
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
                >
                  <X size={13} /> Clear Filters
                </button>
              )}
              <span className="text-xs font-bold text-slate-500">
                Showing {
                  issues
                    .filter(i => selectedAuthorityDepartment === 'All Departments' || i.department === selectedAuthorityDepartment)
                    .filter(i => selectedAuthorityLevel === 'All' || (i.currentLevel || 1) === parseInt(selectedAuthorityLevel))
                    .filter(i => {
                      if (selectedKpiFilter === 'overdue') return i.isOverdue && i.status !== 'Solved';
                      if (selectedKpiFilter === 'open') return i.status !== 'Solved';
                      if (selectedKpiFilter === 'escalated') return i.isEscalated && i.status !== 'Solved';
                      if (selectedKpiFilter === 'solved') return i.status === 'Solved';
                      return true;
                    })
                    .length
                } tickets
              </span>
            </div>
          </div>

          {/* Authority Queue Cards */}
          <div className="space-y-4">
            {issues
              .filter(i => selectedAuthorityDepartment === 'All Departments' || i.department === selectedAuthorityDepartment)
              .filter(i => selectedAuthorityLevel === 'All' || (i.currentLevel || 1) === parseInt(selectedAuthorityLevel))
              .filter(i => {
                if (selectedKpiFilter === 'overdue') return i.isOverdue && i.status !== 'Solved';
                if (selectedKpiFilter === 'open') return i.status !== 'Solved';
                if (selectedKpiFilter === 'escalated') return i.isEscalated && i.status !== 'Solved';
                if (selectedKpiFilter === 'solved') return i.status === 'Solved';
                return true;
              })
              .map(issue => {
                const handlerTitle = issue.assignedAuthority || getAuthorityTitle(issue.department, issue.currentLevel || 1);

                return (
                  <Card
                    key={issue.id}
                    onClick={() => openIssueDetails(issue, 'authority-dashboard')}
                    className={`card-hover cursor-pointer group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:border-teal-300 ${issue.statusColor === 'emerald' ? 'card-accent-emerald' :
                      issue.statusColor === 'blue' ? 'card-accent-blue' :
                        issue.statusColor === 'amber' ? 'card-accent-amber' :
                          'card-accent-rose'
                      }`}
                  >
                    <CardHeader className="pb-3 pt-5 px-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{issue.id}</span>

                            {/* Hierarchy Level Badge */}
                            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold border ${(issue.currentLevel || 1) === 4
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : (issue.currentLevel || 1) === 3
                                ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                : (issue.currentLevel || 1) === 2
                                  ? 'bg-sky-100 text-sky-800 border-sky-200'
                                  : 'bg-teal-50 text-teal-800 border-teal-200'
                              }`}>
                              <span>L{issue.currentLevel || 1}: {handlerTitle}</span>
                            </span>

                            {/* SLA Chip */}
                            {issue.isOverdue && issue.status !== 'Solved' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                                <AlertTriangle size={12} /> {issue.slaTimer || 'Overdue'}
                              </span>
                            ) : issue.slaTimer ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                <Clock size={12} /> {issue.slaTimer}
                              </span>
                            ) : null}

                            <span className="text-xs text-slate-400 font-medium ml-auto sm:ml-0">{issue.time}</span>
                          </div>

                          <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                            {issue.title}
                          </CardTitle>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">{issue.department}</span>
                            <span>•</span>
                            <span>{issue.category}</span>
                            <span>•</span>
                            <span className="font-medium text-slate-500">{issue.location}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 self-start lg:self-center">
                          <Badge variant="outline" className={`gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${issue.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            issue.statusColor === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              issue.statusColor === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                            {issue.status === 'Solved' && <CheckCircle size={14} />}
                            {issue.status === 'In Progress' && <Clock size={14} />}
                            {issue.status === 'Seen' && <CheckCircle size={14} className="opacity-70" />}
                            {issue.status === 'Not Started' && <AlertCircle size={14} />}
                            {issue.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Escalation Alert Badge if escalated */}
                    {issue.isEscalated && (
                      <div className="mx-6 mb-3 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap size={15} className="text-amber-600 fill-amber-500 shrink-0" />
                          <span>Escalated from <strong>{issue.escalatedFrom}</strong> • Reason: {issue.escalationReason}</span>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                          Priority Escalation
                        </span>
                      </div>
                    )}

                    <CardContent className="px-6 pb-5 pt-0">
                      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">
                        {issue.description}
                      </p>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Clock size={13} className="text-slate-400" /> Reported {issue.time}
                          </span>
                          <span className="flex items-center gap-1 text-slate-600 font-semibold">
                            <ArrowUp size={13} className="text-teal-600" /> {issue.upvotes} Upvotes
                          </span>
                          {issue.comments && issue.comments.length > 0 && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <MessageSquare size={13} className="text-slate-400" /> {issue.comments.length} Comments
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-end shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-teal-700 bg-teal-50 border border-teal-200/80 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all shadow-xs">
                            Manage Ticket &rarr;
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

            {issues
              .filter(i => selectedAuthorityDepartment === 'All Departments' || i.department === selectedAuthorityDepartment)
              .filter(i => selectedAuthorityLevel === 'All' || (i.currentLevel || 1) === parseInt(selectedAuthorityLevel))
              .filter(i => {
                if (selectedKpiFilter === 'overdue') return i.isOverdue && i.status !== 'Solved';
                if (selectedKpiFilter === 'open') return i.status !== 'Solved';
                if (selectedKpiFilter === 'escalated') return i.isEscalated && i.status !== 'Solved';
                if (selectedKpiFilter === 'solved') return i.status === 'Solved';
                return true;
              })
              .length === 0 && (
                <div className="text-center p-14 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <ShieldCheck size={36} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-700 font-bold text-base">No tickets match active filters</p>
                  <p className="text-slate-400 text-sm mt-1 mb-4">There are no tickets matching your active department, hierarchy level, and KPI filters.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAuthorityDepartment('All Departments');
                      setSelectedAuthorityLevel('All');
                      setSelectedKpiFilter('all');
                    }}
                    className="rounded-xl font-bold text-xs text-teal-700 border-teal-200 hover:bg-teal-50"
                  >
                    Reset All Filters
                  </Button>
                </div>
              )}
          </div>
        </main>
      ) : currentView === 'recent-reported' ? (
        <main className="max-w-4xl mx-auto px-4 pt-8 pb-20 view-slide-in">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => { if (window.history.length > 1) window.history.back(); else navigateTo('dashboard'); }} className="text-teal-700 hover:text-teal-900 p-2 rounded-full hover:bg-teal-50 transition-colors border border-slate-200 bg-white shadow-sm">
              &larr; Back
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Tickets</h1>
              <p className="text-slate-500 text-sm mt-0.5">Track your filed grievances, upvoted campus issues & resolutions.</p>
            </div>
          </div>

          {/* 3 Filter Tabs (Reported by Me, Upvoted by Me, Resolved) */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-6 max-w-xl">
            <button
              onClick={() => setMyTicketsTab('reported')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${myTicketsTab === 'reported'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <span>Reported by Me</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${myTicketsTab === 'reported' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'}`}>
                {issues.filter(i => i.isMine).length}
              </span>
            </button>
            <button
              onClick={() => setMyTicketsTab('upvoted')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${myTicketsTab === 'upvoted'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <span>Upvoted by Me</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${myTicketsTab === 'upvoted' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'}`}>
                {issues.filter(i => i.isLiked).length}
              </span>
            </button>
            <button
              onClick={() => setMyTicketsTab('resolved')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${myTicketsTab === 'resolved'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <span>Resolved</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${myTicketsTab === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                {issues.filter(i => (i.isMine || i.isLiked) && i.status === 'Solved').length}
              </span>
            </button>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {issues
              .filter(issue => {
                if (myTicketsTab === 'reported') return issue.isMine;
                if (myTicketsTab === 'upvoted') return issue.isLiked;
                if (myTicketsTab === 'resolved') return (issue.isMine || issue.isLiked) && issue.status === 'Solved';
                return issue.isMine;
              })
              .map(issue => (
                <Card key={issue.id} onClick={() => openIssueDetails(issue, 'recent-reported')}
                  className={`card-hover cursor-pointer group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:border-teal-300 ${issue.statusColor === 'emerald' ? 'card-accent-emerald' :
                    issue.statusColor === 'blue' ? 'card-accent-blue' :
                      issue.statusColor === 'amber' ? 'card-accent-amber' :
                        'card-accent-rose'
                    }`}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{issue.id}</span>
                          <span className="text-xs font-semibold text-slate-500">
                            Current: <strong className="text-teal-700">L{issue.currentLevel || 1} ({issue.assignedAuthority || getAuthorityTitle(issue.department, issue.currentLevel || 1)})</strong>
                          </span>
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{issue.title}</CardTitle>
                        <CardDescription className="flex flex-wrap gap-2 mt-1.5 items-center font-medium text-xs">
                          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> {issue.category}</span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> {issue.department}</span>
                          <span className="text-slate-300">•</span>
                          <span>{issue.location}</span>
                        </CardDescription>
                      </div>

                      <Badge variant="outline" className={`shrink-0 gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${issue.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        issue.statusColor === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          issue.statusColor === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                        {issue.status === 'Solved' && <CheckCircle size={13} />}
                        {issue.status === 'In Progress' && <Clock size={13} />}
                        {issue.status === 'Seen' && <CheckCircle size={13} className="opacity-70" />}
                        {issue.status === 'Not Started' && <AlertCircle size={13} />}
                        {issue.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm line-clamp-2">{issue.description}</p>
                    <div className="text-xs text-slate-400 font-bold tracking-wide mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} /> REPORTED {issue.time.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (issue.status === 'Solved') return;
                          setIssues(prev => prev.map(item => {
                            if (item.id === issue.id) {
                              const nextLiked = !item.isLiked;
                              return {
                                ...item,
                                isLiked: nextLiked,
                                upvotes: item.upvotes + (nextLiked ? 1 : -1)
                              };
                            }
                            return item;
                          }));
                        }}
                        disabled={issue.status === 'Solved'}
                        title={issue.status === 'Solved' ? 'Issue solved · Upvotes closed' : issue.isLiked ? 'Remove upvote' : 'Upvote problem'}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${issue.status === 'Solved'
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                          : issue.isLiked
                            ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 cursor-pointer'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-teal-50 hover:text-teal-700 cursor-pointer'
                          }`}
                      >
                        <ArrowUp size={13} className={issue.isLiked ? 'text-teal-600 font-extrabold' : ''} /> {issue.upvotes}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {issues.filter(issue => {
              if (myTicketsTab === 'reported') return issue.isMine;
              if (myTicketsTab === 'upvoted') return issue.isLiked;
              if (myTicketsTab === 'resolved') return (issue.isMine || issue.isLiked) && issue.status === 'Solved';
              return issue.isMine;
            }).length === 0 && (
                <div className="text-center p-14 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <CheckCircle size={36} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-700 font-bold text-base">No tickets in this tab</p>
                  <p className="text-slate-400 text-sm mt-1 mb-4">
                    {myTicketsTab === 'reported'
                      ? "You haven't submitted any grievances yet."
                      : myTicketsTab === 'upvoted'
                        ? "You haven't upvoted any tickets yet."
                        : "No tickets in your list have been resolved yet."}
                  </p>
                  {myTicketsTab === 'reported' && (
                    <Button onClick={() => navigateTo('report')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl">
                      Report a Problem
                    </Button>
                  )}
                </div>
              )}
          </div>
        </main>
      ) : currentView === 'issue-details' ? (
        selectedIssue ? (
          <main className="max-w-5xl mx-auto px-4 pt-10 pb-20 view-slide-in">
            <div className="bg-white border border-slate-200 shadow-md shadow-slate-100/60 rounded-2xl p-6 md:p-10 mb-8">
              <button
                onClick={() => {
                  if (issueSourceView === 'authority-dashboard') {
                    navigateTo('authority-dashboard');
                  } else if (issueSourceView === 'recent-reported') {
                    navigateTo('recent-reported');
                  } else {
                    navigateTo('dashboard');
                  }
                }}
                className="text-teal-600 font-bold mb-6 flex items-center gap-1 hover:text-teal-800 transition-colors cursor-pointer"
              >
                &larr; Back to {issueSourceView === 'authority-dashboard' ? 'Authority Workspace' : issueSourceView === 'recent-reported' ? 'My Tickets' : 'Home'}
              </button>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-500">{selectedIssue.id}</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${selectedIssue.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    selectedIssue.statusColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      selectedIssue.statusColor === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                    {selectedIssue.status === 'Solved' && <CheckCircle size={14} />}

                    {selectedIssue.status === 'Seen' && <CheckCircle size={14} className="opacity-70" />}
                    {selectedIssue.status === 'Not Started' && <AlertCircle size={14} />}
                    {selectedIssue.status}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-slate-500"><Clock size={16} /> Reported {selectedIssue.time}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">{selectedIssue.title}</h1>

              {/* 4-Level Authority Hierarchy Pipeline */}
              <div className="mb-8 p-6 bg-slate-50/90 border border-slate-200 rounded-3xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Hierarchy Escalation Pipeline</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">{selectedIssue.department}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      {selectedIssue.status === 'Solved' ? 'Resolved by Authority: ' : 'Current Assigned Authority: '}
                      <strong className="text-teal-700 font-extrabold text-base">
                        {selectedIssue.assignedAuthority || getAuthorityTitle(selectedIssue.department, selectedIssue.currentLevel || 1)}
                      </strong>
                      <span className="text-xs font-bold text-slate-500 ml-2">
                        ({selectedIssue.status === 'Solved' ? `Resolved at Level ${selectedIssue.currentLevel || 1}` : `Level ${selectedIssue.currentLevel || 1}`})
                      </span>
                    </p>
                  </div>
                  {selectedIssue.isEscalated && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-100/80 text-amber-900 border border-amber-300 text-xs font-bold shadow-sm self-start sm:self-auto">
                      <Zap size={14} className="text-amber-600 fill-amber-500" />
                      <span>Escalated from {selectedIssue.escalatedFrom} • {selectedIssue.escalationReason}</span>
                    </div>
                  )}
                </div>

                {/* Step Flow Nodes */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 relative pt-2">
                  {[1, 2, 3, 4].map((lvl) => {
                    const levelTitle = getAuthorityTitle(selectedIssue.department, lvl);
                    const curLvl = selectedIssue.currentLevel || 1;
                    const isPast = lvl < curLvl;
                    const isCurrent = lvl === curLvl;
                    const isSolved = selectedIssue.status === 'Solved';

                    return (
                      <div key={lvl} className="flex flex-col items-center text-center relative group">
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-extrabold text-xs sm:text-sm mb-2 transition-all ${isCurrent
                          ? isSolved
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-md scale-105'
                            : 'bg-teal-600 text-white ring-4 ring-teal-200 shadow-md scale-105'
                          : isPast
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-white text-slate-400 border border-slate-200'
                          }`}>
                          {isPast || (isCurrent && isSolved) ? <Check size={18} strokeWidth={2.5} /> : `L${lvl}`}
                        </div>
                        <span className={`text-[11px] sm:text-xs font-bold leading-tight max-w-[120px] ${isCurrent
                          ? (isSolved ? 'text-emerald-900 font-extrabold' : 'text-teal-900 font-extrabold')
                          : isPast
                            ? 'text-slate-700'
                            : 'text-slate-400'
                          }`}>
                          {levelTitle}
                        </span>
                        <span className={`text-[10px] mt-1 font-semibold ${isCurrent
                          ? (isSolved ? 'text-emerald-600 font-bold uppercase tracking-wider' : 'text-teal-600 uppercase tracking-wider')
                          : 'text-slate-400'
                          }`}>
                          {isCurrent
                            ? (isSolved ? 'Resolved Here' : 'Active Now')
                            : lvl === 4
                              ? 'Supreme'
                              : `Level ${lvl}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* When viewing in Authority Workspace mode, allow immediate action */}
              {userRole === 'authority' && issueSourceView === 'authority-dashboard' && (
                <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          <ShieldCheck className="text-teal-600" size={20} /> Authority Actions
                        </h3>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                          Workspace Action Mode
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm mt-0.5">Take immediate official action on this ticket in your department queue.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleAcknowledge(selectedIssue.id, e)}
                        disabled={selectedIssue.status === 'In Progress' || selectedIssue.status === 'Solved'}
                        className={`rounded-xl text-xs font-bold gap-1.5 ${selectedIssue.status === 'In Progress' || selectedIssue.status === 'Solved'
                          ? 'bg-slate-100 text-slate-400 border-slate-200'
                          : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50 shadow-sm'
                          }`}
                      >
                        <CheckCircle size={14} />
                        {selectedIssue.status === 'In Progress' ? 'Acknowledged' : 'Acknowledge'}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleOpenPostUpdate(selectedIssue, e)}
                        className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200 rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                      >
                        <MessageSquare size={14} />
                        Post Update
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleOpenEscalate(selectedIssue, e)}
                        disabled={(selectedIssue.currentLevel || 1) >= 4 || selectedIssue.status === 'Solved'}
                        className={`rounded-xl text-xs font-bold gap-1.5 ${(selectedIssue.currentLevel || 1) >= 4 || selectedIssue.status === 'Solved'
                          ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                          : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
                          }`}
                      >
                        <Zap size={14} className="text-amber-600" />
                        Escalate Level
                      </Button>

                      <Button
                        size="sm"
                        onClick={(e) => handleOneClickSolve(selectedIssue.id, e)}
                        disabled={selectedIssue.status === 'Solved'}
                        className={`rounded-xl text-xs font-extrabold gap-1.5 shadow-sm ${selectedIssue.status === 'Solved'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 cursor-default border border-emerald-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                      >
                        <CheckCheck size={15} />
                        {selectedIssue.status === 'Solved' ? 'Resolved' : 'Mark Solved'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* When authority opened from Home Page (Recent Campus Issues), show read-only view like student with clear link to workspace */}
              {userRole === 'authority' && issueSourceView !== 'authority-dashboard' && (
                <div className="mb-8 p-5 bg-gradient-to-r from-teal-50/90 via-emerald-50/50 to-teal-50/90 border border-teal-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">Public Campus Issue View</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full">
                          Read-Only (Student View)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        You are viewing this grievance as students see it. To take official action (Acknowledge, Escalate, Post Update, or Mark Solved), please switch to your Authority Workspace.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setIssueSourceView('authority-dashboard');
                    }}
                    className="bg-[#115e59] hover:bg-[#0f524e] text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    <ShieldCheck size={14} />
                    Take Official Action on Ticket &rarr;
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">Department</p>
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{selectedIssue.department}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">Category</p>
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{selectedIssue.category}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">Specific Issue</p>
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{selectedIssue.specificIssue}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">Location</p>
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{selectedIssue.location}</p>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-sm text-slate-400 font-bold tracking-wider mb-3">DESCRIPTION</p>
                <div className="text-slate-700 bg-slate-50 p-5 md:p-8 rounded-2xl border border-slate-100 text-lg leading-relaxed shadow-inner">
                  {selectedIssue.description}
                </div>
              </div>

              {selectedIssue.imageUrl && (
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm text-slate-400 font-bold tracking-wider mb-3">ATTACHED EVIDENCE</p>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm inline-block w-full sm:w-auto sm:max-w-xl group bg-slate-50">
                    <img
                      src={selectedIssue.imageUrl}
                      alt="Evidence"
                      className="w-full max-h-[400px] object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-100 pt-8">
                {selectedIssue.status !== 'Solved' ? (
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
                    className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all border cursor-pointer ${selectedIssue.isLiked
                      ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
                      }`}
                  >
                    <ThumbsUp size={20} className={selectedIssue.isLiked ? 'fill-teal-700 text-teal-700' : ''} />
                    {selectedIssue.isLiked ? 'Upvoted' : 'Upvote'} ({selectedIssue.upvotes})
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-slate-100 text-slate-500 border border-slate-200">
                    <CheckCircle size={18} className="text-emerald-600" /> Solved • Upvotes Closed ({selectedIssue.upvotes})
                  </div>
                )}
                <button
                  onClick={() => setIsCommenting(true)}
                  className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent px-8 py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  <MessageSquare size={20} /> Add Comment
                </button>
              </div>

              {/* Communication Thread */}
              <div className="mt-10 border-t border-slate-100 pt-8 smooth-enter-up">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-slate-400 font-bold tracking-wider uppercase">Comments & Official Updates</p>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-teal-200/80">
                    <MessageSquare size={13} /> Public Campus Thread
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  {selectedIssue.comments && selectedIssue.comments.map((c: any, i: number) => (
                    <div key={i} className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-100 shadow-sm smooth-enter-up">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">{c.author[0]}</div>
                        <p className="text-sm font-bold text-slate-800">{c.author}</p>
                        <span className="text-slate-400 font-medium text-xs ml-auto">{c.time}</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed pl-9">{c.text}</p>
                    </div>
                  ))}
                  {(!selectedIssue.comments || selectedIssue.comments.length === 0) && (
                    <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                      <MessageSquare size={28} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 font-semibold">No messages yet.</p>
                      <p className="text-slate-400 text-sm mt-1">This thread is open to all students and authorities to post updates and comments.</p>
                    </div>
                  )}
                </div>

                {isCommenting && (
                  <div className="smooth-enter-up p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type your comment or update here..."
                      className="w-full mb-4 resize-none h-24"
                    />
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setIsCommenting(false)} className="px-5 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                      <Button onClick={submitComment} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2 rounded-lg">Post Comment</Button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </main>
        ) : (
          <main className="max-w-5xl mx-auto px-4 pt-10 pb-20 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Issue Not Found</h2>
            <button onClick={() => navigateTo('dashboard')} className="text-teal-600 font-bold hover:underline">Return to Home</button>
          </main>
        )
      ) : (
        /* Report a Problem View */
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 view-slide-in">

          <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/60 rounded-3xl overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-orange-50/30 border-b border-slate-100 p-7 flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-orange-500/25">
                <AlertCircle size={26} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Report a Problem</h2>
                <p className="text-slate-500 text-sm font-medium mt-0.5">Submit an official ticket for fast resolution.</p>
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
                onClick={handleCheckDuplicateAndSubmit}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg py-6 px-10 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Submit Ticket
              </Button>
            </div>

          </div>
        </main>

      )}

      {/* MODAL 1: Authority Post Update Modal */}
      {postUpdateModalOpen && actionTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 smooth-overlay" onClick={() => setPostUpdateModalOpen(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative smooth-enter" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPostUpdateModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Post Official Update</h3>
                <p className="text-xs text-slate-500 font-mono font-medium">{actionTicket.id} • {actionTicket.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Posting as: <strong className="text-teal-700 font-bold">{getAuthorityTitle(actionTicket.department, actionTicket.currentLevel || 1)}</strong> (Level {actionTicket.currentLevel || 1})
            </p>

            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Message</label>
            <Textarea
              value={postUpdateText}
              onChange={(e) => setPostUpdateText(e.target.value)}
              placeholder="e.g. Technician dispatched with replacement parts. Expected resolution in 2 hours..."
              className="w-full mb-6 min-h-[120px] rounded-xl border-slate-200 text-slate-700 font-medium"
            />

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setPostUpdateModalOpen(false)} className="rounded-xl font-bold">
                Cancel
              </Button>
              <Button onClick={handlePostUpdateSubmit} disabled={!postUpdateText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold gap-2">
                <Send size={15} />
                Publish Update
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Authority Escalate Ticket Modal (Clean, Simple & Modern) */}
      {escalateModalOpen && actionTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 smooth-overlay" onClick={() => setEscalateModalOpen(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200/80 relative smooth-enter" onClick={e => e.stopPropagation()}>
            <button onClick={() => setEscalateModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Zap size={20} className="fill-amber-500" />
              </div>
              <div className="min-w-0 pr-6">
                <h3 className="text-lg font-bold text-slate-900">Escalate Ticket</h3>
                <p className="text-xs text-slate-500 font-medium truncate">{actionTicket.id} • {actionTicket.title}</p>
              </div>
            </div>

            {/* Simple Step Progression Strip */}
            {(() => {
              const currentLvl = actionTicket.currentLevel || 1;
              const nextLvl = Math.min(4, currentLvl + 1);
              const prevTitle = getAuthorityTitle(actionTicket.department, currentLvl);
              const nextTitle = getAuthorityTitle(actionTicket.department, nextLvl);
              return (
                <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 mb-5 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-xl bg-slate-200/80 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                      L{currentLvl}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current</p>
                      <p className="text-xs font-semibold text-slate-700 truncate">{prevTitle}</p>
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <ArrowRight size={13} className="stroke-[2.5]" />
                  </div>

                  <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                    <div className="min-w-0 text-right">
                      <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Escalate To</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{nextTitle}</p>
                    </div>
                    <span className="w-8 h-8 rounded-xl bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      L{nextLvl}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Reason Selection (Typable Input) */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Reason for Escalation
              </label>
              <Input
                type="text"
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="Type reason for escalation (e.g. SLA breached, budget approval required)..."
                className="w-full h-10 rounded-xl text-sm text-slate-800 border-slate-200 focus-visible:ring-amber-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['SLA Breached', 'Budget Approval Required', 'Staff Shortage', 'Campus Emergency'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setEscalateReason(tag)}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 border border-slate-200/60 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Note */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Note (Optional)</label>
              <Input
                type="text"
                value={escalateNote}
                onChange={(e) => setEscalateNote(e.target.value)}
                placeholder="Add brief remarks or context..."
                className="w-full h-10 rounded-xl text-sm text-slate-800 border-slate-200 focus-visible:ring-amber-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5">
              <Button variant="outline" onClick={() => setEscalateModalOpen(false)} className="rounded-xl font-semibold h-10 px-4 text-slate-600">
                Cancel
              </Button>
              <Button onClick={handleEscalateSubmit} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold h-10 px-4 gap-2 shadow-sm shadow-amber-600/20">
                <Zap size={14} className="fill-white" />
                Escalate to L{escalateTargetLevel}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AI Duplicate Detection Dialog */}
      {duplicateModalOpen && matchedDuplicate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 smooth-overlay" onClick={() => setDuplicateModalOpen(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative smooth-enter" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDuplicateModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Similar Active Issue Detected!</h3>
                <p className="text-xs text-orange-700 font-semibold">Help prevent duplicate tickets in the queue</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              We found an open ticket matching your report in <strong className="text-slate-800">{matchedDuplicate.department}</strong>. Upvoting an existing complaint helps aggregate student priority rather than dividing authority attention:
            </p>

            {/* Matched Issue Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{matchedDuplicate.id}</span>
                <Badge variant="outline" className="text-xs font-bold bg-white text-teal-700 border-teal-200">
                  {matchedDuplicate.status}
                </Badge>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{matchedDuplicate.title}</h4>
              <p className="text-xs text-slate-500 mb-2 font-medium">{matchedDuplicate.location} • {matchedDuplicate.category}</p>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pt-2 border-t border-slate-200/60">
                <span>Reported {matchedDuplicate.time}</span>
                <span className="text-teal-700 font-bold flex items-center gap-1">
                  <ArrowUp size={13} /> {matchedDuplicate.upvotes} Students Upvoted
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-end">
              <Button
                variant="outline"
                onClick={executeSubmitTicket}
                className="w-full sm:w-auto rounded-xl font-bold text-slate-600 hover:text-slate-800"
              >
                Submit New Ticket Anyway
              </Button>
              <Button
                onClick={handleUpvoteDuplicateAndOpen}
                className="w-full sm:w-auto bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/20 gap-2"
              >
                <ThumbsUp size={16} />
                Upvote Existing Ticket ({matchedDuplicate.upvotes + 1})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer (Only on Dashboard) */}
      {currentView === 'dashboard' && (
        <footer className="mt-auto bg-gradient-to-b from-[#f8fafc] to-teal-50/30 flex flex-col items-center pb-10 pt-10">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent mb-10 max-w-4xl mx-auto"></div>
          <div className="mb-5 hover:-rotate-6 hover:scale-110 transition-all duration-300 cursor-pointer">
            <img src="/logo.png" alt="Resolvelt Logo" className="h-14 w-auto object-contain drop-shadow-md" />
          </div>
          <p className="text-slate-500 text-sm mb-4 flex items-center justify-center gap-1.5 font-medium">
            Crafted with <Heart size={14} className="text-rose-500 fill-rose-500 inline mx-0.5 animate-pulse" /> by
            <span className="font-extrabold tracking-wider ml-0.5 text-base inline-flex">
              <span className="text-rose-500">H</span>
              <span className="text-teal-600">R</span>
              <span className="text-amber-500">T</span>
              <span className="text-violet-500">T</span>
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-6 text-xs sm:text-sm font-bold">
            <span className="px-4 py-1.5 rounded-full bg-rose-50 text-rose-500 border border-rose-200/70 hover:scale-105 hover:shadow-sm transition-all">Hritvika</span>
            <span className="px-4 py-1.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200/70 hover:scale-105 hover:shadow-sm transition-all">Rudra</span>
            <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-500 border border-amber-200/70 hover:scale-105 hover:shadow-sm transition-all">Tanishq</span>
            <span className="px-4 py-1.5 rounded-full bg-violet-50 text-violet-500 border border-violet-200/70 hover:scale-105 hover:shadow-sm transition-all">Tvesha</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">© 2026 Resolvelt · All rights reserved</p>
        </footer>
      )}
    </div>
  );
}
