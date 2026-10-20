import { useState, useEffect } from 'react';
import { PlusCircle, Heart, ShieldCheck, CheckCircle, ArrowUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

import type {
  Issue,
  UserRole,
  IssueSourceView,
} from './types/issue';

import { INITIAL_ISSUES } from './data/mockIssues';
import { useIssues } from './hooks/useIssues';
import { useNotifications } from './hooks/useNotifications';
import { filterIssues, sortIssues, findDuplicateIssue, getIssueAgeMinutes } from './lib/issues';
import { DEPARTMENT_LEVELS } from './taxonomy';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { IssueCard } from './components/issues/IssueCard';
import { IssueFilters } from './components/issues/IssueFilters';
import { IssueDetails } from './components/issues/IssueDetails';
import { ReportIssueForm } from './components/issues/ReportIssueForm';
import { AuthorityDashboard } from './components/authority/AuthorityDashboard';
import { EscalationModal } from './components/authority/EscalationModal';

import {
  RoleSelectionOverlay,
  ProfileModal,
  FeedbackModal,
  ReportBugModal,
  PostUpdateModal,
  DuplicateModal,
} from './components/modals/Modals';

export default function App() {
  const { issues, setIssues, issuesRef, findIssue, addIssue, updateIssue } = useIssues(INITIAL_ISSUES);
  const { notifications, setNotifications, addNotification, clearNotifications } = useNotifications([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [issueSourceView, setIssueSourceView] = useState<IssueSourceView>('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [reportBugOpen, setReportBugOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'Top' | 'New'>('Top');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All Departments');

  const [userRole, setUserRole] = useState<UserRole | null>(
    (localStorage.getItem('resolveit_role') as UserRole) || null
  );
  const [hasSelectedRole, setHasSelectedRole] = useState(!!localStorage.getItem('resolveit_role'));

  const [selectedAuthorityDepartment, setSelectedAuthorityDepartment] = useState('All Departments');
  const [selectedAuthorityLevel, setSelectedAuthorityLevel] = useState<'All' | '1' | '2' | '3' | '4'>('All');
  const [selectedKpiFilter, setSelectedKpiFilter] = useState<'all' | 'overdue' | 'open' | 'escalated' | 'solved'>('all');
  const [myTicketsTab, setMyTicketsTab] = useState<'reported' | 'upvoted' | 'resolved'>('reported');

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Authority & Action States
  const [postUpdateModalOpen, setPostUpdateModalOpen] = useState(false);
  const [actionTicket, setActionTicket] = useState<Issue | null>(null);
  const [postUpdateText, setPostUpdateText] = useState('');

  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('SLA Breached / Unresolved');
  const [escalateNote, setEscalateNote] = useState('');

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [matchedDuplicate, setMatchedDuplicate] = useState<Issue | null>(null);
  const [pendingFormSubmit, setPendingFormSubmit] = useState<any>(null);

  const pushModalState = () => {
    window.history.pushState({ view: currentView, modal: true }, '', '');
  };

  const navigateTo = (view: string) => {
    window.history.pushState({ view }, '', `/${view}`);
    setCurrentView(view);
    if (view === 'authority-dashboard') {
      setUserRole('authority');
      localStorage.setItem('resolveit_role', 'authority');
    }
    if (view !== 'issue-details') {
      setSelectedIssue(null);
    }
    window.scrollTo(0, 0);
  };

  const handleToggleRole = () => {
    const nextRole: UserRole = userRole === 'authority' ? 'student' : 'authority';
    setUserRole(nextRole);
    localStorage.setItem('resolveit_role', nextRole);
    if (nextRole === 'authority') {
      navigateTo('authority-dashboard');
    } else {
      navigateTo('dashboard');
    }
  };

  const openIssueDetails = (issue: Issue, fromView: IssueSourceView = 'dashboard') => {
    setIssueSourceView(fromView);
    setSelectedIssue(issue);
    const query = fromView === 'authority-dashboard' ? `?id=${issue.id}&from=workspace` : `?id=${issue.id}`;
    window.history.pushState({ view: 'issue-details', issueId: issue.id, from: fromView }, '', `/issue-details${query}`);
    setCurrentView('issue-details');
    window.scrollTo(0, 0);
  };

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
        const origin = (stateFrom || (fromParam === 'workspace' ? 'authority-dashboard' : 'dashboard')) as IssueSourceView;
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
      setProfileOpen(false);
      setNotificationsOpen(false);
      setUserMenuOpen(false);
      setSidebarOpen(false);
      setFeedbackOpen(false);
      setReportBugOpen(false);
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

  const getAuthorityTitle = (dept: string, level: number = 1): string => {
    if (DEPARTMENT_LEVELS && DEPARTMENT_LEVELS[dept] && DEPARTMENT_LEVELS[dept][level]) {
      return DEPARTMENT_LEVELS[dept][level];
    }
    if (level === 4) return "VC (Vice-Chancellor)";
    if (level === 3) return "Department Head / Dean";
    if (level === 2) return "Assistant In-Charge";
    return "Department Representative";
  };

  const handleUpvote = (issueId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateIssue(issueId, (issue) => {
      if (issue.status === 'Solved') return issue;
      const nextLiked = !issue.isLiked;
      const updated = {
        ...issue,
        isLiked: nextLiked,
        upvotes: issue.upvotes + (nextLiked ? 1 : -1),
      };
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(updated);
      }
      return updated;
    });
  };

  const handleAddComment = (commentText: string) => {
    if (!selectedIssue) return;
    const commentObj = {
      author: userRole === 'authority' ? 'Authority Representative' : 'Hritvika (You)',
      time: 'Just now',
      text: commentText,
    };

    updateIssue(selectedIssue.id, (issue) => {
      const updated = {
        ...issue,
        comments: [...issue.comments, commentObj],
      };
      setSelectedIssue(updated);
      return updated;
    });

    if (userRole === 'authority') {
      addNotification({
        id: Date.now(),
        title: `New Comment: ${selectedIssue.title}`,
        message: `The authority left a message on your ticket.`,
        time: 'Just now',
        unread: true,
      });
    }
  };

  const handleAcknowledge = (ticketId: string) => {
    updateIssue(ticketId, (issue) => {
      const handlerTitle = getAuthorityTitle(issue.department, issue.currentLevel || 1);
      const updateNote = {
        author: handlerTitle,
        time: 'Just now',
        text: `Ticket acknowledged by ${handlerTitle}. Investigation and remediation have commenced.`,
      };
      const updated = {
        ...issue,
        status: 'In Progress' as const,
        statusColor: 'blue' as const,
        comments: [...issue.comments, updateNote],
      };
      if (selectedIssue && selectedIssue.id === ticketId) setSelectedIssue(updated);
      return updated;
    });

    addNotification({
      id: Date.now(),
      title: 'Ticket Acknowledged',
      message: `Ticket #${ticketId} was acknowledged and moved to In Progress.`,
      time: 'Just now',
      unread: true,
    });
  };

  const handlePostUpdateSubmit = () => {
    if (!actionTicket || !postUpdateText.trim()) return;
    const handlerTitle = getAuthorityTitle(actionTicket.department, actionTicket.currentLevel || 1);
    const updateNote = {
      author: `${handlerTitle} (Official Update)`,
      time: 'Just now',
      text: postUpdateText.trim(),
    };

    updateIssue(actionTicket.id, (issue) => {
      const updated = {
        ...issue,
        comments: [...issue.comments, updateNote],
      };
      if (selectedIssue && selectedIssue.id === actionTicket.id) setSelectedIssue(updated);
      return updated;
    });

    setPostUpdateModalOpen(false);
    setActionTicket(null);
    setPostUpdateText('');
  };

  const handleEscalateSubmit = () => {
    if (!actionTicket) return;
    const prevLvl = actionTicket.currentLevel || 1;
    const nextLvl = Math.min(4, prevLvl + 1);
    const prevTitle = getAuthorityTitle(actionTicket.department, prevLvl);
    const newTitle = getAuthorityTitle(actionTicket.department, nextLvl);
    const finalReason = escalateReason.trim() || 'SLA Breached / Administrative Escalation';

    const escalateLog = {
      author: 'Hierarchy Escalation Engine',
      time: 'Just now',
      text: `Level ${prevLvl} (${prevTitle}) escalated ticket to Level ${nextLvl} (${newTitle}). Reason: ${finalReason}${escalateNote ? ` - Note: "${escalateNote}"` : ''}.`,
    };

    updateIssue(actionTicket.id, (issue) => {
      const updated = {
        ...issue,
        currentLevel: nextLvl,
        assignedAuthority: newTitle,
        isEscalated: true,
        escalatedFrom: `L${prevLvl}: ${prevTitle}`,
        escalationReason: finalReason,
        comments: [...issue.comments, escalateLog],
      };
      if (selectedIssue && selectedIssue.id === actionTicket.id) setSelectedIssue(updated);
      return updated;
    });

    setEscalateModalOpen(false);
    setActionTicket(null);
  };

  const handleSolve = (ticketId: string) => {
    updateIssue(ticketId, (issue) => {
      const handlerTitle = getAuthorityTitle(issue.department, issue.currentLevel || 1);
      const resolvedLog = {
        author: `${handlerTitle} (Resolution)`,
        time: 'Just now',
        text: `Ticket marked as Solved and verified by ${handlerTitle}.`,
      };
      const updated = {
        ...issue,
        status: 'Solved' as const,
        statusColor: 'emerald' as const,
        isOverdue: false,
        slaTimer: 'Solved',
        resolvedAt: 'Just now',
        comments: [...issue.comments, resolvedLog],
      };
      if (selectedIssue && selectedIssue.id === ticketId) setSelectedIssue(updated);
      return updated;
    });
  };

  const handleCheckDuplicateAndSubmit = (formData: any) => {
    const duplicate = findDuplicateIssue(issues, {
      department: formData.department || 'Campus Infrastructure & IT',
      category: formData.category,
      specificIssue: formData.specificIssue,
      building: formData.building,
      title: formData.issueTitle,
    });

    if (duplicate) {
      setMatchedDuplicate(duplicate);
      setPendingFormSubmit(formData);
      setDuplicateModalOpen(true);
      pushModalState();
    } else {
      executeSubmitTicket(formData);
    }
  };

  const executeSubmitTicket = (formData: any) => {
    const effectiveDept = formData.department || 'Campus Infrastructure & IT';
    const effectiveTitle = formData.issueTitle.trim() || formData.specificIssue || 'Campus grievance report';
    const effectiveLocation = formData.building ? (formData.exactLocation ? `${formData.building} - ${formData.exactLocation}` : formData.building) : (formData.exactLocation || 'Campus premises');
    const newId = `TKT-${143 + issues.length}`;

    const newTicket: Issue = {
      id: newId,
      title: effectiveTitle,
      location: effectiveLocation,
      description: formData.detailedDescription.trim() || `Reported issue regarding ${formData.specificIssue || formData.category || 'campus facilities'}.`,
      upvotes: 1,
      status: 'Not Started',
      statusColor: 'rose',
      time: 'Just now',
      department: effectiveDept,
      category: formData.category || 'General / Other Issues',
      specificIssue: formData.specificIssue || 'General Issue',
      imageUrl: formData.capturedImage || undefined,
      isLiked: true,
      isMine: true,
      currentLevel: 1,
      assignedAuthority: getAuthorityTitle(effectiveDept, 1),
      isEscalated: false,
      slaTimer: '24h remaining',
      isOverdue: false,
      comments: [],
    };

    addIssue(newTicket);
    setDuplicateModalOpen(false);
    setPendingFormSubmit(null);
    navigateTo('dashboard');
  };

  const displayedDashboardIssues = filterIssues(issues, {
    department: selectedDepartmentFilter,
    searchQuery,
  }).sort((a, b) => {
    if (filterTab === 'Top') return b.upvotes - a.upvotes;
    return getIssueAgeMinutes(a.time) - getIssueAgeMinutes(b.time);
  });

  return (
    <div className={`min-h-screen bg-[#f8fafc] font-[Inter,system-ui,sans-serif] text-slate-800 flex flex-col ${!hasSelectedRole ? 'overflow-hidden h-screen' : ''}`}>
      <RoleSelectionOverlay
        open={!hasSelectedRole}
        onSelectRole={(role) => {
          localStorage.setItem('resolveit_role', role);
          setUserRole(role);
          setHasSelectedRole(true);
          navigateTo('dashboard');
        }}
      />

      <Navbar
        userRole={userRole}
        onToggleRole={handleToggleRole}
        currentView={currentView}
        navigateTo={navigateTo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        setNotificationsOpen={setNotificationsOpen}
        onClearNotifications={clearNotifications}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        onOpenSidebar={() => { pushModalState(); setSidebarOpen(true); }}
        onOpenProfile={() => { pushModalState(); setProfileOpen(true); }}
        onOpenFeedback={() => { pushModalState(); setFeedbackOpen(true); }}
        onOpenReportBug={() => { pushModalState(); setReportBugOpen(true); }}
        onLogout={() => {
          localStorage.removeItem('resolveit_role');
          setUserRole(null);
          setHasSelectedRole(false);
          setUserMenuOpen(false);
          setSelectedIssue(null);
          navigateTo('dashboard');
        }}
      />

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentView={currentView}
        navigateTo={navigateTo}
        userRole={userRole}
      />

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} userRole={userRole} />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <ReportBugModal open={reportBugOpen} onClose={() => setReportBugOpen(false)} />

      <PostUpdateModal
        open={postUpdateModalOpen}
        onClose={() => setPostUpdateModalOpen(false)}
        actionTicket={actionTicket}
        postUpdateText={postUpdateText}
        setPostUpdateText={setPostUpdateText}
        onSubmit={handlePostUpdateSubmit}
      />

      <EscalationModal
        open={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        actionTicket={actionTicket}
        escalateReason={escalateReason}
        setEscalateReason={setEscalateReason}
        escalateNote={escalateNote}
        setEscalateNote={setEscalateNote}
        onSubmit={handleEscalateSubmit}
      />

      <DuplicateModal
        open={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        matchedDuplicate={matchedDuplicate}
        onSubmitAnyway={() => pendingFormSubmit && executeSubmitTicket(pendingFormSubmit)}
        onUpvoteDuplicate={() => {
          if (matchedDuplicate) {
            handleUpvote(matchedDuplicate.id);
            setDuplicateModalOpen(false);
            openIssueDetails(matchedDuplicate, 'dashboard');
          }
        }}
      />

      {currentView === 'dashboard' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 view-slide-in">
          {/* Welcome Banner */}
          <div className="w-full bg-gradient-to-r from-teal-50/70 via-emerald-50/30 to-teal-50/40 border border-teal-200/90 rounded-3xl p-6 sm:p-7 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-xl shadow-sm shrink-0">
                {userRole === 'authority' ? 'RS' : 'HV'}
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
                  {userRole === 'authority' ? 'Good to see you, Rohit Sir.' : 'Welcome back, Hritvika'}
                </h2>
                <p className="text-slate-500 text-sm mt-0.5 font-medium">
                  {userRole === 'authority' ? 'Review queues, manage escalations, and meet SLAs.' : 'Track your reported complaints or submit a new grievance below.'}
                </p>
              </div>
            </div>
          </div>

          {userRole === 'authority' && (
            <div className="mb-8 smooth-enter-up">
              <div
                onClick={() => navigateTo('authority-dashboard')}
                className="card-hover bg-gradient-to-r from-teal-50/90 via-emerald-50/40 to-teal-50/70 border border-teal-300/80 hover:border-teal-400 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-teal-600 text-white shadow-md flex items-center justify-center shrink-0">
                    <ShieldCheck size={26} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight group-hover:text-teal-700 transition-colors">
                      Authority Workspace
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
                      Review department queues, manage 4-level escalations, and resolve student complaints.
                    </p>
                  </div>
                </div>
                <Button size="lg" className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl ml-auto shrink-0 border-0">
                  <ShieldCheck size={17} /> Go to Workspace &rarr;
                </Button>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div
              onClick={() => navigateTo('report')}
              className="card-hover bg-white border border-orange-200/90 hover:border-orange-300 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-[52px] h-[52px] rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/70 flex items-center justify-center shrink-0">
                  <PlusCircle size={26} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors">
                    Facing a Campus Issue?
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
                    Report it now — your ticket will be routed to the right authority automatically.
                  </p>
                </div>
              </div>
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl ml-auto shrink-0 border-0">
                <PlusCircle size={17} /> Report a Problem
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <IssueFilters
                selectedDepartment={selectedDepartmentFilter}
                onSelectDepartment={setSelectedDepartmentFilter}
                filterTab={filterTab}
                onSelectTab={setFilterTab}
              />
            </div>

            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedDepartmentFilter === 'All Departments' ? 'Recent Campus Issues' : selectedDepartmentFilter}
                </h3>
                <div className="bg-slate-200 p-1 rounded-lg flex text-sm font-bold w-fit">
                  <button onClick={() => setFilterTab('Top')} className={`px-5 py-1.5 rounded-md transition-all ${filterTab === 'Top' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>Trending</button>
                  <button onClick={() => setFilterTab('New')} className={`px-5 py-1.5 rounded-md transition-all ${filterTab === 'New' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>Newest</button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {displayedDashboardIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onClick={() => openIssueDetails(issue, 'dashboard')}
                    onUpvote={(e) => handleUpvote(issue.id, e)}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : currentView === 'authority-dashboard' ? (
        <AuthorityDashboard
          issues={issues}
          selectedDepartment={selectedAuthorityDepartment}
          setSelectedDepartment={setSelectedAuthorityDepartment}
          selectedLevel={selectedAuthorityLevel}
          setSelectedLevel={setSelectedAuthorityLevel}
          selectedKpiFilter={selectedKpiFilter}
          setSelectedKpiFilter={setSelectedKpiFilter}
          onOpenIssueDetails={(issue) => openIssueDetails(issue, 'authority-dashboard')}
          onBackToHome={() => navigateTo('dashboard')}
        />
      ) : currentView === 'recent-reported' ? (
        <main className="max-w-4xl mx-auto px-4 pt-8 pb-20 view-slide-in">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigateTo('dashboard')} className="text-teal-700 hover:text-teal-900 p-2 rounded-full hover:bg-teal-50 transition-colors border border-slate-200 bg-white shadow-sm">
              &larr; Back
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Tickets</h1>
              <p className="text-slate-500 text-sm mt-0.5">Track your filed grievances, upvoted campus issues & resolutions.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-6 max-w-xl">
            <button
              onClick={() => setMyTicketsTab('reported')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${myTicketsTab === 'reported' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'}`}
            >
              <span>Reported by Me</span>
            </button>
            <button
              onClick={() => setMyTicketsTab('upvoted')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${myTicketsTab === 'upvoted' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'}`}
            >
              <span>Upvoted by Me</span>
            </button>
            <button
              onClick={() => setMyTicketsTab('resolved')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${myTicketsTab === 'resolved' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'}`}
            >
              <span>Resolved</span>
            </button>
          </div>

          <div className="space-y-4">
            {issues
              .filter(issue => {
                if (myTicketsTab === 'reported') return issue.isMine;
                if (myTicketsTab === 'upvoted') return issue.isLiked;
                if (myTicketsTab === 'resolved') return (issue.isMine || issue.isLiked) && issue.status === 'Solved';
                return issue.isMine;
              })
              .map(issue => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onClick={() => openIssueDetails(issue, 'recent-reported')}
                  onUpvote={(e) => handleUpvote(issue.id, e)}
                />
              ))}
          </div>
        </main>
      ) : currentView === 'issue-details' ? (
        selectedIssue ? (
          <IssueDetails
            issue={selectedIssue}
            userRole={userRole}
            issueSourceView={issueSourceView}
            onBack={() => {
              if (issueSourceView === 'authority-dashboard') navigateTo('authority-dashboard');
              else if (issueSourceView === 'recent-reported') navigateTo('recent-reported');
              else navigateTo('dashboard');
            }}
            onToggleUpvote={handleUpvote}
            onAddComment={handleAddComment}
            onAcknowledge={handleAcknowledge}
            onOpenPostUpdate={(issue) => { setActionTicket(issue); setPostUpdateText(''); setPostUpdateModalOpen(true); pushModalState(); }}
            onOpenEscalate={(issue) => { setActionTicket(issue); setEscalateReason(''); setEscalateNote(''); setEscalateModalOpen(true); pushModalState(); }}
            onSolve={handleSolve}
            onSwitchToWorkspaceView={() => setIssueSourceView('authority-dashboard')}
          />
        ) : (
          <main className="max-w-5xl mx-auto px-4 pt-10 pb-20 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Issue Not Found</h2>
            <button onClick={() => navigateTo('dashboard')} className="text-teal-600 font-bold hover:underline">Return to Home</button>
          </main>
        )
      ) : (
        <ReportIssueForm
          onSubmitTicket={handleCheckDuplicateAndSubmit}
          onPushModalState={pushModalState}
        />
      )}

      {currentView === 'dashboard' && (
        <footer className="mt-auto bg-gradient-to-b from-[#f8fafc] to-teal-50/30 flex flex-col items-center pb-10 pt-10">
          <p className="text-slate-500 text-sm mb-4 flex items-center justify-center gap-1.5 font-medium">
            Crafted with <Heart size={14} className="text-rose-500 fill-rose-500 inline mx-0.5 animate-pulse" /> by HRTT
          </p>
          <p className="text-xs text-slate-400 font-medium">© 2026 Resolvelt · All rights reserved</p>
        </footer>
      )}
    </div>
  );
}