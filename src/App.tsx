import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Heart, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

import type {
  Issue,
  UserRole,
  IssueSourceView,
  IssueSortMode,
  IssueNotification,
} from './types/issue';

import { filterIssues, findDuplicateIssue, getIssueAgeMinutes } from './lib/issues';
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

import {
  fetchAllTickets,
  submitNewTicket,
  uploadEvidenceImage,
  toggleUpvoteRecord,
  acknowledgeTicketInDb,
  escalateTicketInDb,
  solveTicketInDb,
  postCommentToDb,
} from './lib/supabaseService';

export default function App() {
  // Core Issues State (Fetched from Supabase)
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication & Role
  const [userRole, setUserRole] = useState<UserRole | null>(
    (localStorage.getItem('resolveit_role') as UserRole) || null
  );
  const [hasSelectedRole, setHasSelectedRole] = useState(!!localStorage.getItem('resolveit_role'));

  // Navigation & View Routing
  const [currentView, setCurrentView] = useState('dashboard');
  const [issueSourceView, setIssueSourceView] = useState<IssueSourceView>('dashboard');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // UI Drawer & Header Controls
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<IssueNotification[]>([]);

  // Modals
  const [profileOpen, setProfileOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [reportBugOpen, setReportBugOpen] = useState(false);

  // Authority Action Modals
  const [postUpdateModalOpen, setPostUpdateModalOpen] = useState(false);
  const [actionTicket, setActionTicket] = useState<Issue | null>(null);
  const [postUpdateText, setPostUpdateText] = useState('');

  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('SLA Breached / Unresolved');
  const [escalateNote, setEscalateNote] = useState('');

  // Duplicate Check Modal
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [matchedDuplicate, setMatchedDuplicate] = useState<Issue | null>(null);
  const [pendingFormSubmit, setPendingFormSubmit] = useState<any>(null);

  // Filters & Tabs
  const [filterTab, setFilterTab] = useState<IssueSortMode>('Top');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All Departments');
  const [selectedAuthorityDepartment, setSelectedAuthorityDepartment] = useState('All Departments');
  const [selectedAuthorityLevel, setSelectedAuthorityLevel] = useState<'All' | '1' | '2' | '3' | '4'>('All');
  const [selectedKpiFilter, setSelectedKpiFilter] = useState<'all' | 'overdue' | 'open' | 'escalated' | 'solved'>('all');
  const [myTicketsTab, setMyTicketsTab] = useState<'reported' | 'upvoted' | 'resolved'>('reported');

  // Supabase Data Refresh
  const refreshTickets = useCallback(async () => {
    setLoading(true);
    const liveIssues = await fetchAllTickets();
    setIssues(liveIssues);

    // If viewing issue details, refresh selected issue
    if (selectedIssue) {
      const updated = liveIssues.find((i) => i.id === selectedIssue.id);
      if (updated) setSelectedIssue(updated);
    }
    setLoading(false);
  }, [selectedIssue]);

  useEffect(() => {
    void refreshTickets();
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

  // Browser Navigation & History Handling
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

      const stateView = e.state?.view || 'dashboard';
      setCurrentView(stateView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Supabase Database Action Handlers
  const handleCheckDuplicateAndSubmit = async (formData: any) => {
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
      await executeSubmitTicket(formData);
    }
  };

  const executeSubmitTicket = async (formData: any) => {
    let uploadedUrl: string | null = null;
    if (formData.capturedImage) {
      uploadedUrl = await uploadEvidenceImage(formData.capturedImage);
    }

    const effectiveDept = formData.department || 'Campus Infrastructure & IT';
    const effectiveTitle = formData.issueTitle.trim() || formData.specificIssue || 'Campus grievance report';

    await submitNewTicket({
      departmentName: effectiveDept,
      categoryName: formData.category,
      specificIssue: formData.specificIssue,
      title: effectiveTitle,
      building: formData.building,
      exactLocation: formData.exactLocation || 'Campus premises',
      description: formData.detailedDescription.trim() || `Reported issue regarding ${formData.specificIssue || formData.category || 'campus facilities'}.`,
      isConfidential: formData.isConfidential,
      imageUrl: uploadedUrl,
      assignedAuthority: getAuthorityTitle(effectiveDept, 1),
    });

    setDuplicateModalOpen(false);
    setPendingFormSubmit(null);
    await refreshTickets();
    navigateTo('dashboard');
  };

  const handleUpvote = async (issueId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = issues.find((i) => i.id === issueId);
    if (!target || target.status === 'Solved') return;

    await toggleUpvoteRecord(issueId, target.isLiked);
    await refreshTickets();
  };

  const handleAddComment = async (commentText: string) => {
    if (!selectedIssue) return;
    const authorName = userRole === 'authority' ? 'Authority Representative' : 'Hritvika (You)';
    await postCommentToDb(selectedIssue.id, authorName, commentText);
    await refreshTickets();
  };

  const handleAcknowledge = async (ticketId: string) => {
    const target = issues.find((i) => i.id === ticketId);
    if (!target) return;
    const handlerTitle = getAuthorityTitle(target.department, target.currentLevel || 1);

    await acknowledgeTicketInDb(ticketId, handlerTitle);
    await refreshTickets();
  };

  const handlePostUpdateSubmit = async () => {
    if (!actionTicket || !postUpdateText.trim()) return;
    const handlerTitle = getAuthorityTitle(actionTicket.department, actionTicket.currentLevel || 1);

    await postCommentToDb(actionTicket.id, `${handlerTitle} (Official Update)`, postUpdateText.trim());
    setPostUpdateModalOpen(false);
    setActionTicket(null);
    setPostUpdateText('');
    await refreshTickets();
  };

  const handleEscalateSubmit = async () => {
    if (!actionTicket) return;
    const prevLvl = actionTicket.currentLevel || 1;
    const nextLvl = Math.min(4, prevLvl + 1);
    const prevTitle = getAuthorityTitle(actionTicket.department, prevLvl);
    const nextTitle = getAuthorityTitle(actionTicket.department, nextLvl);
    const finalReason = escalateReason.trim() || 'SLA Breached / Administrative Escalation';

    await escalateTicketInDb(actionTicket.id, nextLvl, nextTitle, prevTitle, finalReason, escalateNote);
    setEscalateModalOpen(false);
    setActionTicket(null);
    await refreshTickets();
  };

  const handleSolve = async (ticketId: string) => {
    const target = issues.find((i) => i.id === ticketId);
    if (!target) return;
    const handlerTitle = getAuthorityTitle(target.department, target.currentLevel || 1);

    await solveTicketInDb(ticketId, handlerTitle);
    await refreshTickets();
  };

  // Filtered & Sorted Issues List
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
        onClearNotifications={() => setNotifications([])}
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
            void handleUpvote(matchedDuplicate.id);
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
            <button onClick={refreshTickets} className="flex items-center gap-2 text-xs font-bold text-teal-700 bg-white border border-teal-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-teal-50 transition-colors self-start md:self-auto">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Database
            </button>
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
                    onUpvote={(e) => void handleUpvote(issue.id, e)}
                  />
                ))}
                {displayedDashboardIssues.length === 0 && (
                  <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <p className="text-slate-500 font-bold">No issues found matching selected filter.</p>
                  </div>
                )}
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
                  onUpvote={(e) => void handleUpvote(issue.id, e)}
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
            onToggleUpvote={(id) => void handleUpvote(id)}
            onAddComment={(txt) => void handleAddComment(txt)}
            onAcknowledge={(id) => void handleAcknowledge(id)}
            onOpenPostUpdate={(issue) => { setActionTicket(issue); setPostUpdateText(''); setPostUpdateModalOpen(true); pushModalState(); }}
            onOpenEscalate={(issue) => { setActionTicket(issue); setEscalateReason(''); setEscalateNote(''); setEscalateModalOpen(true); pushModalState(); }}
            onSolve={(id) => void handleSolve(id)}
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
            Crafted with <Heart size={14} className="text-rose-500 fill-rose-500 inline mx-0.5 animate-pulse" /> by
            <span className="text-rose-500">H</span>
            <span className="text-teal-600">R</span>
            <span className="text-amber-500">T</span>
            <span className="text-violet-500">T</span>
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